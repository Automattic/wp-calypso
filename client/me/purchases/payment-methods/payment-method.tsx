import { CompactCard } from '@automattic/components';
import classNames from 'classnames';
import { FunctionComponent } from 'react';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

import 'calypso/me/purchases/payment-methods/style.scss';

const PaymentMethod: FunctionComponent = ( { children } ) => {
	return (
		<CompactCard
			className={ classNames( 'payment-method__wrapper', {
				'is-jetpack-cloud': isJetpackCloud(),
			} ) }
		>
			<div className="payment-method">{ children }</div>
		</CompactCard>
	);
};

export default PaymentMethod;
