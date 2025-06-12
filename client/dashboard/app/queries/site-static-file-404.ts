import { fetchStaticFile404Setting, updateStaticFile404Setting } from '../../data/site-hosting';
import { queryClient } from '../query-client';

export const siteStaticFile404SettingQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'static-file-404' ],
	queryFn: () => fetchStaticFile404Setting( siteId ),
} );

export const siteStaticFile404SettingMutation = ( siteId: number ) => ( {
	mutationFn: ( setting: string ) => updateStaticFile404Setting( siteId, setting ),
	onSuccess: () => {
		queryClient.invalidateQueries( siteStaticFile404SettingQuery( siteId ) );
	},
} );
