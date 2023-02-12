import yargs from "yargs";
import { hideBin } from 'yargs/helpers';
import { ActionType } from "../lib/OrchestratorParams";
import type OrchestratorParams from '../lib/OrchestratorParams'

export default function (): OrchestratorParams {
  const argv = yargs(hideBin(process.argv))
    .usage('Usage: --endpoint [SPACE_ENDPOINT] --bucket [BUCKET_NAME] --folder [REMOTE_FOLDER_NAME]')
    .command("push", "push files on s3")
    .command("pull", "pull files from s3")
    .options({
      endpoint: {type: 'string', demandOption: true, alias: 'e'},
      bucket: {type: 'string', demandOption: true, alias: 'b'},
      name: {type: 'string', demandOption: true, alias: 'n'}
    })
    .parseSync();

  const action = String(argv._[0]) as ActionType;

  return {
    endpoint: argv.endpoint,
    bucket: argv.bucket,
    name: argv.name,
    actionType: action
  }
}