import { isReaderChatAgent } from './is-reader-chat-agent';

/**
 * Whether this agent persists its conversation session and open-state on the
 * CLIENT (tab-scoped sessionStorage) rather than the per-user server store.
 *
 * True for:
 *   - reader-chat agents (public blog frontends — implicit, by agent id), and
 *   - any host that opts in via `agentsManagerData.persistStateLocally` — e.g.
 *     the logged-out WooCommerce storefront shopper, whose per-user `open-state`
 *     endpoint returns 401 and so can't restore anything server-side.
 *
 * Used to gate the persistence-only branches (session restore, open-flag
 * mirror, and skipping the server open-state write). It does NOT
 * change reader-chat-specific UI/behavior — those keep using `isReaderChatAgent`
 * directly.
 */
export function usesLocalStatePersistence( agentId: string | undefined | null ): boolean {
	if ( isReaderChatAgent( agentId ) ) {
		return true;
	}
	return typeof agentsManagerData !== 'undefined' && !! agentsManagerData?.persistStateLocally;
}
