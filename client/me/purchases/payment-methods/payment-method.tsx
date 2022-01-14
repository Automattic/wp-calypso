import { CompactCard } from '@automattic/components';
import classNames from 'classnames';
import { FunctionComponent } from 'react';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import PaymentMethodDetails from './payment-method-details';
import type { PaymentMethod as PaymentMethodType } from 'calypso/lib/checkout/payment-methods';

import 'calypso/me/purchases/payment-methods/style.scss';

interface Props {
	card?: PaymentMethodType;
}

const PaymentMethod: FunctionComponent< Props > = ( { card, children } ) => {
	return (
		<CompactCard
			className={ classNames( 'payment-method__wrapper', {
				'is-jetpack-cloud': isJetpackCloud(),
			} ) }
		>
			<div className="payment-method">
				{ card ? <PaymentMethodDetails { ...card } /> : children }
			</div>
		</CompactCard>
	);
};

export default PaymentMethod;
