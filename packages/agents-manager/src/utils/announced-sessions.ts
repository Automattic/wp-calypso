/**
 * Module bridge for the session IDs the live agents announced via
 * `onSessionIdChange`. The agent config's callback records them here so
 * `AgentSetup` can tell tab storage catching up to the running conversation
 * from a genuine conversation switch. Keyed per agent and per site scope,
 * matching the session storage itself.
 */
import { ORCHESTRATOR_AGENT_ID } from '../constants';

const announcedSessionIds = new Map< string, string >();

function toKey( agentId: string | undefined, siteKey: string ): string {
	return `${ agentId ?? ORCHESTRATOR_AGENT_ID }-${ siteKey }`;
}

export function setAnnouncedSessionId(
	sessionId: string,
	agentId: string | undefined,
	siteKey: string
): void {
	announcedSessionIds.set( toKey( agentId, siteKey ), sessionId );
}

export function getAnnouncedSessionId(
	agentId: string | undefined,
	siteKey: string
): string | undefined {
	return announcedSessionIds.get( toKey( agentId, siteKey ) );
}

/** Forget an agent's announced session. Call wherever its agent is removed. */
export function clearAnnouncedSessionId( agentId: string | undefined, siteKey: string ): void {
	announcedSessionIds.delete( toKey( agentId, siteKey ) );
}
