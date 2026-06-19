/**
 * Module bridge for the resolved agent id.
 *
 * The Provider publishes the resolved `agentConfig.agentId` here so non-React
 * callers — the parity Tracks wrapper, fired from event handlers — can read the
 * same answer components see. No `window` access, so SSR-safe by construction.
 */

let resolvedAgentId: string | undefined;

export function setResolvedAgentId( id: string | undefined ): void {
	resolvedAgentId = id;
}

export function getResolvedAgentId(): string | undefined {
	return resolvedAgentId;
}
