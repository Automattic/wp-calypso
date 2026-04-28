import {
	createReadList,
	fetchReadList,
	fetchReadSubscribedLists,
	updateReadList,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const readSubscribedListsQuery = () =>
	queryOptions( {
		queryKey: [ 'read', 'lists', 'subscribed' ],
		staleTime: 1000 * 60 * 5, // 5 minutes — lists change infrequently
		queryFn: () => fetchReadSubscribedLists(),
	} );

export const readListQuery = ( owner: string, slug: string ) =>
	queryOptions( {
		queryKey: [ 'read', 'lists', owner, slug ],
		staleTime: 1000 * 60 * 5,
		queryFn: () => fetchReadList( owner, slug ),
	} );

export const createReadListMutation = () =>
	mutationOptions( {
		mutationFn: createReadList,
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: readSubscribedListsQuery().queryKey,
			} );
		},
	} );

export const updateReadListMutation = () =>
	mutationOptions( {
		mutationFn: updateReadList,
		onSuccess: ( data ) => {
			queryClient.invalidateQueries( {
				queryKey: readListQuery( data.list.owner, data.list.slug ).queryKey,
			} );
			queryClient.invalidateQueries( {
				queryKey: readSubscribedListsQuery().queryKey,
			} );
		},
	} );
