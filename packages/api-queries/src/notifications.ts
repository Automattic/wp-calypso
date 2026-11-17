import {
	fetchNotifications,
	type FetchNotificationsParams,
	type NotificationNote,
} from '@automattic/api-core';
import { queryOptions, type QueryClient } from '@tanstack/react-query';

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
