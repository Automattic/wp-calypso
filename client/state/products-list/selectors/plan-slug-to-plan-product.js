import {
	applyTestFiltersToPlansList,
	applyTestFiltersToProductsList,
	getPlan,
	getProductFromSlug,
	objectIsProduct,
} from '@automattic/calypso-products';

/**
 * Computes a plan object and a related product object based on plan slug/constant
 *
 * @param {Array[]} products A list of products
 * @param {string} planOrProductSlug Plan constant/slug
 * @returns {object} Object with a related plan and product objects
 */
export const planSlugToPlanProduct = ( products, planOrProductSlug ) => {
	const plan = getPlan( planOrProductSlug ) ?? getProductFromSlug( planOrProductSlug );
	const constantObj = objectIsProduct( plan )
		? applyTestFiltersToProductsList( plan )
		: applyTestFiltersToPlansList( plan, undefined );
	return {
		planSlug: planOrProductSlug,
		plan: plan === planOrProductSlug ? null : constantObj,
		product: products[ planOrProductSlug ],
	};
};
