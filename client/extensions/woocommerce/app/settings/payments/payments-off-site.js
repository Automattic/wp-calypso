/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ExtendedHeader from '../../../components/extended-header';

class SettingsPaymentsOffSite extends Component {

	render() {
		const { translate } = this.props;
		return (
			<div>
				<ExtendedHeader
					label={ translate( 'Off-site credit card payment methods' ) }
					description={
						translate(
							'Off-site payment methods involve sending the customer to a ' +
							'third party web site to complete payment, like PayPal. More ' +
							'information'
						)
					} />
				<Card></Card>
			</div>
		);
	}

}

export default localize( SettingsPaymentsOffSite );
