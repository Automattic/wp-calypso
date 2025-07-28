import {
	activateJetpackModule,
	deactivateJetpackModule,
	fetchJetpackModules,
} from '../../data/site-jetpack-modules';
import { queryClient } from '../query-client';
import { siteQueryFilter } from './site';
import { sitesQuery } from './sites';

export const siteJetpackModulesQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'jetpack_modules' ],
	queryFn: () => fetchJetpackModules( siteId ),
} );

export const siteJetpackModuleMutation = ( siteId: number ) => ( {
	mutationFn: ( variables: { module: string; value: boolean } ) => {
		const { module, value } = variables;
		return value
			? activateJetpackModule( siteId, module )
			: deactivateJetpackModule( siteId, module );
	},
	onSuccess: ( newData: unknown, variables: { module: string; value: boolean } ) => {
		queryClient.setQueryData( siteJetpackModulesQuery( siteId ).queryKey, ( oldData: string[] ) => {
			if ( variables.value ) {
				return [ ...oldData, variables.module ];
			}
			return oldData.filter( ( module ) => module !== variables.module );
		} );
		queryClient.invalidateQueries( { queryKey: siteJetpackModulesQuery( siteId ).queryKey } );
		queryClient.invalidateQueries( siteQueryFilter( siteId ) );
		queryClient.invalidateQueries( { queryKey: sitesQuery().queryKey } );
	},
} );
