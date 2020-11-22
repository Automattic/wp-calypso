/**
 * External dependencies
 */
import React, { FunctionComponent, ComponentProps } from 'react';

/**
 * Internal dependencies
 */
import PaymentMethodDetails from './payment-method-details';
import { Card } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	card: ComponentProps< typeof PaymentMethodDetails >;
}

const PaymentMethod: FunctionComponent< Props > = ( { card, children } ) => {
	return (
		<Card className="payment-method__wrapper">
			<div className="payment-method">
				{ card ? <PaymentMethodDetails { ...card } /> : children }
			</div>
		</Card>
	);
};

export default PaymentMethod;
