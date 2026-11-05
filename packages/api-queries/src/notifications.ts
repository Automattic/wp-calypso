import {
	fetchNotifications,
	markNotificationsRead,
	type FetchNotificationsParams,
	type NotificationNote,
} from '@automattic/api-core';
import { mutationOptions, queryOptions, type QueryClient } from '@tanstack/react-query';

const NOTIFICATIONS_QUERY_KEY = [ 'notifications', 'notes' ];

export const getNotificationsQueryKey = () => NOTIFICATIONS_QUERY_KEY;

/** Marks notes read in every cached notifications list. */
export function markCachedNotesRead( queryClient: QueryClient, noteIds: number[] ) {
	const ids = new Set( noteIds );
	queryClient.setQueriesData< NotificationNote[] >(
		{ queryKey: NOTIFICATIONS_QUERY_KEY },
		( notes ) => notes?.map( ( note ) => ( ids.has( note.id ) ? { ...note, read: 1 } : note ) )
	);
}

export const notificationsQuery = ( params: FetchNotificationsParams ) =>
	queryOptions( {
		queryKey: [ ...NOTIFICATIONS_QUERY_KEY, params ],
		queryFn: async () => ( await fetchNotifications( params ) ).notes ?? [],
	} );

export const markNotificationsReadMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		meta: { statId: 'notif-mark-read' },
		mutationFn: markNotificationsRead,
		onMutate: async ( noteIds: number[] ) => {
			try {
				await queryClient.cancelQueries( { queryKey: NOTIFICATIONS_QUERY_KEY } );
			} catch {
				// Cancelling is best-effort; the optimistic update below must still happen.
			}
			const previous = queryClient.getQueriesData< NotificationNote[] >( {
				queryKey: NOTIFICATIONS_QUERY_KEY,
			} );
			markCachedNotesRead( queryClient, noteIds );
			return { previous };
		},
		onError: ( _error, _noteIds, context ) => {
			context?.previous.forEach( ( [ queryKey, notes ] ) =>
				queryClient.setQueryData( queryKey, notes )
			);
		},
		onSettled: () => queryClient.invalidateQueries( { queryKey: NOTIFICATIONS_QUERY_KEY } ),
	} );
