import { useFediverseConnectionsQuery } from '@automattic/api-queries';

/**
 * Stock AP plugin cap when the connections endpoint doesn't surface a
 * `character_limit` override (or while the query is still pending /
 * errored). Per CM-684, 500 graphemes is the protocol default; per-blog
 * overrides are surfaced via `FediverseConnection.character_limit`.
 */
const DEFAULT_FEDIVERSE_LIMIT = 500;

/**
 * Returns the per-blog grapheme cap the composer should validate against.
 * Mirrors `useMastodonComposerLimit`'s shape (cached connection-config
 * query → numeric cap with a stock fallback), so the shared composer
 * shell can plug this into the `ComposerConfig.useLimit` slot
 * unconditionally on every render.
 *
 * `connectionId` is `null` when no mode is active (modal closed); the
 * value is unused while closed, so a fallback there is fine.
 */
export function useFediverseComposerLimit( connectionId: number | null ): number {
	const { data } = useFediverseConnectionsQuery( {
		enabled: connectionId !== null && connectionId > 0,
	} );
	if ( connectionId === null ) {
		return DEFAULT_FEDIVERSE_LIMIT;
	}
	const connection = data?.connections.find( ( c ) => c.id === connectionId );
	return connection?.character_limit ?? DEFAULT_FEDIVERSE_LIMIT;
}
