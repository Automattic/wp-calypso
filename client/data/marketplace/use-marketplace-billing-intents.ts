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
