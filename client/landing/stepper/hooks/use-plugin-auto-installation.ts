import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useEffect } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import type { SitePlugin } from 'calypso/data/plugins/types';

interface Response {
	plugins: SitePlugin[];
}
interface SkipStatus {
	installation: boolean;
	activation: boolean;
}
type SitePluginParam = Pick< SitePlugin, 'slug' | 'name' >;
type Status = 'idle' | 'pending' | 'success' | 'error';

interface SiteMigrationStatus {
	status: Status;
	completed: boolean;
	error: Error | null;
}

type Options = Pick< UseQueryOptions, 'enabled' | 'retry' >;
const DEFAULT_RETRY = process.env.NODE_ENV === 'test' ? 1 : 100;
const DEFAULT_RETRY_DELAY = process.env.NODE_ENV !== 'production' ? 300 : 3000;

const fetchPluginsForSite = async ( siteId: number ): Promise< Response > =>
	wpcom.req.get( `/sites/${ siteId }/plugins?http_envelope=1`, {
		apiNamespace: 'rest/v1.2',
	} );

const installPlugin = async ( siteId: number, pluginSlug: string ) =>
	wpcom.req.post( {
		path: `/sites/${ siteId }/plugins/${ pluginSlug }/install`,
		apiNamespace: 'rest/v1.2',
	} );

const activatePlugin = async ( siteId: number, pluginName: string ) =>
	wpcom.req.post( {
		path: `/sites/${ siteId }/plugins/${ encodeURIComponent( pluginName ) }`,
		apiNamespace: 'rest/v1.2',
		body: {
			active: true,
		},
	} );

const usePluginStatus = ( pluginSlug: string, siteId?: number, options?: Options ) => {
	return useQuery( {
		queryKey: [ 'onboarding-site-plugin-status', siteId, pluginSlug ],
		queryFn: () => fetchPluginsForSite( siteId! ),
		enabled: !! siteId && ( options?.enabled ?? true ),
		retry: options?.retry ?? DEFAULT_RETRY,
		retryDelay: DEFAULT_RETRY_DELAY,
		refetchOnWindowFocus: false,
		select: ( data ) => {
			return {
				isActive: data.plugins.some( ( plugin ) => plugin.slug === pluginSlug && plugin.active ),
				isInstalled: data.plugins.some( ( plugin ) => plugin.slug === pluginSlug ),
			};
		},
	} );
};

const usePluginInstallation = ( pluginSlug: string, siteId?: number, options?: Options ) => {
	return useMutation( {
		mutationKey: [ 'onboarding-site-plugin-installation', siteId, pluginSlug ],
		mutationFn: async () => installPlugin( siteId!, pluginSlug ),
		retry: options?.retry ?? DEFAULT_RETRY,
	} );
};

const usePluginActivation = ( pluginName: string, siteId?: number, options?: Options ) => {
	return useMutation( {
		mutationKey: [ 'onboarding-site-plugin-activation', siteId, pluginName ],
		mutationFn: async () => activatePlugin( siteId!, pluginName ),
		retryDelay: DEFAULT_RETRY_DELAY,
		retry: options?.retry ?? DEFAULT_RETRY,
	} );
};

export const usePluginAutoInstallation = (
	plugin: SitePluginParam,
	siteId?: number,
	options?: Options
): SiteMigrationStatus => {
	const {
		data: status,
		error: statusError,
		fetchStatus: pluginStatus,
	} = usePluginStatus( plugin.slug, siteId, options );

	const {
		mutate: install,
		error: installationError,
		status: installationRequestStatus,
	} = usePluginInstallation( plugin.slug, siteId, options );

	const {
		mutate: activatePlugin,
		status: activationRequestStatus,
		error: activationError,
	} = usePluginActivation( plugin.name, siteId, options );

	const skipped: SkipStatus = {
		installation: status?.isInstalled,
		activation: status?.isActive,
	} as SkipStatus;

	useEffect( () => {
		if ( ! status || skipped?.installation ) {
			return;
		}

		if ( installationRequestStatus === 'idle' ) {
			install();
		}
	}, [ install, installationRequestStatus, skipped?.installation, status ] );

	useEffect( () => {
		if ( ! status || skipped?.activation ) {
			return;
		}

		if ( activationRequestStatus !== 'idle' ) {
			return;
		}

		if ( installationRequestStatus === 'success' || status.isInstalled ) {
			activatePlugin();
		}
	}, [
		activatePlugin,
		installationRequestStatus,
		activationRequestStatus,
		skipped?.activation,
		status,
	] );

	const error = statusError || installationError || activationError;
	const installationStatus = skipped?.installation ? 'skipped' : installationRequestStatus;
	const activationStatus = skipped?.activation ? 'skipped' : activationRequestStatus;
	const completed = activationStatus === 'success' || ( skipped?.activation ?? false );
	const isPending = [ installationStatus, activationStatus, pluginStatus ].some(
		( status ) => status === 'pending' || status === 'fetching'
	);

	const getStatus = (): Status => {
		if ( completed ) {
			return 'success';
		}

		if ( isPending ) {
			return 'pending';
		}

		if ( error ) {
			recordTracksEvent( 'calypso_onboarding_plugin_installation_error', {
				plugin,
				error,
				siteId: siteId,
			} );
			return 'error';
		}

		return 'idle';
	};

	return {
		status: getStatus(),
		completed,
		error: ! isPending && error ? error : null,
	};
};
