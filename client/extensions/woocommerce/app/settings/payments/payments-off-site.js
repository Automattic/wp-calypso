/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import PaymentMethodList from './payment-method-list';
import ExtendedHeader from 'woocommerce/components/extended-header';

class SettingsPaymentsOnSite extends Component {

	render() {
		const { translate } = this.props;

		return (
			<div className="payments__type-container">
				<ExtendedHeader
					label={ translate( 'Off-site' ) }
					description={
						translate(
							'Take payments through a third-party site, like PayPal. ' +
							'Customers will leave your store to pay.'
						)
					} />
					<PaymentMethodList methodType="off-site" />
			</div>
		);
	}
}

export default localize( SettingsPaymentsOnSite );
