/**
 * Internal dependencies
 */
import { getSitePurchases } from 'state/purchases/selectors';

/**
 * Does the site have any current purchases that can be canceled (i.e. purchases other than premium themes)?
 *
 * Note: there is an is_cancelable flag on the purchase object, but it returns true for premium themes.
 *
 * @param  {object}  state       global state
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

		return purchase.productSlug !== 'premium_theme';
	} );

	return purchases && purchases.length > 0;
};

export default hasCancelableSitePurchases;
