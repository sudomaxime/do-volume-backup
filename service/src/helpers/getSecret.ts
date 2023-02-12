import fs from 'fs';
import * as logger from './logger';

/**
 * Helper function to load environment variables in local
 * development mode or docker secrets in production.
 * 
 * @author Maxime Nadeau
 */
export default function getSecret (secretName) {
  const env = process.env.NODE_ENV;
  
  if (env === "development") {
    if(process.env[secretName]) return process.env[secretName];
    logger.environmentConfigurationError(secretName)
    process.exit(1)
  }

  try {
    const result = fs.readFileSync(`/run/secrets/${secretName}`, 'utf8').replace(/(\r\n|\n|\r)/gm, '');
    return result;
  } catch(err: any) {
    if (process.env[secretName]) return process.env[secretName];
    logger.environmentConfigurationError(secretName)
    process.exit(1)
  }
}