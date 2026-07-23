import {
	siteByIdQuery,
	siteCorePluginsQuery,
	siteCorePluginInstallMutation,
	siteCorePluginActivateMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
	WOOCOMMERCE_PLUGIN,
	WOOCOMMERCE_PAYMENTS_PLUGIN,
	WOOCOMMERCE_PLUGIN_SLUG,
	WOOCOMMERCE_PAYMENTS_PLUGIN_SLUG,
} from '../lib/constants';
import { derivePluginStatus } from '../lib/derive-plugin-status';
import { getSiteSetupUrl } from '../lib/get-site-setup-url';
import type { WooPaymentsSiteSetup } from '../types';

/**
 * Data layer for the WooPayments site setup flow: resolves the target site, derives the
 * WooCommerce / WooPayments plugin status, and orchestrates installing + activating both plugins.
 *
 * Side effects that belong to presentation (opening WP-Admin, analytics, error surfacing) stay
 * with the caller — `installAndActivate` simply resolves once the plugins are ready or throws.
 */
export function useWooPaymentsSiteSetup( siteId: number ): WooPaymentsSiteSetup {
	const { data: site, isLoading: isLoadingSite } = useQuery( {
		...siteByIdQuery( siteId ),
		enabled: !! siteId,
	} );

	const { data: plugins, isLoading: isLoadingPlugins } = useQuery( {
		...siteCorePluginsQuery( siteId ),
		enabled: !! siteId,
	} );

	const { mutateAsync: installPlugin, isPending: isInstallingPlugin } = useMutation(
		siteCorePluginInstallMutation()
	);
	const { mutateAsync: activatePlugin, isPending: isActivatingPlugin } = useMutation(
		siteCorePluginActivateMutation()
	);

	const status = derivePluginStatus( plugins );
	const { hasWooCommerce, hasWooPayments, isWooCommerceInactive, isWooPaymentsInactive } = status;

	const installAndActivate = useCallback( async () => {
		if ( ! hasWooCommerce ) {
			await installPlugin( { siteId, slug: WOOCOMMERCE_PLUGIN_SLUG } );
		}
		if ( isWooCommerceInactive ) {
			await activatePlugin( { siteId, plugin: WOOCOMMERCE_PLUGIN } );
		}
		if ( ! hasWooPayments ) {
			await installPlugin( { siteId, slug: WOOCOMMERCE_PAYMENTS_PLUGIN_SLUG } );
		}
		if ( isWooPaymentsInactive ) {
			await activatePlugin( { siteId, plugin: WOOCOMMERCE_PAYMENTS_PLUGIN } );
		}
	}, [
		activatePlugin,
		installPlugin,
		siteId,
		hasWooCommerce,
		hasWooPayments,
		isWooCommerceInactive,
		isWooPaymentsInactive,
	] );

	return {
		site,
		isLoading: isLoadingSite || isLoadingPlugins,
		status,
		setupUrl: site?.URL ? getSiteSetupUrl( site.URL ) : undefined,
		installAndActivate,
		isInstalling: isInstallingPlugin || isActivatingPlugin,
	};
}
