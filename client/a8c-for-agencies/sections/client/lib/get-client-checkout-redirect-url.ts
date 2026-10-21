import { addQueryArgs } from '@wordpress/url';

export const CLIENT_PURCHASE_COMPLETED_QUERY_ARG = 'client_purchase_completed';
export const WPCOM_PLAN_PURCHASED_QUERY_ARG = 'wpcom_plan_purchased';

export default function getClientCheckoutRedirectUrl(
	subscriptionsUrl: string,
	wpcomHostingProductSlug?: string
) {
	return addQueryArgs( subscriptionsUrl, {
		[ CLIENT_PURCHASE_COMPLETED_QUERY_ARG ]: 'true',
		...( wpcomHostingProductSlug && {
			[ WPCOM_PLAN_PURCHASED_QUERY_ARG ]: wpcomHostingProductSlug,
		} ),
	} );
}
