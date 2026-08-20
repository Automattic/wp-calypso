import { getAgentManager } from '@automattic/agenttic-client';
import { getResolvedAgentId } from './resolved-agent-id';

export function discardCurrentAgentsManagerAgent(): void {
	const agentId = getResolvedAgentId();
	if ( ! agentId ) {
		return;
	}

	const agentManager = getAgentManager();
	if ( ! agentManager.hasAgent( agentId ) ) {
		return;
	}

	agentManager.abortCurrentRequest( agentId );
	agentManager.removeAgent( agentId );
}
