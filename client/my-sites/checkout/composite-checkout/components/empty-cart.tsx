/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { useTranslate } from 'i18n-calypso';
import { CheckoutStepBody } from '@automattic/composite-checkout';
import { useSelector, useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getPreviousPath from 'calypso/state/selectors/get-previous-path';

export default function EmptyCart(): JSX.Element {
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
			isStepComplete={ true }
			titleContent={ <EmptyCartTitle /> }
			completeStepContent={ <EmptyCartExplanation /> }
		/>
	);
}

function EmptyCartTitle(): JSX.Element {
	const translate = useTranslate();
	return <>{ String( translate( 'You have no items in your cart' ) ) }</>;
}

function EmptyCartExplanation(): JSX.Element {
	const translate = useTranslate();
	return (
		<>
			{ translate(
				'If you were trying to add something to your cart, there may have been a problem. Try adding it again.'
			) }
		</>
	);
}
