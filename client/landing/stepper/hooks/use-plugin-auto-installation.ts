import config from '@automattic/calypso-config';
import { useMutation, useQuery, UseQueryOptions, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { logToLogstash } from 'calypso/lib/logstash';
import wpcom from 'calypso/lib/wp';
import { usePluginInstallation } from './use-plugin-installation';
import type { SitePlugin } from 'calypso/data/plugins/types';

interface Response {
	plugins: SitePlugin[];
}

type SitePluginParam = Pick< SitePlugin, 'slug' | 'name' >;
type Status = 'idle' | 'pending' | 'success' | 'error';

interface SiteMigrationStatus {
	status: Status;
	completed: boolean;
	error: Error | null;
}

export type Options = Pick< UseQueryOptions, 'enabled' | 'retry' >;
export const DEFAULT_RETRY = process.env.NODE_ENV === 'test' ? 1 : 10;
const DEFAULT_RETRY_DELAY = process.env.NODE_ENV === 'test' ? 300 : 5000;

const REFRESH_JETPACK_TOTAL_ATTEMPTS = process.env.NODE_ENV === 'test' ? 1 : 3;

const fetchPluginsForSite = async ( siteId: number ): Promise< Response > =>
	wpcom.req.get( `/sites/${ siteId }/plugins?http_envelope=1`, {
		apiNamespace: 'rest/v1.2',
	} );

const refreshJetpackConnection = async ( siteId: number ) =>
	wpcom.req.post(
		{
			path: `/sites/${ siteId }/migration-force-reconnection`,
		},
		{ apiVersion: '1.2' },
		{}
	);

const activatePlugin = async ( siteId: number, pluginName: string ) =>
	wpcom.req.post( {
		path: `/sites/${ siteId }/plugins/${ encodeURIComponent( pluginName ) }`,
		apiNamespace: 'rest/v1.2',
		body: {
			active: true,
		},
	} );

const safeLogToLogstash = ( message: string, properties: Record< string, unknown > ) => {
	try {
		logToLogstash( {
			feature: 'calypso_client',
			message,
			properties: {
				env: config( 'env_id' ),
				type: 'calypso_prepare_site_for_migration',
				action: 'fetch_plugins_for_site',
				...properties,
			},
		} );
	} catch ( e ) {
		// eslint-disable-next-line no-console
		console.error( e );
	}
};

const usePluginStatus = ( pluginSlug: string, siteId?: number, options?: Options ) => {
	const queryClient = useQueryClient();
	const remainingAttempts = useRef( REFRESH_JETPACK_TOTAL_ATTEMPTS );
	const hasSuccessLogged = useRef( false );

	const response = useQuery( {
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

	if ( response.isError && remainingAttempts.current >= 0 ) {
		refreshJetpackConnection( siteId! );

		queryClient.invalidateQueries( {
			queryKey: [ 'onboarding-site-plugin-status', siteId, pluginSlug ],
		} );

		safeLogToLogstash( 'restoring jetpack connection', {
			site: siteId,
			attempts: remainingAttempts.current,
			reason: response.error.message,
		} );

		remainingAttempts.current--;

		return {
			data: undefined,
			error: null,
			fetchStatus: 'pending',
		};
	}

	if ( response.isError && remainingAttempts.current <= 0 ) {
		safeLogToLogstash( 'jetpack connection restoration attempts failed', {
			site: siteId,
			reason: response.error.message,
		} );
	}

	if ( response.isSuccess && remainingAttempts.current < REFRESH_JETPACK_TOTAL_ATTEMPTS ) {
		//Temporary fix for the issue where the success message is logged multiple times
		if ( ! hasSuccessLogged.current ) {
			hasSuccessLogged.current = true;
			safeLogToLogstash( 'jetpack connection restored', { site: siteId } );
		}
	}

	return response;
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
		isSuccess: isInstalled,
	} = usePluginInstallation( plugin.slug, siteId, options );

	const {
		mutate: activate,
		status: activationRequestStatus,
		error: activationError,
		isSuccess: isActivated,
	} = usePluginActivation( plugin.name, siteId, options );

	const isPluginInstalled = status?.isInstalled || isInstalled;
	const isPluginActivated = status?.isActive || isActivated;

	const shouldInstall =
		( status && ! isPluginInstalled && installationRequestStatus === 'idle' ) ?? false;
	const shouldActivate =
		( status && isPluginInstalled && ! isPluginActivated && activationRequestStatus === 'idle' ) ??
		false;

	const completed = ( status && isPluginInstalled && isPluginActivated ) ?? false;
	const error = statusError || installationError || activationError;

	const isPending = [ installationRequestStatus, activationRequestStatus, pluginStatus ].some(
		( status ) => status === 'pending' || status === 'fetching'
	);

	useEffect( () => {
		if ( ! shouldInstall ) {
			return;
		}

		install();
	}, [ install, shouldInstall ] );

	useEffect( () => {
		if ( ! shouldActivate ) {
			return;
		}

		activate();
	}, [ activate, shouldActivate ] );

	const getStatus = (): Status => {
		if ( completed ) {
			return 'success';
		}

		if ( isPending ) {
			return 'pending';
		}

		if ( error ) {
			recordTracksEvent( 'calypso_onboarding_plugin_installation_error', {
				plugin: plugin.slug,
				error: error.message,
				site_id: siteId,
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
