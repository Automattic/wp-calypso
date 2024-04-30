import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
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

type StatusVariation = 'idle' | 'loading' | 'success' | 'error' | 'pending' | 'skipped';

interface SiteMigrationStatus {
	waitingPluginList: StatusVariation;
	activatingPlugin: StatusVariation;
	installingPlugin: StatusVariation;
	completed: boolean;
	error: Error | null;
}

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

const usePluginStatus = ( pluginSlug: string, siteId?: number ) => {
	return useQuery( {
		queryFn: () => fetchPluginsForSite( siteIdOrSlug! ),
		enabled: !! siteIdOrSlug,
		retry: true,
		retryDelay: 2000,
		queryKey: [ 'onboarding-site-plugin-status', siteId, pluginSlug ],
		select: ( data ) => {
			return {
				isActive: data.plugins.some( ( plugin ) => plugin.slug === pluginSlug && plugin.active ),
				isInstalled: data.plugins.some( ( plugin ) => plugin.slug === pluginSlug ),
			};
		},
	} );
};

const usePluginInstallation = ( pluginSlug: string, siteId?: number ) => {
	return useMutation( {
		retry: true,
		retryDelay: 2000,
		mutationKey: [ 'onboarding-site-plugin-installation', siteId, pluginSlug ],
		mutationFn: async () => installPlugin( siteId!, pluginSlug ),
	} );
};

const usePluginActivation = ( pluginName: string, siteId?: number ) => {
	return useMutation( {
		mutationFn: async () => activatePlugin( siteIdOrSlug, pluginName ),
		retry: true,
		mutationKey: [ 'onboarding-site-plugin-activation', siteId, pluginName ],
		mutationFn: async () => activatePlugin( siteId!, pluginName ),
		retryDelay: 2000,
	} );
};

export const usePluginAutoInstallation = (
	plugin: SitePluginParam,
	siteId?: number
): SiteMigrationStatus => {
	const {
		data: status,
		error: statusError,
		status: provisioningStatus,
	} = usePluginStatus( plugin.slug, siteId );

	const {
		mutate: install,
		error: installationError,
		status: instalationRequestStatus,
	} = usePluginInstallation( plugin.slug, siteId );

	const {
		mutate: activatePlugin,
		status: activationRequestStatus,
		error: activationError,
	} = usePluginActivation( plugin.name, siteId );

	const skipped: SkipStatus = {
		installation: status?.isInstalled,
		activation: status?.isActive,
	} as SkipStatus;

	useEffect( () => {
		if ( ! status || skipped?.installation ) {
			return;
		}

		if ( instalationRequestStatus === 'idle' ) {
			install();
		}
	}, [ install, instalationRequestStatus, skipped?.installation, status ] );

	useEffect( () => {
		if ( ! status || skipped?.activation ) {
			return;
		}

		if ( activationRequestStatus !== 'idle' ) {
			return;
		}

		if ( instalationRequestStatus === 'success' || status.isInstalled ) {
			activatePlugin();
		}
	}, [
		activatePlugin,
		instalationRequestStatus,
		activationRequestStatus,
		skipped?.activation,
		status,
	] );

	const error = statusError || installationError || activationError;
	const installationStatus = skipped?.installation ? 'skipped' : instalationRequestStatus;
	const activationStatus = skipped?.activation ? 'skipped' : activationRequestStatus;
	const completed = [ installationStatus, activationStatus, provisioningStatus ].every(
		( status ) => status === 'success' || status === 'skipped'
	);

	return {
		waitingPluginList: provisioningStatus,
		installingPlugin: installationStatus,
		activatingPlugin: activationStatus,
		completed,
		error,
	};
};
