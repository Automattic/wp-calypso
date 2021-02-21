/**
 * Internal dependencies
 */
import { abtest } from 'calypso/lib/abtest';
import { getPlan, applyTestFiltersToPlansList } from 'calypso/lib/plans';

/**
 * Computes a plan object and a related product object based on plan slug/constant
 *
 * @param {Array[]} products A list of products
 * @param {string} planSlug Plan constant/slug
 * @returns {object} Object with a related plan and product objects
 */
export const planSlugToPlanProduct = ( products, planSlug ) => {
	const plan = getPlan( planSlug );
	const planConstantObj = applyTestFiltersToPlansList( plan, abtest );
	return {
		planSlug,
		plan: planConstantObj,
		product: products[ planSlug ],
	};
};
