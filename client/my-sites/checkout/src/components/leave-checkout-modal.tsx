import { useShoppingCart, useShoppingCartManagerClient } from '@automattic/shopping-cart';
import { Button, Modal, __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getPreviousRoute from '../../../../state/selectors/get-previous-route';
import useCartKey from '../../use-cart-key';
import useValidCheckoutBackUrl from '../hooks/use-valid-checkout-back-url';
import { getGiftCheckoutBackUrl } from '../lib/get-gift-checkout-back-url';
import { leaveCheckout } from '../lib/leave-checkout';

export const useCheckoutLeaveModal = ( { siteUrl }: { siteUrl: string } ) => {
	const [ isModalVisible, setIsModalVisible ] = useState( false );
	const [ stepBackUrl, setStepBackUrl ] = useState< string | undefined >( undefined );
	const forceCheckoutBackUrl = useValidCheckoutBackUrl( siteUrl );
	// When a flow supplies a dedicated "back to domains" URL, emptying the cart
	// sends the user there rather than to the plan-step back URL — the plan they
	// were choosing no longer exists, so the domain step is the right restart
	// point. An explicit step-back URL still wins so the user's chosen step is
	// honored.
	const forceCheckoutBackUrlDomains = useValidCheckoutBackUrl(
		siteUrl,
		undefined,
		'checkoutBackUrlDomains'
	);
	const cartKey = useCartKey();
	const {
		responseCart,
		replaceProductsInCart,
		isLoading: isCartLoading,
		isPendingUpdate: isCartPendingUpdate,
		loadingError: cartLoadingError,
	} = useShoppingCart( cartKey );
	const giftBackUrl = getGiftCheckoutBackUrl( {
		giftDetails: responseCart.gift_details,
		referrer: document.referrer,
	} );
	// Used to lazily clear the siteless 'no-site'/'no-user' carts used by
	// signup steps before a site exists. /start/domain/domain-only adds the
	// domain to 'no-site' (logged-in) or 'no-user' (logged-out); if the user
	// then picks "New site" the checkout runs against the freshly-created
	// site's cart and the original siteless cart goes untouched. Emptying the
	// cart from checkout has to clear those too, or the leftover items
	// reappear when the user is redirected back to the signup origin via
	// `skippedCheckout=1`. We access these via the manager client rather than
	// `useShoppingCart()` to avoid eagerly fetching both siteless carts on
	// every checkout page load.
	const cartManagerClient = useShoppingCartManagerClient();
	const previousPath = useSelector( getPreviousRoute );

	const closeAndLeave = ( options?: {
		userHasClearedCart?: boolean;
		closedWithoutConfirmation?: boolean;
		forceBackUrl?: string;
	} ) => {
		const userHasClearedCart = options?.userHasClearedCart ?? false;
		if ( ! options?.closedWithoutConfirmation ) {
			recordTracksEvent( 'calypso_masterbar_checkout_close_modal_submitted', {
				user_has_cleared_cart: userHasClearedCart,
			} );
		}
		leaveCheckout( {
			siteSlug: siteUrl,
			forceCheckoutBackUrl:
				options?.forceBackUrl ?? stepBackUrl ?? forceCheckoutBackUrl ?? giftBackUrl,
			previousPath,
			tracksEvent: 'calypso_masterbar_close_clicked',
			userHasClearedCart: userHasClearedCart,
		} );
	};

	const shouldClearCartWhenLeaving = ! window.location.pathname.startsWith(
		'/checkout/failed-purchases'
	);

	const confirmOrLeave = ( backUrl?: string ) => {
		// A plain close must use the default back URL, not a step-back URL left
		// over from an earlier `clickStepBack` whose modal was dismissed.
		setStepBackUrl( backUrl );
		if ( shouldClearCartWhenLeaving && responseCart.products.length > 0 ) {
			recordTracksEvent( 'calypso_masterbar_checkout_close_modal_displayed' );
			setIsModalVisible( true );
			return;
		}
		closeAndLeave( { closedWithoutConfirmation: true, forceBackUrl: backUrl } );
	};

	const clickClose = () => {
		confirmOrLeave();
	};

	const clickStepBack = ( destinationUrl: string ) => {
		confirmOrLeave( destinationUrl );
	};

	const clearCartAndLeave = async () => {
		// `replaceProductsInCart` debounces the POST via setTimeout and resolves
		// only after the server confirms. `closeAndLeave` triggers a hard
		// navigation (`window.location.href = ...`) which cancels any in-flight
		// or queued requests, so we have to await every cart-clear before
		// leaving — otherwise the items stay on the server and reappear when
		// the user lands back on the signup step.
		const clearPromises: Promise< unknown >[] = [ replaceProductsInCart( [] ) ];
		if ( cartKey !== 'no-site' ) {
			clearPromises.push(
				cartManagerClient.forCartKey( 'no-site' ).actions.replaceProductsInCart( [] )
			);
		}
		if ( cartKey !== 'no-user' ) {
			clearPromises.push(
				cartManagerClient.forCartKey( 'no-user' ).actions.replaceProductsInCart( [] )
			);
		}
		try {
			await Promise.all( clearPromises );
		} catch ( err ) {
			// Leave checkout even if a cart-clear fails so the user is never
			// trapped on the modal, but record the failure so it isn't silent.
			recordTracksEvent( 'calypso_masterbar_checkout_close_modal_clear_failed', {
				error: err instanceof Error ? err.message : String( err ),
			} );
		}
		closeAndLeave( {
			userHasClearedCart: true,
			forceBackUrl: stepBackUrl ?? forceCheckoutBackUrlDomains,
		} );
	};

	return {
		isModalVisible,
		setIsModalVisible,
		// The cart answers both questions "Back" depends on: whether to ask about
		// saving the cart (does it hold anything?) and, for a gift checkout, where
		// to go (`gift_details`). Neither is known until the cart arrives, so the
		// control stays disabled rather than acting on a placeholder.
		//
		// `isLoading` alone is not enough: it only covers the initial fetch, and
		// the products this URL asks for are added afterwards, in a second
		// round-trip. The gap is widest for the siteless carts a gift checkout
		// uses, because a 'no-user' cart never fetches — it resolves its initial
		// cart locally and empty — so the control would go live while the gifted
		// plan (and with it `gift_details`) is still on its way to the server.
		// `isPendingUpdate` covers that window. A cart that failed to load stops
		// waiting, so a broken cart can't trap the user in checkout.
		isLeaveDisabled: ( isCartLoading || isCartPendingUpdate ) && ! cartLoadingError,
		clickClose,
		clickStepBack,
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

	const modalTitleText = translate( 'Save your cart for later?' );
	/* translators: The label to a button that will exit checkout without removing items from the shopping cart. */
	const modalPrimaryText = translate( 'Save cart' );
	/* translators: The label to a button that will remove all items from the shopping cart. */
	const modalSecondaryText = translate( 'Empty cart' );

	if ( ! isModalVisible ) {
		return null;
	}

	return (
		<Modal
			title={ modalTitleText }
			onRequestClose={ () => setIsModalVisible( false ) }
			size="small"
		>
			<HStack justify="flex-end" spacing={ 2 }>
				<Button __next40pxDefaultSize variant="tertiary" onClick={ () => clearCartAndLeave() }>
					{ modalSecondaryText }
				</Button>
				<Button __next40pxDefaultSize variant="primary" onClick={ () => closeAndLeave() }>
					{ modalPrimaryText }
				</Button>
			</HStack>
		</Modal>
	);
};
