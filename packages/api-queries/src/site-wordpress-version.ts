import {
	fetchWordPressVersion,
	fetchPendingWordPressVersion,
	updateWordPressVersion,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const siteWordPressVersionQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'wp-version' ],
		queryFn: () => fetchWordPressVersion( siteId ),
	} );

export const sitePendingWordPressVersionQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'wp-version', 'pending' ],
		queryFn: () => fetchPendingWordPressVersion( siteId ),
	} );

export const siteWordPressVersionMutation = (
	siteId: number,
	options?: { deferUntilBackupComplete?: boolean }
) =>
	mutationOptions( {
		mutationFn: ( version: string ) =>
			updateWordPressVersion( siteId, version, options?.deferUntilBackupComplete ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteWordPressVersionQuery( siteId ) );
			queryClient.invalidateQueries( sitePendingWordPressVersionQuery( siteId ) );
		},
	} );
