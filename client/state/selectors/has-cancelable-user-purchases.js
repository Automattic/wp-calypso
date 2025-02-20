import { getAllSubscriptions } from 'calypso/state/memberships/subscriptions/selectors';
import { getUserPurchases } from 'calypso/state/purchases/selectors';
import 'calypso/state/purchases/init';

/**
 * Does the user have any current purchases that can be canceled (i.e. purchases other than legacy premium theme purchases)?
 *
 * Note: there is an is_cancelable flag on the purchase object, but it returns true for legacy premium theme purchases.
 * @param  {Object}  state       global state
 * @returns {boolean} if the user currently has any purchases that can be canceled.
 */
export const hasCancelableUserPurchases = ( state ) => {
	const purchases = getUserPurchases( state );
	const subscriptions = getAllSubscriptions( state );

	const hasRefundablePurchases =
		purchases &&
		purchases.some(
			( purchase ) => purchase.isRefundable || purchase.productSlug !== 'premium_theme'
		);
	const hasRenewableSubscriptions =
		subscriptions &&
		subscriptions.some(
			( subscription ) => subscription.status === 'active' && subscription.is_renewable
		);

	return hasRefundablePurchases || hasRenewableSubscriptions;
};

export default hasCancelableUserPurchases;
