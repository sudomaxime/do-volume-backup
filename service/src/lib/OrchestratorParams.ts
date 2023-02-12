export enum ActionType {
  PUSH = 'push',
  PULL = 'pull'
}

type OrchestratorParams = {
  endpoint: string
  bucket: string
  name: string,
  actionType: ActionType
}

export default OrchestratorParams;