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

const fetchPluginsForSite = async ( siteIdOrSlug: string ): Promise< Response > =>
	wpcom.req.get( `/sites/${ siteIdOrSlug }/plugins?http_envelope=1`, {
		apiNamespace: 'rest/v1.2',
	} );

const installPlugin = async ( siteIdOrSlug: string, pluginSlug: string ) =>
	wpcom.req.post( {
		path: `/sites/${ siteIdOrSlug }/plugins/${ pluginSlug }/install`,
		apiNamespace: 'rest/v1.2',
	} );

const activePlugin = async ( siteIdOrSlug: string, pluginName: string ) =>
	wpcom.req.post( {
		path: `/sites/${ siteIdOrSlug }/plugins/${ encodeURIComponent( pluginName ) }`,
		apiNamespace: 'rest/v1.2',
		body: {
			active: true,
		},
	} );

const usePluginStatus = ( pluginSlug: string, siteIdOrSlug?: string ) => {
	return useQuery( {
		queryKey: [ 'onboarding-site-plugin-status', siteIdOrSlug, pluginSlug ],
		queryFn: () => fetchPluginsForSite( siteIdOrSlug! ),
		enabled: !! siteIdOrSlug,
		retry: true,
		retryDelay: 2000,
		select: ( data ) => {
			return {
				isActive: data.plugins.some( ( plugin ) => plugin.slug === pluginSlug && plugin.active ),
				isInstalled: data.plugins.some( ( plugin ) => plugin.slug === pluginSlug ),
			};
		},
	} );
};

const usePluginInstallation = ( pluginSlug: string, siteIdOrSlug: string ) => {
	return useMutation( {
		mutationKey: [ 'onboarding-site-plugin-installation', siteIdOrSlug, pluginSlug ],
		mutationFn: async () => installPlugin( siteIdOrSlug, pluginSlug ),
		retry: true,
		retryDelay: 2000,
	} );
};

const usePluginActivation = ( pluginName: string, siteIdOrSlug: string ) => {
	return useMutation( {
		mutationKey: [ 'onboarding-site-plugin-activation', siteIdOrSlug, pluginName ],
		mutationFn: async () => activePlugin( siteIdOrSlug, pluginName ),
		retry: true,
		retryDelay: 2000,
	} );
};

export const useSiteMigrationStatus = ( plugin: SitePluginParam, siteIdOrSlug?: string ) => {
	const {
		data: status,
		error: statusError,
		status: provisioningStatus,
	} = usePluginStatus( plugin.slug, siteIdOrSlug );

	const {
		mutate: install,
		error: installationError,
		status: instalationRequestStatus,
	} = usePluginInstallation( plugin.slug, siteIdOrSlug! );

	const {
		mutateAsync: activatePlugin,
		status: activationRequestStatus,
		error: activationError,
	} = usePluginActivation( plugin.name, siteIdOrSlug! );

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
	const instalationStatus = skipped?.installation ? 'skipped' : instalationRequestStatus;
	const activationStatus = skipped?.activation ? 'skipped' : activationRequestStatus;
	const completed = [ instalationStatus, activationStatus, provisioningStatus ].every(
		( status ) => status === 'success' || status === 'skipped'
	);

	return {
		provisionning: provisioningStatus,
		installation: instalationStatus,
		activation: activationStatus,
		completed,
		error,
	};
};
