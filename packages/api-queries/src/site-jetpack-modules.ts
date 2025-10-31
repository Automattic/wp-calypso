import {
	activateJetpackModule,
	deactivateJetpackModule,
	fetchJetpackModules,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { siteQueryFilter } from './site';
import { sitesQueryKey } from './sites';

export const siteJetpackModulesQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'jetpack_modules' ],
		queryFn: () => fetchJetpackModules( siteId ),
	} );

export const siteJetpackModulesMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( variables: { module: string; value: boolean } ) => {
			const { module, value } = variables;
			return value
				? activateJetpackModule( siteId, module )
				: deactivateJetpackModule( siteId, module );
		},
		onSuccess: ( newData: unknown, variables: { module: string; value: boolean } ) => {
			queryClient.setQueryData( siteJetpackModulesQuery( siteId ).queryKey, ( oldData = {} ) => {
				return {
					...oldData,
					[ variables.module ]: {
						...oldData[ variables.module ],
						activated: variables.value,
					},
				};
			} );
			queryClient.invalidateQueries( { queryKey: siteJetpackModulesQuery( siteId ).queryKey } );
			queryClient.invalidateQueries( siteQueryFilter( siteId ) );
			queryClient.invalidateQueries( { queryKey: sitesQueryKey } );
		},
	} );
