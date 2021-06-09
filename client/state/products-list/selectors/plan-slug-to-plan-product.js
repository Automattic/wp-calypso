/**
 * Internal dependencies
 */
import { getPlan, applyTestFiltersToPlansList } from '@automattic/calypso-products';

/**
 * Computes a plan object and a related product object based on plan slug/constant
 *
 * @param {Array[]} products A list of products
 * @param {string} planSlug Plan constant/slug
 * @returns {object} Object with a related plan and product objects
 */
export const planSlugToPlanProduct = ( products, planSlug ) => {
	const plan = getPlan( planSlug );
	const planConstantObj = applyTestFiltersToPlansList( plan, undefined );
	return {
		planSlug,
		plan: planConstantObj,
		product: products[ planSlug ],
	};
};
