import { entryIdToItemId } from './transcript';

/**
 * Tracks the canonical timestamp for each conversation item. The OpenAI
 * Realtime API does not guarantee that delta events arrive in conversation
 * order: e.g. user audio transcription can complete *after* the assistant has
 * started streaming its reply. We capture a stable per-item timestamp so
 * transcript entries sort in conversation order regardless of delta arrival.
 *
 * Two write paths keep the map populated:
 *   - `record(itemId)` is called on `conversation.item.added` / `.created`,
 *     which fires first for user items.
 *   - `lookup(entryId)` falls back to `Date.now()` when the lookup happens
 *     before the `added`/`created` event (typical for assistant items, whose
 *     deltas arrive ahead of the conversation-level signal). Subsequent
 *     lookups for the same item — including different content indices of an
 *     assistant message — return that captured timestamp.
 */
export interface ConversationItemTimestamps {
	record: ( itemId: string ) => void;
	lookup: ( entryId: string ) => number;
	reset: () => void;
}

export function createConversationItemTimestamps(
	now: () => number = Date.now
): ConversationItemTimestamps {
	const map = new Map< string, number >();
	return {
		record( itemId ) {
			if ( ! map.has( itemId ) ) {
				map.set( itemId, now() );
			}
		},
		lookup( entryId ) {
			const itemId = entryIdToItemId( entryId );
			const recorded = map.get( itemId );
			if ( recorded !== undefined ) {
				return recorded;
			}
			const ts = now();
			map.set( itemId, ts );
			return ts;
		},
		reset() {
			map.clear();
		},
	};
}
