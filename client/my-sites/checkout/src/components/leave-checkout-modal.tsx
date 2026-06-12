import { useShoppingCart, useShoppingCartManagerClient } from '@automattic/shopping-cart';
import { Button, Modal, __experimentalHStack as HStack } from '@wordpress/components';
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
	const [ stepBackUrl, setStepBackUrl ] = useState< string | undefined >( undefined );
	const forceCheckoutBackUrl = useValidCheckoutBackUrl( siteUrl );
	const cartKey = useCartKey();
	const { responseCart, replaceProductsInCart } = useShoppingCart( cartKey );
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
			forceCheckoutBackUrl: options?.forceBackUrl ?? stepBackUrl ?? forceCheckoutBackUrl,
			previousPath,
			tracksEvent: 'calypso_masterbar_close_clicked',
			userHasClearedCart: userHasClearedCart,
		} );
	};

	const shouldClearCartWhenLeaving = ! window.location.pathname.startsWith(
		'/checkout/failed-purchases'
	);

	const clickClose = () => {
		// A plain close must use the default back URL, not a step-back URL left
		// over from an earlier `clickStepBack` whose modal was dismissed.
		setStepBackUrl( undefined );
		if ( shouldClearCartWhenLeaving && responseCart.products.length > 0 ) {
			recordTracksEvent( 'calypso_masterbar_checkout_close_modal_displayed' );
			setIsModalVisible( true );
			return;
		}
		closeAndLeave( {
			closedWithoutConfirmation: true,
		} );
	};

	const clickStepBack = ( destinationUrl: string ) => {
		setStepBackUrl( destinationUrl );
		if ( shouldClearCartWhenLeaving && responseCart.products.length > 0 ) {
			recordTracksEvent( 'calypso_masterbar_checkout_close_modal_displayed' );
			setIsModalVisible( true );
			return;
		}
		closeAndLeave( { closedWithoutConfirmation: true, forceBackUrl: destinationUrl } );
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
		} );
	};

	return {
		isModalVisible,
		setIsModalVisible,
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
