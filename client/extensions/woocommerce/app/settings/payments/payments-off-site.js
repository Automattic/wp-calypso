/** @format */
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
					label={ translate( 'Off-site' ) }
					description={ translate(
						'Take payments through a third-party site, like PayPal. ' +
							'Customers will leave your store to pay.'
					) }
				/>
				<PaymentMethodList methodType="off-site" />
			</div>
		);
	}
}

export default localize( SettingsPaymentsOnSite );
