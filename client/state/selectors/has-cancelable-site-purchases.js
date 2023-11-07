import { getSitePurchases } from 'calypso/state/purchases/selectors';
import 'calypso/state/purchases/init';
import isTrialPlan from '../sites/plans/selectors/trials/is-trial-plan';

/**
 * Does the site have any current purchases that can be canceled (i.e. purchases other than legacy premium theme purchases)?
 * Trial plans are not actual purchases, so they are not cancelable.
 *
 * Note: there is an is_cancelable flag on the purchase object, but it returns true for legacy premium theme purchases.
 * @param  {Object}  state       global state
 * @param  {number}  siteId      the site ID
 * @returns {boolean} if the site currently has any purchases that can be canceled.
 */
export const hasCancelableSitePurchases = ( state, siteId ) => {
	if ( ! state.purchases.hasLoadedSitePurchasesFromServer ) {
		return false;
	}

	const purchases = getSitePurchases( state, siteId ).filter( ( purchase ) => {
		if ( ! purchase.active ) {
			return false;
		}

		if ( purchase.isRefundable ) {
			return true;
		}

		const isTrial = isTrialPlan( purchase );

		if ( isTrial || purchase.productSlug === 'premium_theme' ) {
			return false;
		}

		return true;
	} );

	return purchases && purchases.length > 0;
};

export default hasCancelableSitePurchases;
