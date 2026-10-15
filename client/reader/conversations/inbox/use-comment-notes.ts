import { useLocale } from '@automattic/i18n-utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { Note } from '@automattic/notifications/src/app/types';

const COMMENT_NOTES_QUERY_KEY = [ 'reader-conversations-inbox', 'comment-notes' ];

export function useCommentNotes() {
	const locale = useLocale();

	return useQuery< Note[] >( {
		queryKey: [ ...COMMENT_NOTES_QUERY_KEY, locale ],
		queryFn: async () => {
			const response = await wpcom.req.get(
				{ path: '/notifications/', apiVersion: '1.1' },
				{
					type: 'comment',
					number: 100,
					fields: 'id,type,read,body,subject,timestamp,meta,icon,title',
					locale,
				}
			);
			return response.notes ?? [];
		},
	} );
}

export function useMarkNotesRead() {
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: ( noteIds: number[] ) =>
			wpcom.req.post( { path: '/notifications/read' }, null, {
				counts: Object.fromEntries( noteIds.map( ( id ) => [ id, 9999 ] ) ),
			} ),
		onMutate: async ( noteIds ) => {
			try {
				await queryClient.cancelQueries( { queryKey: COMMENT_NOTES_QUERY_KEY } );
			} catch {
				// Cancelling is best-effort; the optimistic update below must still happen.
			}
			const previous = queryClient.getQueriesData< Note[] >( {
				queryKey: COMMENT_NOTES_QUERY_KEY,
			} );
			queryClient.setQueriesData< Note[] >( { queryKey: COMMENT_NOTES_QUERY_KEY }, ( notes ) =>
				notes?.map( ( note ) => ( noteIds.includes( note.id ) ? { ...note, read: 1 } : note ) )
			);
			return { previous };
		},
		onError: ( _error, _noteIds, context ) => {
			context?.previous.forEach( ( [ queryKey, notes ] ) =>
				queryClient.setQueryData( queryKey, notes )
			);
		},
		onSettled: () => queryClient.invalidateQueries( { queryKey: COMMENT_NOTES_QUERY_KEY } ),
	} );
}
