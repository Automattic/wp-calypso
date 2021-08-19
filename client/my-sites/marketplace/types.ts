import { YOAST_PREMIUM, YOAST_FREE } from '@automattic/calypso-products';
import { YOAST } from 'calypso/my-sites/marketplace/marketplace-product-definitions';
export interface IProductDefinition {
	productName: string;

	/**
	 * Some plugins may not be available in the calypso product library ( i.e. wordpress-seo-premium ) so we specify a default plugin that is accessible in the product library
	 * so that relevant details can be shown
	 * */
	defaultPluginSlug: string;

	/**
	 * While this array is not in use right now, it indicates the plugins that need to be installed as part of the product
	 * Eventually when moving this logic to the backend this can be part of the Market Place product entity
	 * */
	pluginsToBeInstalled: string[];

	/**
	 * Some products like yoast free do not require a product purchase. In these instances the "product_slug" does not exist in our backend billing daddy configurations.
	 * We have however introduced dummy products in the calypso product library so that we can maintain a product details in declarative data structure.
	 * Hence the product is not purchasable ( and is a dummy product i.e. yoast_free ) we maintain a flag to indicate this.
	 *
	 * */
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
