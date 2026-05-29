import type { RealtimeTranscriptEntry } from './types';

export function assistantTurnEntryId( evt: Record< string, unknown > ): string {
	const itemId = typeof evt.item_id === 'string' ? evt.item_id : '';
	const responseId = typeof evt.response_id === 'string' ? evt.response_id : '';
	const ix = typeof evt.content_index === 'number' ? String( evt.content_index ) : '';
	const base = itemId || responseId || 'assistant-latest';
	return ix ? `${ base }:${ ix }` : base;
}

/**
 * Inverse of the optional `:contentIndex` suffix produced by
 * {@link assistantTurnEntryId}. Returns the bare conversation item id, which
 * is what the server uses in `conversation.item.added` / `.created` events.
 */
export function entryIdToItemId( entryId: string ): string {
	const colonIdx = entryId.indexOf( ':' );
	return colonIdx === -1 ? entryId : entryId.slice( 0, colonIdx );
}

export function upsertEntry(
	prev: RealtimeTranscriptEntry[],
	id: string,
	role: RealtimeTranscriptEntry[ 'role' ],
	delta: string,
	isFinal: boolean,
	timestamp: number = Date.now()
): RealtimeTranscriptEntry[] {
	const existingIndex = prev.findIndex( ( entry ) => entry.id === id );
	if ( existingIndex === -1 ) {
		return [ ...prev, { id, role, text: delta, isFinal, timestamp } ];
	}
	const updated = [ ...prev ];
	const existing = updated[ existingIndex ];
	updated[ existingIndex ] = {
		...existing,
		text: isFinal && delta ? delta : existing.text + delta,
		isFinal: isFinal || existing.isFinal,
	};
	return updated;
}
