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

class SettingsPaymentsOffline extends Component {
	render() {
		const { translate } = this.props;
		return (
			<div className="payments__type-container">
				<ExtendedHeader
					label={ translate( 'Offline' ) }
					description={ translate( 'Take payments in-person.' ) }
				/>
				<PaymentMethodList methodType="offline" />
			</div>
		);
	}
}

export default localize( SettingsPaymentsOffline );
