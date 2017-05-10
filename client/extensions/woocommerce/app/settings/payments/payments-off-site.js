/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';

class SettingsPaymentsOffSite extends Component {

	render() {
		const { translate } = this.props;
		return (
			<div>
				<SectionHeader label={ translate( 'Off-site credit card payment methods' ) } />
				<Card>
					{
						translate(
							'Off-site payment methods involve sending the customer to a ' +
							'third party web site to complete payment, like PayPal. More ' +
							'information'
						)
					}
				</Card>
			</div>
		);
	}

}

export default localize( SettingsPaymentsOffSite );
