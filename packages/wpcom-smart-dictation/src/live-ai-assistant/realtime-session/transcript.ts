import type { RealtimeTranscriptEntry } from './types';

export function assistantTurnEntryId( evt: Record< string, unknown > ): string {
	const itemId = typeof evt.item_id === 'string' ? evt.item_id : '';
	const responseId = typeof evt.response_id === 'string' ? evt.response_id : '';
	const ix = typeof evt.content_index === 'number' ? String( evt.content_index ) : '';
	const base = itemId || responseId || 'assistant-latest';
	return ix ? `${ base }:${ ix }` : base;
}

export function upsertEntry(
	prev: RealtimeTranscriptEntry[],
	id: string,
	role: RealtimeTranscriptEntry[ 'role' ],
	delta: string,
	isFinal: boolean
): RealtimeTranscriptEntry[] {
	const existingIndex = prev.findIndex( ( entry ) => entry.id === id );
	if ( existingIndex === -1 ) {
		const timestamp = Date.now();
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
