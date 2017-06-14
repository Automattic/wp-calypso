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

class SettingsPaymentsOffline extends Component {

	render() {
		const { translate } = this.props;
		return (
			<div className="payments__type-container">
				<ExtendedHeader
					label={ translate( 'Offline payment methods' ) }
					description={
						translate(
							'Allow customers to pay you manually using methods like bank ' +
							'transfer, check or cash on delivery.'
						)
					} />
				<PaymentMethodList methodType="offline" />
			</div>
		);
	}

}

export default localize( SettingsPaymentsOffline );
