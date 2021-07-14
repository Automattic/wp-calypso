/**
 * External dependencies
 */
import { YOAST_PREMIUM, YOAST_FREE } from '@automattic/calypso-products';

/**
 * Internal dependencies
 */
import { YOAST } from 'calypso/my-sites/marketplace/marketplace-product-definitions';
export interface IProductDefinition {
	/**
	 * defaultPluginSlug : Some plugins may not be available in the calypso product library so we specify a default plugin that is accessible in the product library
	 * so that relevant details can be shown
	 * */
	defaultPluginSlug: string;
	pluginsToBeInstalled: string[];
	isPurchasableProduct: boolean;
}

export interface IProductCollection {
	[ YOAST_PREMIUM ]: IProductDefinition;
	[ YOAST_FREE ]: IProductDefinition;
}

/**
 * IProductGroupCollection is a one-to-many mapping between logical product groups and actual products
 * */
export interface IProductGroupCollection {
	[ YOAST ]?: {
		products: IProductCollection;
	};
}
