import {
	activateJetpackModule,
	deactivateJetpackModule,
	fetchJetpackModules,
} from '../../data/site-jetpack-modules';
import { queryClient } from '../query-client';
import { siteQueryFilter } from './site';

export const siteJetpackModulesQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'jetpack_modules' ],
	queryFn: () => fetchJetpackModules( siteId ),
} );

export const siteJetpackModuleMutation = ( siteId: number ) => ( {
	mutationFn: ( data: { module: string; value: boolean } ) => {
		const { module, value } = data;
		return value
			? activateJetpackModule( siteId, module )
			: deactivateJetpackModule( siteId, module );
	},
	onSuccess: ( newData: { action: string; module: string } ) => {
		queryClient.setQueryData( siteJetpackModulesQuery( siteId ).queryKey, ( oldData: string[] ) => {
			if ( newData.action === 'activate' ) {
				return [ ...oldData, newData.module ];
			} else if ( newData.action === 'deactivate' ) {
				return oldData.filter( ( module ) => module !== newData.module );
			}
		} );
		queryClient.invalidateQueries( siteQueryFilter( siteId ) );
	},
} );
