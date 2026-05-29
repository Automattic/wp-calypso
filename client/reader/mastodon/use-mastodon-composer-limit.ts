import { useMastodonInstanceConfigQuery } from '@automattic/api-queries';

// Stock Mastodon defaults to 500 graphemes per status. We use this as the
// fallback when the instance-config query is pending or errors — most
// Mastodon instances run at this default, so under-counting is rare. On
// instances that have raised the cap (1000+, 5000+, 11000+ on some
// self-hosted instances), the dynamic value will replace it once the
// query resolves.
const DEFAULT_MASTODON_LIMIT = 500;

/**
 * Returns the per-instance composer character limit for the given Mastodon
 * connection. Reads `max_characters` from the instance-config query and
 * falls back to 500 when the query hasn't resolved or has errored. Called
 * from `<ComposerModal>` on every render — the underlying query is cached
 * with a 1h `staleTime`, so the hook is effectively free after the first
 * fetch per session. Accepts `null` when the modal is mounted but no mode
 * is active; the query short-circuits via its `enabled` gate and the hook
 * returns the fallback (the value is unused while the modal is closed).
 */
export function useMastodonComposerLimit( connectionId: number | null ): number {
	const { data } = useMastodonInstanceConfigQuery( connectionId );
	return data?.max_characters ?? DEFAULT_MASTODON_LIMIT;
}
