/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ExtendedHeader from 'woocommerce/components/extended-header';

class SettingsPaymentsOnSite extends Component {

	render() {
		const { translate } = this.props;
		return (
			<div>
				<ExtendedHeader
					label={ translate( 'On-site credit card payment methods' ) }
					description={
						translate(
							'On-site methods provide a seamless experience by keeping the ' +
							'customer on your site to enter their credit card details and ' +
							'complete checkout. More information'
						)
					} />
				<Card></Card>
			</div>
		);
	}

}

export default localize( SettingsPaymentsOnSite );
