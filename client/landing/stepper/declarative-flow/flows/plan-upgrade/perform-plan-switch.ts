import { cancelAndRefundPurchase } from '@automattic/api-core';
import { addQueryArgs } from '@wordpress/url';
import { dashboardLink, dashboardOrigins } from 'calypso/dashboard/utils/link';

export interface PerformPlanSwitchArgs {
	/** The purchase being downgraded. */
	purchaseId: number;
	/** The product the user is switching to. */
	targetProductId: number;
	/** Used to build the legacy `/me/purchases` destination. */
	siteSlug: string;
	/** Where the flow was launched from; decides dashboard vs. legacy surface. */
	redirectTo?: string | null;
	/** Refund the user will receive, if any, surfaced in the success notice. */
	refund?: { amount: number; currencySymbol: string } | null;
}

/**
 * Performs a plan downgrade ("switch") and navigates to the appropriate
 * purchase-settings surface.
 *
 * On success it redirects straight to the new subscription's settings (using the
 * `new_subscription_id` the backend returns) with a `downgraded` notice; on
 * failure it returns to the original purchase with a `downgrade_failed` notice so
 * the user can retry or contact support.
 *
 * `navigate` is injected so the side effect can be asserted in tests.
 */
export async function performPlanSwitch(
	{ purchaseId, targetProductId, siteSlug, redirectTo, refund }: PerformPlanSwitchArgs,
	navigate: ( url: string ) => void = ( url ) => window.location.assign( url )
): Promise< void > {
	const isFromDashboard = redirectTo
		? dashboardOrigins().some( ( origin ) => redirectTo.startsWith( origin ) )
		: false;

	const legacyPurchaseUrl = ( id: number | string ) =>
		'/me/purchases/' + encodeURIComponent( siteSlug ) + '/' + id;

	try {
		const response = await cancelAndRefundPurchase( purchaseId, {
			type: 'downgrade',
			to_product_id: targetProductId,
		} );

		const params: Record< string, string > = { downgraded: 'true' };
		if ( refund && refund.amount > 0 ) {
			params.refund = String( refund.amount );
			params.currency = refund.currencySymbol;
		}

		const newSubscriptionId = response.new_subscription_id;
		let destination: string;
		if ( newSubscriptionId ) {
			destination = isFromDashboard
				? dashboardLink( '/me/billing/purchases/' + newSubscriptionId )
				: legacyPurchaseUrl( newSubscriptionId );
		} else {
			// Fallback: the backend didn't return a new subscription id.
			destination = redirectTo || dashboardLink( '/sites' );
		}

		navigate( addQueryArgs( destination, params ) );
	} catch {
		const errorDestination = isFromDashboard
			? dashboardLink( '/me/billing/purchases/' + purchaseId )
			: legacyPurchaseUrl( purchaseId );
		navigate( addQueryArgs( errorDestination, { downgrade_failed: 'true' } ) );
	}
}
