import {
	fetchNotifications,
	markNotificationsRead,
	type FetchNotificationsParams,
	type NotificationNote,
} from '@automattic/api-core';
import { mutationOptions, queryOptions, type QueryClient } from '@tanstack/react-query';

const NOTIFICATIONS_QUERY_KEY = [ 'notifications', 'notes' ];

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
			queryClient.setQueriesData< NotificationNote[] >(
				{ queryKey: NOTIFICATIONS_QUERY_KEY },
				( notes ) =>
					notes?.map( ( note ) => ( noteIds.includes( note.id ) ? { ...note, read: 1 } : note ) )
			);
			return { previous };
		},
		onError: ( _error, _noteIds, context ) => {
			context?.previous.forEach( ( [ queryKey, notes ] ) =>
				queryClient.setQueryData( queryKey, notes )
			);
		},
		onSettled: () => queryClient.invalidateQueries( { queryKey: NOTIFICATIONS_QUERY_KEY } ),
	} );
