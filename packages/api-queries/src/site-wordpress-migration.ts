import {
	configureWordPressMigration,
	fetchWordPressMigrationConfiguration,
	fetchWordPressMigrationStatus,
	runWordPressMigration,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { siteQueryFilter } from './site';
import type {
	WordPressMigrationConfigureParams,
	WordPressMigrationRunParams,
} from '@automattic/api-core';

export const siteWordPressMigrationStatusQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'wordpress-migration', 'status' ],
		queryFn: () => fetchWordPressMigrationStatus( siteId ),
		meta: { persist: false },
	} );

export const siteWordPressMigrationConfigurationQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'wordpress-migration', 'configuration' ],
		queryFn: () => fetchWordPressMigrationConfiguration( siteId ),
		meta: { persist: false },
		// The endpoint probes the source site, so it's never refetched on its own.
		staleTime: Infinity,
	} );

// Re-read the migration from the server, along with the site fields that report it.
const invalidateMigration = ( siteId: number ) => {
	queryClient.invalidateQueries( {
		queryKey: siteWordPressMigrationStatusQuery( siteId ).queryKey,
	} );
	queryClient.invalidateQueries( siteQueryFilter( siteId ) );
};

export const siteWordPressMigrationConfigureMutation = ( siteId: number ) =>
	mutationOptions( {
		meta: { statId: 'site-wp-migration-configure' },
		mutationFn: ( params: WordPressMigrationConfigureParams ) =>
			configureWordPressMigration( siteId, params ),
		onSuccess: ( configuration ) => {
			queryClient.setQueryData(
				siteWordPressMigrationConfigurationQuery( siteId ).queryKey,
				configuration
			);
			// Configuring starts the migration over, so the status we have is out of date.
			invalidateMigration( siteId );
		},
		// A refused request means what we have is out of date: it's already running, or our team has taken it over.
		onError: () => invalidateMigration( siteId ),
	} );

export const siteWordPressMigrationRunMutation = ( siteId: number ) =>
	mutationOptions( {
		meta: { statId: 'site-wp-migration-run' },
		mutationFn: ( params: WordPressMigrationRunParams ) => runWordPressMigration( siteId, params ),
		onSuccess: async ( status ) => {
			const { queryKey } = siteWordPressMigrationStatusQuery( siteId );
			// A status request still in flight would overwrite this with what it was before the run.
			await queryClient.cancelQueries( { queryKey } );
			queryClient.setQueryData( queryKey, status );
		},
		onError: () => invalidateMigration( siteId ),
	} );
