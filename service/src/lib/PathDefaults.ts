import path from "path";

/**
 * @important DO NOT MERELY CHANGE THESE CONFIGURATIONS, THIS PACKAGE IS
 * USED FOR MANY BACKUP INTEGRATIONS AND THEY COULD BREAK BACKUP SCRIPTS
 * ON MANY SERVICES !
 * 
 * Configurations for the image path defaults. These configurations should
 * always match the volumes binded to this image. You can bind any volume
 * to these folders, be careful if you change these defaults.
 * 
 * @author sudomaxime
 */
export default abstract class PathDefaults {
  static UPLOAD_FOLDER_NAME = "push";
  static DOWNLOAD_FOLDER_NAME = "pull";
  static UPLOAD_FOLDER_PATH = path.resolve(process.cwd(), "../../", PathDefaults.UPLOAD_FOLDER_NAME);
  static DOWNLOAD_FOLDER_PATH = path.resolve(process.cwd(), "../../", PathDefaults.DOWNLOAD_FOLDER_NAME);
}