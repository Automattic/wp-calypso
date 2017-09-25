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

class SettingsPaymentsOffline extends Component {

	render() {
		const { translate } = this.props;
		return (
			<div className="payments__type-container">
				<ExtendedHeader
					label={ translate( 'Offline' ) }
					description={
						translate(
							'Take payments in-person.'
						)
					} />
				<PaymentMethodList methodType="offline" />
			</div>
		);
	}

}

export default localize( SettingsPaymentsOffline );
