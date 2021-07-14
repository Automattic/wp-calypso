/**
 * External dependencies
 */
import { YOAST_PREMIUM } from '@automattic/calypso-products';
import debugFactory from 'debug';

export const marketplaceDebugger = debugFactory( 'marketplace-debugger' );

export const MARKETPLACE_FLOW_ID = 'marketplace_flow';
export const ANALYTICS_UI_LOCATION_MARKETPLACE_DOMAIN_SELECTION = 'marketplace_domain_selection';

// ********** This section to be refactored out with new definition below **********
export default interface PluginProductMappingInterface {
	readonly 'wordpress-seo': string;
	readonly 'wordpress-seo-premium': string;
}

export const PLUGIN_PRODUCT_MAP: PluginProductMappingInterface = {
	'wordpress-seo': YOAST_PREMIUM,
	'wordpress-seo-premium': YOAST_PREMIUM,
};

export function getProductSlug( pluginSlug: keyof PluginProductMappingInterface ): string {
	return PLUGIN_PRODUCT_MAP[ pluginSlug ];
}
// ************************************************************************************
