import {
	siteByIdQuery,
	siteCorePluginsQuery,
	siteCorePluginInstallMutation,
	siteCorePluginActivateMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import {
	WOOCOMMERCE_PLUGIN,
	WOOCOMMERCE_PAYMENTS_PLUGIN,
	WOOCOMMERCE_PLUGIN_SLUG,
	WOOCOMMERCE_PAYMENTS_PLUGIN_SLUG,
} from '../lib/constants';
import { derivePluginStatus } from '../lib/derive-plugin-status';
import { getSiteSetupUrl } from '../lib/get-site-setup-url';
import type { WooPaymentsSiteSetupData } from '../types';

export function useWooPaymentsSiteSetup( siteId: number ): WooPaymentsSiteSetupData {
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

	const status = useMemo( () => derivePluginStatus( plugins ), [ plugins ] );
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
