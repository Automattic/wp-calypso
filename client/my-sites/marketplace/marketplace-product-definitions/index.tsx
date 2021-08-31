import { YOAST_PREMIUM, YOAST_FREE, WOO_UPS_SHIPPING } from '@automattic/calypso-products';
import { marketplaceDebugger } from 'calypso/my-sites/marketplace/constants';
import {
	IProductDefinition,
	IProductCollection,
	IProductGroupCollection,
} from 'calypso/my-sites/marketplace/types';

/**
 * A set of logical product groups, grouped by actual products, to be shown in one product (group) page
 * i.e. : YOAST_PREMIUM, YOAST_FREE are 2 products that belong to the product group YOAST
 */
export const YOAST = 'YOAST';
export const WOO = 'WOO';

export const productGroups: IProductGroupCollection = {
	[ YOAST ]: {
		products: {
			[ YOAST_PREMIUM ]: {
				productName: 'Yoast Premium',
				defaultPluginSlug: 'wordpress-seo',
				pluginsToBeInstalled: [ 'wordpress-seo-premium', 'wordpress-seo', 'yoast-test-helper' ],
				isPurchasableProduct: true,
			},
			[ YOAST_FREE ]: {
				productName: 'Yoast Free',
				defaultPluginSlug: 'wordpress-seo',
				pluginsToBeInstalled: [ 'wordpress-seo' ],
				isPurchasableProduct: false,
			},
		},
	},
	[ WOO ]: {
		products: {
			[ WOO_UPS_SHIPPING ]: {
				productName: 'UPS Shipping',
				defaultPluginSlug: 'woocommerce-shipping-ups',
				pluginsToBeInstalled: [ 'woocommerce-shipping-ups', 'woocommerce' ],
				isPurchasableProduct: true,
			},
		},
	},
};

export const getAllProducts = (): IProductCollection =>
	Object.values( productGroups )
		.map( ( productGroup ) => productGroup.products )
		.reduce( ( productsMap, curr ) => ( { ...productsMap, ...curr } ), {} );

/**
 * Provides the plugin that needs to be installed for a given product
 *
 * @param {string} productGroupSlug The product group the product belongs to
 * @param {string} productSlug The product slug being setup.
 * @returns {array[string]} An array of plugin slugs, returns null if product does slug not exist
 */
export function getPluginsToInstall(
	productGroupSlug: keyof IProductGroupCollection,
	productSlug: keyof IProductCollection
): string[] | null {
	const { pluginsToBeInstalled } = productGroups[ productGroupSlug ]?.products[ productSlug ] ?? {};
	return pluginsToBeInstalled ? pluginsToBeInstalled : null;
}

/**
 * Provides the first product found in the product group definition
 *
 * @param {string} productGroupSlug The product group required.\
 * @returns {string} The product slug
 */
export function getDefaultProductInProductGroup(
	productGroupSlug: keyof IProductGroupCollection
): string | null {
	const { products } = productGroups[ productGroupSlug ] ?? {};
	if ( products ) {
		const productKeys = Object.keys( products );
		const [ product ] = productKeys;
		return product ? product : null;
	}
	return null;
}

/**
 * Provides the first plugin found in the product definitions
 *
 * @param {string} productGroupSlug The product group the product belongs to
 * @param {string} productSlug The product slug being setup
 * @returns {string} The plugin slug
 */
export function getDefaultPluginInProduct(
	productGroupSlug: keyof IProductGroupCollection,
	productSlug: keyof IProductCollection
): string | null {
	const { defaultPluginSlug } = productGroups[ productGroupSlug ]?.products[ productSlug ] ?? {};
	return defaultPluginSlug ? defaultPluginSlug : null;
}

/**
 * Provides the first plugin found in the product definitions
 *
 * @param {string} productGroupSlug The product group the product belongs to
 * @param {string} productSlug The product slug
 * @returns {string} The product details
 */
export function getProductDefinition(
	productGroupSlug: keyof IProductGroupCollection,
	productSlug: keyof IProductCollection
): IProductDefinition | null {
	const productDefinition = productGroups[ productGroupSlug ]?.products[ productSlug ];
	if ( ! productDefinition ) {
		marketplaceDebugger(
			`Product does not exist for provided parameters: ${ productGroupSlug }, ${ productSlug }`
		);
		return null;
	}
	return productDefinition;
}

/**
 * Do a simple search of all the products for a given product slug
 *
 * @param {string} productSlug The product slug
 * @returns {string} The product details
 */
export function findProductDefinition(
	productSlug: keyof IProductCollection
): IProductDefinition | null {
	const productDefinition = getAllProducts()[ productSlug ];
	if ( ! productDefinition ) {
		marketplaceDebugger( `Product does not exist for provided parameters: ${ productSlug }` );
		return null;
	}
	return productDefinition;
}
