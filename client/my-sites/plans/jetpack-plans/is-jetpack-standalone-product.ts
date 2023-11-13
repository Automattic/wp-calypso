import {
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_BOOST_PRODUCTS,
	JETPACK_CRM_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_SOCIAL_PRODUCTS,
	JETPACK_VIDEOPRESS_PRODUCTS,
} from '@automattic/calypso-products';

const ALL_JETPACK_STANDALONE_PRODUCTS = [
	...JETPACK_BACKUP_PRODUCTS,
	...JETPACK_BOOST_PRODUCTS,
	...JETPACK_SOCIAL_PRODUCTS,
	...JETPACK_CRM_PRODUCTS,
	...JETPACK_SEARCH_PRODUCTS,
	...JETPACK_VIDEOPRESS_PRODUCTS,
] as ReadonlyArray< string >;

/**
 * Determines if a Jetpack product is a standalone product.
 * @example
 * jetpack_backup_daily	      > true
 * jetpack_security_t1_yearly > false
 * @param {string} productSlug Product slug
 * @returns {boolean} Parameters
 */
export const isJetpackStandaloneProduct = ( productSlug: string ): boolean => {
	return ALL_JETPACK_STANDALONE_PRODUCTS.includes( productSlug );
};
