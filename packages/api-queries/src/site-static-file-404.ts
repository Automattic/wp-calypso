import { fetchStaticFile404Setting, updateStaticFile404Setting } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const siteStaticFile404SettingQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'static-file-404' ],
		queryFn: () => fetchStaticFile404Setting( siteId ),
	} );

export const siteStaticFile404SettingMutation = ( siteId: number ) =>
	mutationOptions( {
		meta: { statId: 'site-static-file404-update' },
		mutationFn: ( setting: string ) => updateStaticFile404Setting( siteId, setting ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteStaticFile404SettingQuery( siteId ) );
		},
	} );
