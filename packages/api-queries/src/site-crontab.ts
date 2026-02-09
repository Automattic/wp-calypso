import { fetchCrontabs, createCrontab, updateCrontab, deleteCrontab } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import type { CrontabFormData } from '@automattic/api-core';

export const siteCrontabsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'crontabs' ],
		queryFn: () => fetchCrontabs( siteId ),
	} );

export const siteCrontabCreateMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( params: CrontabFormData ) => createCrontab( siteId, params ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteCrontabsQuery( siteId ) );
		},
	} );

export const siteCrontabUpdateMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( { cronId, params }: { cronId: number; params: CrontabFormData } ) =>
			updateCrontab( siteId, cronId, params ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteCrontabsQuery( siteId ) );
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
