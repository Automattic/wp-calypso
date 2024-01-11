import { RequestCartProduct } from '@automattic/shopping-cart/src/types';
import wpcom from 'calypso/lib/wp';

export type GetBillingIntentResponse = {
	id: number;
	user_id: number;
	blog_id: number;
	billing_plan_id: number;
	type: string;
	payload: {
		product_slug: string;
		blog_id: number;
		user_id: number;
		name: string;
		price: number;
		currency: string;
		billing_period: string;
		billing_interval: number;
		return_url: string;
		store_product_slug: string;
	};
	status: string;
	date_created: string;
	date_updated: string;
};

/**
 * Gets the billing intent for a given intent ID.
 * @param {number} intentId Billing intent ID.
 * @returns {Promise} Promise object represents the result of the request.
 */
export const getBillingIntent = ( intentId: number ): Promise< GetBillingIntentResponse > => {
	return wpcom.req.get( {
		path: `/marketplace/vendor/billing-intent/${ intentId }`,
		apiNamespace: 'wpcom/v2',
	} );
};

/**
 * Gets the cart product for a given intent ID.
 * @param {number} intentId Billing intent ID.
 * @returns {Promise} Promise RequestCartProduct object represents the billing intent or null.
 */
export const getCartProductByBillingIntentId = async (
	intentId: number
): Promise< RequestCartProduct | null > => {
	try {
		const billingIntent = await getBillingIntent( intentId );

		return {
			product_slug: billingIntent.payload.store_product_slug,
			meta: String( billingIntent.billing_plan_id ),
			extra: {
				isMarketplaceSitelessCheckout: true,
				intentId: intentId,
			},
			volume: 1,
			quantity: null,
		};
	} catch ( error ) {
		return null;
	}
};
