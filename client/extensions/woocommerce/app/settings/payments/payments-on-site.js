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
					label={ translate( 'On-site' ) }
					description={
						translate(
							'Take credit card payments directly on your site, ' +
							'without redirecting customers to a third-party site.'
						)
					} />
					<PaymentMethodList methodType="on-site" />
			</div>
		);
	}
}

export default localize( SettingsPaymentsOnSite );
