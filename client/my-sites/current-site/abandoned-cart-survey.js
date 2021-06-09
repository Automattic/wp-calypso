/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useShoppingCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import { hasStaleItem } from 'calypso/lib/cart-values/cart-items';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getUserPurchases } from 'calypso/state/purchases/selectors';
import { triggerEvent } from 'calypso/lib/analytics/hotjar';

let eventTriggered = false;

export default function AbandonedCartSurvey() {
	useShowAbandonedCartSurvey();
	return null;
}

function useShowAbandonedCartSurvey() {
	const user = useSelector( getCurrentUser );
	const userPurchases = useSelector( ( state ) => getUserPurchases( state, user?.ID ) );

	const { responseCart, isPendingUpdate } = useShoppingCart();
	useEffect( () => {
		if (
			! eventTriggered &&
			! isPendingUpdate &&
			hasStaleItem( responseCart ) &&
			! userPurchases
		) {
			triggerEvent( 'abandoned_cart_survey' );
			eventTriggered = true;
		}
	}, [ user, isPendingUpdate, userPurchases, responseCart ] );
}
