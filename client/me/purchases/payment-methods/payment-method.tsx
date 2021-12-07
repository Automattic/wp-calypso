import { CompactCard } from '@automattic/components';
import { FunctionComponent } from 'react';
import PaymentMethodDetails from './payment-method-details';
import type { PaymentMethod as PaymentMethodType } from 'calypso/lib/checkout/payment-methods';

import 'calypso/me/purchases/payment-methods/style.scss';

interface Props {
	card?: PaymentMethodType;
}

const PaymentMethod: FunctionComponent< Props > = ( { card, children } ) => {
	return (
		<CompactCard className="payment-method__wrapper">
			<div className="payment-method">
				{ card ? <PaymentMethodDetails { ...card } /> : children }
			</div>
		</CompactCard>
	);
};

export default PaymentMethod;
