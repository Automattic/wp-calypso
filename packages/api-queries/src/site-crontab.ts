import { fetchCrontabs, createCrontab, deleteCrontab } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import type { CreateCrontabParams } from '@automattic/api-core';

export const siteCrontabsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'crontabs' ],
		queryFn: () => fetchCrontabs( siteId ),
	} );

export const siteCrontabCreateMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( params: CreateCrontabParams ) => createCrontab( siteId, params ),
		onSuccess: ( newCrontab ) => {
			queryClient.setQueryData( siteCrontabsQuery( siteId ).queryKey, ( currentCrontabs ) => {
				if ( ! currentCrontabs ) {
					return [ newCrontab ];
				}
				return [ ...currentCrontabs, newCrontab ];
			} );
		},
	} );

export const siteCrontabDeleteMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( cronId: number ) => deleteCrontab( siteId, cronId ),
		onSuccess: ( _, cronId ) => {
			queryClient.setQueryData( siteCrontabsQuery( siteId ).queryKey, ( currentCrontabs ) => {
				if ( ! currentCrontabs ) {
					return [];
				}
				return currentCrontabs.filter( ( c ) => c.cron_id !== cronId );
			} );
		},
	} );
