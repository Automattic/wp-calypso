import {
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_BOOST_PRODUCTS,
	JETPACK_CRM_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_SOCIAL_PRODUCTS,
} from '@automattic/calypso-products';

const ALL_PRODUCTS_WITH_STANDALONE_PLUGIN = [
	...JETPACK_BACKUP_PRODUCTS,
	...JETPACK_BOOST_PRODUCTS,
	...JETPACK_SOCIAL_PRODUCTS,
	...JETPACK_CRM_PRODUCTS,
	...JETPACK_SEARCH_PRODUCTS,
] as ReadonlyArray< string >;

/**
 * Determines if a product slug has a standalone plugin.
 *
 * @example
 * jetpack_backup_daily	      > true
 * jetpack_security_t1_yearly > false
 * @param {string} productSlug Product slug
 * @returns {boolean} Parameters
 */
export default ( productSlug: string ): boolean => {
	return ALL_PRODUCTS_WITH_STANDALONE_PLUGIN.includes( productSlug );
};
