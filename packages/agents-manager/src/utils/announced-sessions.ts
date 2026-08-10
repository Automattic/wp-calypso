/**
 * Module bridge for the session IDs the live agents announced via
 * `onSessionIdChange`. The agent config's callback records them here so
 * `AgentSetup` can tell tab storage catching up to the running conversation
 * from a genuine conversation switch.
 */
import { ORCHESTRATOR_AGENT_ID } from '../constants';

const announcedSessionIds = new Map< string, string >();

export function setAnnouncedSessionId( sessionId: string, agentId?: string ): void {
	announcedSessionIds.set( agentId ?? ORCHESTRATOR_AGENT_ID, sessionId );
}

export function getAnnouncedSessionId( agentId?: string ): string | undefined {
	return announcedSessionIds.get( agentId ?? ORCHESTRATOR_AGENT_ID );
}

/** Forget an agent's announced session. Call wherever its agent is removed. */
export function clearAnnouncedSessionId( agentId?: string ): void {
	announcedSessionIds.delete( agentId ?? ORCHESTRATOR_AGENT_ID );
}
