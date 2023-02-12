import dotenv from 'dotenv';
import Command from './lib/Orchestrator';
import argsParser from './helpers/argsParser';

dotenv.config();

void (async function () {  
  const args = argsParser();
  const orchestrator = new Command(args);
  await orchestrator.run();
})();