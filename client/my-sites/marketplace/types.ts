/**
 * External dependencies
 */
import { YOAST_PREMIUM, YOAST_FREE } from '@automattic/calypso-products';

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
 * A set of logical product groups, grouped by actual products, to be shown in one product (group) page
 * i.e. : YOAST_PREMIUM, YOAST_FREE are 2 products that belong to the product group YOAST
 * */
export const YOAST = 'YOAST';

/**
 * IProductGroupCollection is a one-to-many mapping between logical product groups and actual products
 * */
export interface IProductGroupCollection {
	[ YOAST ]?: {
		products: IProductCollection;
	};
}
