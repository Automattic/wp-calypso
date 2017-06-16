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
					label={ translate( 'On-site credit card payment methods' ) }
					description={
						translate(
							'Keep customers on your site while they enter their ' +
							'credit card details and complete payment.'
						)
					} />
					<PaymentMethodList methodType="on-site" />
			</div>
		);
	}
}

export default localize( SettingsPaymentsOnSite );
