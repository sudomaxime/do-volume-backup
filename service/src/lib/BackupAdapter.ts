import S3 from 'aws-sdk/clients/s3';
import getSecret from "../helpers/getSecret"
import fs from "fs-extra";
import tar from "tar";
import stream from "stream";
import PathDefaults from './PathDefaults';
import type OrchestratorParams from './OrchestratorParams';
import * as logger from '../helpers/logger';

/**
 * A stream passthrough along with it's async promise resolver. This is used
 * to create writeThrough pipelines with asynchronous error handlers. It is
 * usefull because the s3 package doesn't provide layer transports for streams.
 */
type WriteStreamPromise = {
  writeStream: stream.PassThrough, 
  promise: Promise<S3.ManagedUpload.SendData>
}

/**
 * All the known error types that can be produced by the user.
 */
enum KnownUserErrorTypes {
  UNKNOWN_ENDPOINT = 'UnknownEndpoint',
  NO_SUCH_BUCKET = 'NoSuchBucket',
  INVALID_ACCESS_KEY_ID = 'InvalidAccessKeyId',
  SIGNATURE_DOESNT_MATCH = 'SignatureDoesNotMatch',
  NO_SUCH_KEY = 'NoSuchKey'
}

/**
 * Contains all the methods necessary to bring files from and to the remote
 * bucket, archive or de-archive them. This class expose it's public interface
 * to the Orchestrator for users to safely use.
 * 
 * @see Orchestrator.ts
 */
export default abstract class BackupAdapter extends PathDefaults {
  protected name: string;
  private endpoint: string;
  private bucket: string;
  private s3: S3;
  public hasError: boolean = false;

  constructor(config: OrchestratorParams) {
    super();
    this.endpoint = config.endpoint;
    this.bucket = config.bucket;
    this.name = config.name;

    this.s3 = new S3({
      endpoint: this.endpoint,
      accessKeyId: getSecret("DO_SPACE_KEY"),
      secretAccessKey: getSecret("DO_SPACE_SECRET")
    });
  }

  /**
   * Tars the image target folder, and streams it to a remote bucket solution.
   * Provides a console log with the target key.
   */
   public async push (): Promise<void> {
    console.log("Creating tar archive stream to spaces ...");
    const timestamp = +new Date;
    const filename = this.name + `-${timestamp}.tar`;
    const {writeStream, promise} = this.uploadFileStreamByKey(filename)
    
    tar
      .create({filter: this.onTarFilterLog}, [BackupAdapter.UPLOAD_FOLDER_PATH])
      .on('end', () => logger.compressSuccess())
      .pipe(writeStream);

    try {
      await promise;
      logger.pushSuccess(filename);
    } catch (err: any) {
      this.hasError = true;
      this.handleError(err);
    }
  }

  /**
   * Allows tar to ouput file paths as they are being packed. 
   * 
   * @see this.push
   * @param path {string} - Filepath
   * @returns true
   */
  private onTarFilterLog (path: string): true {
    const target = path.replace(`/${BackupAdapter.UPLOAD_FOLDER_NAME}`, '');
    console.log(`Packing: ${target}`);
    return true; // to allow packing file.
  }

  /**
   * Allows tar to ouput file paths as they are being unpacked
   * 
   * @see this.pull
   * @param entry {any} - tar file object 
   */
  private onTarEntryLog (entry: any) {
    const target = entry.path.replace(`${BackupAdapter.UPLOAD_FOLDER_NAME}`, '');
    console.log(`Extracting: ${target}`)
  }

  /**
   * Function to securely recieve a backup from a remote space tarball.
   * 
   * Pulls a tar archive from the spaces repository, cleans the target folder
   * extracts all the components of the tar and deletes the tar.
   * 
   * @param key - Remote spaces file key
   */
  public async pull (key: string): Promise<void> {
    try {
      console.log("Removing old files ...");
      this.emptyLocalDownloadFolder();
      await this.writeStreamFileBySpaceKey(key);
      await this.extractAndCleanupTar(key);
  
      logger.pullSuccess();
    } catch (err) {
      this.handleError(err)
    }
  }

    /**
   * Handles program errors and send back the corresponding logger message to
   * help the user.
   * 
   * @param err {any} - Known or unknown error format
   * @returns 
   */
  private handleError (err) {
    if (!err?.code) {
      logger.unknownError();
      console.log(err);
      return;
    }

    const code = err.code as KnownUserErrorTypes;

    if (code === KnownUserErrorTypes.UNKNOWN_ENDPOINT) {
      logger.unknownEndpoint(err.hostname)
      return;
    }

    if (code === KnownUserErrorTypes.NO_SUCH_BUCKET) {
      logger.noSuchBucketError(this.bucket)
      return;
    }

    if (code === KnownUserErrorTypes.INVALID_ACCESS_KEY_ID) {
      logger.invalidAccessKeyId()
      return;
    }

    if (code === KnownUserErrorTypes.SIGNATURE_DOESNT_MATCH) {
      logger.signatureDoesNotMatch()
      return;
    }

    if (code === KnownUserErrorTypes.NO_SUCH_KEY) {
      logger.noSuchKey(this.name);
      return;
    }

    logger.unknownUserErrorCode(code);
    process.exit(1);
  }

  /**
   * Creates a file stream to be used in a download pipeline or file write
   * operation.
   * 
   * @param key - Remote spaces file key
   * @returns stream.PassThrough
   */
  private uploadFileStreamByKey (key): WriteStreamPromise {
    const writeStream = new stream.PassThrough();

    const params = {
      Bucket: this.bucket,
      Key: key,
      Body: writeStream,
      ACL: "private"
    };
  
    const promise = this.s3.upload(params, (error, data) => {
      if (error) writeStream.emit('error', error); 
    }).promise();

    return {
      writeStream,
      promise
    }
  }

  /**
   * Empties the download folder target.
   */
  private emptyLocalDownloadFolder (): void {
    fs.readdirSync(BackupAdapter.DOWNLOAD_FOLDER_PATH).forEach(f => {
      fs.rmSync(`${BackupAdapter.DOWNLOAD_FOLDER_PATH}/${f}`, {
        recursive: true, 
        force: true
      })
    });
  }

  /**
   * Extracts a tarfile by filename (same name as remote key), also deletes
   * and cleanups the remaining tarfile from disk.
   */
  private async extractAndCleanupTar (key: string): Promise<void> {
    console.log("Extracting tar ...")
    const tarfilePath = BackupAdapter.DOWNLOAD_FOLDER_PATH + "/" + key;

    await tar.extract({
      file: tarfilePath, 
      cwd: BackupAdapter.DOWNLOAD_FOLDER_PATH, 
      // We remove the image temporary folder path from the tar 
      // so the first directory is the actual volume files
      // see tar documentation.
      strip: 1,
      onentry: this.onTarEntryLog
    });

    console.log("Removing tar file ...");
    fs.removeSync(tarfilePath);
  }

  /**
   * Takes a remote file from a spaces or a bucket and writes it locally 
   * by streaming packets. Can be used for very large files.
   * 
   * @param key - Remote spaces file key
   * @returns Promise<string> - local tar file path
   */
   private writeStreamFileBySpaceKey (key): Promise<string> {
    return new Promise ((resolve, reject) => {
      const tarfilePath = BackupAdapter.DOWNLOAD_FOLDER_PATH + "/" + key;
      
      var params = {
        Bucket: this.bucket,
        Key: key
      };
      
      console.log("Fetching file on spaces:", key);
      const file = fs.createWriteStream(tarfilePath);
      
      this.s3.getObject(params)
        .createReadStream()
        .on('error', err => reject(err))
        .pipe(file)
        .on('finish', err => {
          if (err) return reject(err);
          resolve(tarfilePath);
        });
    });
  }
}