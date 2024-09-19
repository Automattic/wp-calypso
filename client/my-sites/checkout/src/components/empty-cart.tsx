import { CheckoutStepBody } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getPreviousPath from 'calypso/state/selectors/get-previous-path';
import type { ResponseCart } from '@automattic/shopping-cart';

export function EmptyCart() {
	const reduxDispatch = useDispatch();
	const previousPath = useSelector( getPreviousPath );
	const referrer = window?.document?.referrer ?? '';
	useEffect( () => {
		reduxDispatch(
			recordTracksEvent( 'calypso_checkout_empty_cart', {
				previous_path: previousPath ?? '',
				referrer,
			} )
		);
	}, [ reduxDispatch, previousPath, referrer ] );

	return (
		<CheckoutStepBody
			stepId="empty-cart"
			isStepActive={ false }
			isStepComplete
			titleContent={ <EmptyCartTitle /> }
			completeStepContent={ <EmptyCartExplanation /> }
		/>
	);
}

function EmptyCartTitle() {
	const translate = useTranslate();
	return <>{ String( translate( 'You have no items in your cart' ) ) }</>;
}

function EmptyCartExplanation() {
	const translate = useTranslate();
	return (
		<>
			{ translate(
				'If you were trying to add something to your cart, there may have been a problem. Try adding it again.'
			) }
		</>
	);
}

export function shouldShowEmptyCartPage( {
	responseCart,
	areWeRedirecting,
	areThereErrors,
	isCartPendingUpdate,
	isInitialCartLoading,
}: {
	responseCart: ResponseCart;
	areWeRedirecting: boolean;
	areThereErrors: boolean;
	isCartPendingUpdate: boolean;
	isInitialCartLoading: boolean;
} ): boolean {
	if ( responseCart.products.length > 0 ) {
		return false;
	}
	if ( areWeRedirecting ) {
		return false;
	}
	if ( areThereErrors ) {
		return true;
	}
	if ( isCartPendingUpdate ) {
		return false;
	}
	if ( isInitialCartLoading ) {
		return false;
	}
	return true;
}
