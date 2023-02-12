import BackupAdapter from "./BackupAdapter";
import type OrchestratorParams from "./OrchestratorParams";
import { ActionType } from './OrchestratorParams'

/**
 * Orchestrates the terminal command with the internal methods of this package
 * the orchestrator is the only public facade for the user
 */
export default class Orchestrator extends BackupAdapter {
  private actionType: string;

  constructor (config: OrchestratorParams) {
    super(config);
    this.actionType = config.actionType;
  }

  public async run() {
    if (this.actionType === ActionType.PULL) {
      await this.pull(this.name);
      return;
    }

    if (this.actionType === ActionType.PUSH) {
      await this.push();
      return;
    }

    console.log(`Could not find a command using '${this.actionType}', try --help to find out the different command and options possible.`);
    process.exit(0)
  }
}