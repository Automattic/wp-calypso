import { CheckoutModal } from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getPreviousRoute from '../../../../state/selectors/get-previous-route';
import useCartKey from '../../use-cart-key';
import useValidCheckoutBackUrl from '../hooks/use-valid-checkout-back-url';
import { leaveCheckout } from '../lib/leave-checkout';

export const useCheckoutLeaveModal = ( { siteUrl }: { siteUrl: string } ) => {
	const [ isModalVisible, setIsModalVisible ] = useState( false );
	const forceCheckoutBackUrl = useValidCheckoutBackUrl( siteUrl );
	const cartKey = useCartKey();
	const { responseCart, replaceProductsInCart } = useShoppingCart( cartKey );
	const previousPath = useSelector( getPreviousRoute );

	const closeAndLeave = ( options?: {
		userHasClearedCart?: boolean;
		closedWithoutConfirmation?: boolean;
	} ) => {
		const userHasClearedCart = options?.userHasClearedCart ?? false;
		if ( ! options?.closedWithoutConfirmation ) {
			recordTracksEvent( 'calypso_masterbar_checkout_close_modal_submitted', {
				user_has_cleared_cart: userHasClearedCart,
			} );
		}
		leaveCheckout( {
			siteSlug: siteUrl,
			forceCheckoutBackUrl,
			previousPath,
			tracksEvent: 'calypso_masterbar_close_clicked',
			userHasClearedCart: userHasClearedCart,
		} );
	};

	const shouldClearCartWhenLeaving = ! window.location.pathname.startsWith(
		'/checkout/failed-purchases'
	);

	const clickClose = () => {
		if ( shouldClearCartWhenLeaving && responseCart.products.length > 0 ) {
			recordTracksEvent( 'calypso_masterbar_checkout_close_modal_displayed' );
			setIsModalVisible( true );
			return;
		}
		closeAndLeave( {
			closedWithoutConfirmation: true,
		} );
	};

	const clearCartAndLeave = () => {
		replaceProductsInCart( [] );
		closeAndLeave( {
			userHasClearedCart: true,
		} );
	};

	return {
		isModalVisible,
		setIsModalVisible,
		clickClose,
		closeAndLeave,
		clearCartAndLeave,
	};
};

export const LeaveCheckoutModal = ( {
	isModalVisible,
	setIsModalVisible,
	closeAndLeave,
	clearCartAndLeave,
}: ReturnType< typeof useCheckoutLeaveModal > ) => {
	const translate = useTranslate();

	const modalTitleText = translate( 'You are about to leave checkout with items in your cart' );
	const modalBodyText = translate( 'You can leave the items in the cart or empty the cart.' );
	/* translators: The label to a button that will exit checkout without removing items from the shopping cart. */
	const modalPrimaryText = translate( 'Leave items' );
	/* translators: The label to a button that will remove all items from the shopping cart. */
	const modalSecondaryText = translate( 'Empty cart' );

	return (
		<CheckoutModal
			title={ modalTitleText }
			copy={ modalBodyText }
			closeModal={ () => setIsModalVisible( false ) }
			isVisible={ isModalVisible }
			primaryButtonCTA={ modalPrimaryText }
			primaryAction={ closeAndLeave }
			secondaryButtonCTA={ modalSecondaryText }
			secondaryAction={ clearCartAndLeave }
		/>
	);
};
