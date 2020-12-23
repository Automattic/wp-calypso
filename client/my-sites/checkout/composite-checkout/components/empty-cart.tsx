/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { CheckoutStepBody } from '@automattic/composite-checkout';

export default function EmptyCart(): JSX.Element {
	return (
		<CheckoutStepBody
			stepId="empty-cart"
			isStepActive={ false }
			isStepComplete
			titleContent={ <EmptyCartTitle /> }
		/>
	);
}

function EmptyCartTitle(): JSX.Element {
	const translate = useTranslate();
	return <>{ String( translate( 'You have no items in your cart' ) ) }</>;
}
