import { getSitePurchases } from 'calypso/state/purchases/selectors';

import 'calypso/state/purchases/init';

/**
 * Does the site have any current purchases that can be canceled (i.e. purchases other than legacy premium theme purchases)?
 *
 * Note: there is an is_cancelable flag on the purchase object, but it returns true for legacy premium theme purchases.
 * @param  {Object}  state       global state
 * @param  {number}  siteId      the site ID
 * @param  {?number}  userId      the user ID
 * @returns {boolean} if the site currently has any purchases that can be canceled.
 */
export const hasCancelableSitePurchases = ( state, siteId, userId = null ) => {
	if ( ! state.purchases.hasLoadedSitePurchasesFromServer ) {
		return false;
	}

	let purchases = getSitePurchases( state, siteId ).filter( ( purchase ) => {
		if ( ! purchase.active ) {
			return false;
		}

		if ( purchase.isRefundable ) {
			return true;
		}

		return purchase.productSlug !== 'premium_theme';
	} );

	if ( userId != null ) {
		purchases = purchases.filter( ( purchase ) => Number( purchase.userId ) === userId );
	}

	return purchases && purchases.length > 0;
};

export default hasCancelableSitePurchases;
