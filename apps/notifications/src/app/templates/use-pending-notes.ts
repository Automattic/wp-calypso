import { useCallback, useState } from 'react';
import type { Note } from '../types';

/**
 * Tracks the notes an action's request is still out for. One action button serves each note
 * opened in turn (`j` and `k` in the panel show the next note in the same buttons), so it is
 * busy for the notes it was pressed on, not for whichever note it shows.
 */
export default function usePendingNotes() {
	const [ pendingIds, setPendingIds ] = useState< ReadonlySet< Note[ 'id' ] > >( () => new Set() );

	const start = useCallback(
		( id: Note[ 'id' ] ) => setPendingIds( ( ids ) => new Set( ids ).add( id ) ),
		[]
	);
	const finish = useCallback(
		( id: Note[ 'id' ] ) =>
			setPendingIds( ( ids ) => {
				const next = new Set( ids );
				next.delete( id );
				return next;
			} ),
		[]
	);

	return { isPending: ( id: Note[ 'id' ] ) => pendingIds.has( id ), start, finish };
}
