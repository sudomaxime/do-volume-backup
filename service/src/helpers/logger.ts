export function pullSuccess () {
  console.log("\n=============================================================================");
  console.log("✔️ All Done updating files !\n")
  console.log("\x1b[2mYou can now restart the services that use these files.\x1b[0m")
  console.log("=============================================================================\n");
}

export function pushSuccess (filename) {
  console.log("\n✔️ All Done sending !\n")
  console.log("=============================================================================");
  console.log(`📁 Archive name is: \x1b[43m\x1b[30m${filename}\x1b[0m\n`);
  console.log("\x1b[2mYou can share this fileName to a coworker, or keep it to pull it again later.\x1b[0m")
  console.log("=============================================================================\n");
}

export function compressSuccess () {
  console.log("Files sucessfully retrived. Preparing upload to spaces ...")
}

export function environmentConfigurationError (secretName) {
  console.warn(`\x1b[31mMissing env variable or secret ${secretName}, please read the documentation to properly configure your backup script.\x1b[0m`);
}

export function noSuchBucketError (bucketName) {
  console.warn(`\x1b[31mCould not find a bucket with the name: "${bucketName}", please check your configurations.\x1b[0m`);
}

export function unknownError () {
  console.warn(`\x1b[31mThere was an unknown error in trying to send your file, please validate your configuration and try again.\x1b[0m`);
}

export function unknownEndpoint (endpoint) {
  console.warn(`\x1b[31mWe could not resolve your bucket endpoint: "${endpoint}", please check your configurations.\x1b[0m`);
}

export function noSuchKey (key) {
  console.warn(`\x1b[31mWe could not resolve your file with this key: "${key}", please check your configurations.\x1b[0m`);
}

export function invalidAccessKeyId () {
  console.warn(`\x1b[31mYour acces key ID is invalid, please check your configuration.\x1b[0m`);
}

export function signatureDoesNotMatch () {
  console.warn(`\x1b[31mYour spaces access key doesn't seem to be valid, please check your configuration.\x1b[0m`);
}

export function unknownUserErrorCode (code) {
  console.warn(`\x1b[31mAn unknown error with the code ${code} has been raised by your space configuration, please ensure that your configuration and your spaces is properly setup.\x1b[0m`);
}