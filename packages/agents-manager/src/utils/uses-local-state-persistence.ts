import { isReaderChatAgent } from './is-reader-chat-agent';

/**
 * Whether this agent keeps its chat open-state on the CLIENT rather than in the
 * per-user server store.
 *
 * True for:
 *   - reader-chat agents (public blog frontends — implicit, by agent id), and
 *   - any host that opts in via `agentsManagerData.persistStateLocally` — e.g.
 *     the logged-out WooCommerce storefront shopper, whose per-user `open-state`
 *     endpoint returns 401 and so can't restore anything server-side.
 *
 * Gates the open-flag mirror, the skipped server open-state write, and the
 * editor-only Big Sky analytics. The chat session itself needs no special
 * handling: it is tab-scoped for every agent, and the server-assigned id
 * arrives through `onSessionIdChange`.
 */
export function usesLocalStatePersistence( agentId: string | undefined | null ): boolean {
	if ( isReaderChatAgent( agentId ) ) {
		return true;
	}
	return typeof agentsManagerData !== 'undefined' && !! agentsManagerData?.persistStateLocally;
}
