import { mockAgentStudioService } from './mock-agent-studio-service';
import { wpcomAgentStudioService } from './wpcom-agent-studio-service';
import type { AgentStudioService } from '../types';

export const agentStudioService: AgentStudioService = wpcomAgentStudioService;
export { mockAgentStudioService };
