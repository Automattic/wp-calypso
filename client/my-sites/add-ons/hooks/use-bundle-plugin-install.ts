import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { useCorePluginsQuery } from 'calypso/data/plugins/use-core-plugins-query';
import type { SiteId } from 'calypso/types';

export const POLL_INTERVAL_MS = 5 * 1000;
export const POLL_TIMEOUT_MS = 2 * 60 * 1000;

interface InstallResponse {
	status: 'installed' | 'in_progress';
	slug: string;
}

interface InstallError {
	message?: string;
}

export type BundlePluginInstallState = 'loading' | 'not-installed' | 'installing' | 'installed';

/**
 * Installs one plugin of the plan's WooCommerce extensions bundle, and reads the plugin's
 * installed state from the site's plugins.
 */
export function useBundlePluginInstall( siteId: SiteId, pluginSlug: string ) {
	const plugins = useCorePluginsQuery( siteId );
	const { refetch } = plugins;
	const isPluginActive = !! plugins.data?.some(
		// The `plugin` field is `<directory>/<main file>`, and the directory is the slug.
		( plugin ) => plugin.plugin.split( '/' )[ 0 ] === pluginSlug && plugin.status === 'active'
	);

	const [ isPolling, setIsPolling ] = useState( false );
	const [ hasTimedOut, setHasTimedOut ] = useState( false );

	const mutation = useMutation< InstallResponse, InstallError >( {
		mutationFn: () =>
			wpcomRequest< InstallResponse >( {
				path: `/sites/${ siteId }/woo-bundle-extensions/${ pluginSlug }`,
				apiNamespace: 'wpcom/v2',
				method: 'POST',
			} ),
		onSuccess: ( response ) => {
			if ( response.status === 'in_progress' ) {
				setIsPolling( true );
			}
		},
		onSettled: () => {
			refetch();
		},
	} );

	useEffect( () => {
		if ( ! isPolling ) {
			return;
		}

		const interval = setInterval( () => refetch(), POLL_INTERVAL_MS );
		const timeout = setTimeout( () => {
			setIsPolling( false );
			setHasTimedOut( true );
		}, POLL_TIMEOUT_MS );

		return () => {
			clearInterval( interval );
			clearTimeout( timeout );
		};
	}, [ isPolling, refetch ] );

	useEffect( () => {
		if ( isPolling && isPluginActive ) {
			setIsPolling( false );
		}
	}, [ isPolling, isPluginActive ] );

	const { mutate, reset } = mutation;
	const install = useCallback( () => {
		setHasTimedOut( false );
		reset();
		mutate();
	}, [ mutate, reset ] );

	let state: BundlePluginInstallState = 'not-installed';
	if ( isPluginActive || mutation.data?.status === 'installed' ) {
		state = 'installed';
	} else if ( mutation.isPending || isPolling ) {
		state = 'installing';
	} else if ( plugins.isLoading ) {
		state = 'loading';
	}

	return {
		state,
		install,
		error: mutation.error,
		hasTimedOut,
	};
}
