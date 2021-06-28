/**
 * External dependencies
 */
import { YOAST_SEO } from '@automattic/calypso-products';
import debugFactory from 'debug';

export const marketplaceDebugger = debugFactory( 'marketplace-debugger' );

export const MARKETPLACE_FLOW_ID = 'marketplace_flow';
export const ANALYTICS_UI_LOCATION_MARKETPLACE_DOMAIN_SELECTION = 'marketplace_domain_selection';

// Marketplace plugin - product relationship mapped by SLUG
export default interface PluginProductMappingInterface {
	readonly 'wordpress-seo': string;
	readonly 'wordpress-seo-premium': string;
}

// TODO: Refactor to a product indexed map of plugins
export const PLUGIN_PRODUCT_MAP: PluginProductMappingInterface = {
	'wordpress-seo': YOAST_SEO,
	'wordpress-seo-premium': YOAST_SEO,
};

export function getProductSlug( pluginSlug: keyof PluginProductMappingInterface ): string {
	return PLUGIN_PRODUCT_MAP[ pluginSlug ];
}
