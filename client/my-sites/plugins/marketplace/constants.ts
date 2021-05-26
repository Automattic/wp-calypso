/**
 * External dependencies
 */
import { YOAST_SEO } from '@automattic/calypso-products';

export const MARKETPLACE_FLOW_ID = 'marketplace_flow';
export const ANALYTICS_UI_LOCATION_MARKETPLACE_DOMAIN_SELECTION = 'marketplace_domain_selection';

// Marketplace plugin - product relationship mapped by SLUG
export default interface PluginProductMappingInterface {
	readonly 'wordpress-seo': string;
}

export const PLUGIN_PRODUCT_MAP: PluginProductMappingInterface = {
	'wordpress-seo': YOAST_SEO,
};

export const marektplaceProducts = Object.keys( PLUGIN_PRODUCT_MAP );

export function isMarketplacePlugin( pluginSlug: string ): boolean {
	return marektplaceProducts.includes( pluginSlug );
}

export function getMappedProductSlug( pluginSlug: keyof PluginProductMappingInterface ): string {
	return PLUGIN_PRODUCT_MAP[ pluginSlug ];
}
