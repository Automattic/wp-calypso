/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import PaymentLogo, { POSSIBLE_TYPES } from '../index';

class PaymentLogoExamples extends React.PureComponent {
	static displayName = 'PaymentLogo';

	render() {
		const sortedVendors = sortBy( POSSIBLE_TYPES );

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div className="payment-logo-example">
				<h3>Empty Placeholder</h3>

				<PaymentLogo type="placeholder" />

				<h3>Supported Vendors</h3>

				{ sortedVendors.map(
					type =>
						type !== 'placeholder' && (
							<div key={ type } className="payment-logo__example">
								<PaymentLogo type={ type } isCompact={ false } />
								{ type === 'paypal' && <PaymentLogo type={ type } isCompact={ true } /> }
							</div>
						)
				) }
			</div>
		);
	}
}

export default PaymentLogoExamples;
