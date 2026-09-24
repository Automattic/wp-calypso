import { WOOCOMMERCE_PLUGIN, WOOCOMMERCE_PAYMENTS_PLUGIN } from './constants';
import type { WooPaymentsPluginStatus } from '../types';
import type { CorePlugin } from '@automattic/api-core';

export function derivePluginStatus( plugins: CorePlugin[] = [] ): WooPaymentsPluginStatus {
	const woocommercePlugin = plugins.find( ( { plugin } ) => plugin === WOOCOMMERCE_PLUGIN );
	const woocommercePaymentsPlugin = plugins.find(
		( { plugin } ) => plugin === WOOCOMMERCE_PAYMENTS_PLUGIN
	);

	const woocommerceStatus = woocommercePlugin?.status;
	const woocommercePaymentsStatus = woocommercePaymentsPlugin?.status;

	return {
		hasWooCommerce: !! woocommercePlugin,
		hasWooPayments: !! woocommercePaymentsPlugin,
		woocommerceStatus,
		woocommercePaymentsStatus,
		isWooCommerceInactive: woocommerceStatus === 'inactive',
		isWooPaymentsActive: woocommercePaymentsStatus === 'active',
		isWooPaymentsInactive: woocommercePaymentsStatus === 'inactive',
	};
}
