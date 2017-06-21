/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ExtendedHeader from 'woocommerce/components/extended-header';
import PaymentMethodList from './payment-method-list';

class SettingsPaymentsOnSite extends Component {

	render() {
		const { translate } = this.props;

		return (
			<div className="payments__type-container">
				<ExtendedHeader
					label={ translate( 'Off-site credit card payment methods' ) }
					description={
						translate(
							'Payment takes place on a third-party site, ' +
							'such as on PayPal.'
						)
					} />
					<PaymentMethodList methodType="off-site" />
			</div>
		);
	}
}

export default localize( SettingsPaymentsOnSite );
