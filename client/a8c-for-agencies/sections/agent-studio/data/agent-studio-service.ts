import { mockAgentStudioService } from './mock-agent-studio-service';
import { wpcomAgentStudioService } from './wpcom-agent-studio-service';
import type { AgentStudioService } from '../types';

/**
 * Project CRUD and `suggestOnePagerContent` still hit the mock service —
 * project UI ships in a follow-up PR, and suggest content has no
 * backend endpoint yet. Output endpoints (list / create / delete) go
 * through the real wpcom service which calls `/a4a/outputs` and
 * `/a4a/runs`. The wpcom service falls back to the mock per-method for
 * any method that doesn't have a real backend yet.
 */
export const agentStudioService: AgentStudioService = wpcomAgentStudioService;
export { mockAgentStudioService };
