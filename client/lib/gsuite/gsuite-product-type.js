import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
} from '@automattic/calypso-products';
import { GOOGLE_WORKSPACE_PRODUCT_TYPE, GSUITE_PRODUCT_TYPE } from 'calypso/lib/gsuite/constants';

/**
 * Retrieves the product type to use as slug in urls for the specified product slug.
 *
 * @param {string} productSlug - slug of the product
 * @returns {string} the corresponding product type
 * @see emailManagementAddGSuiteUsers() in client/my-sites/email/paths.js
 */
export function getProductType( productSlug ) {
	if (
		[
			GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
			GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
		].includes( productSlug )
	) {
		return GOOGLE_WORKSPACE_PRODUCT_TYPE;
	}

	return GSUITE_PRODUCT_TYPE;
}
