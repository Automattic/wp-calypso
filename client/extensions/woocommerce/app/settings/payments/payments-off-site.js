/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */

import ExtendedHeader from '../../../components/extended-header';
import List from '../../../components/list/list';
import ListHeader from '../../../components/list/list-header';
import ListItemField from '../../../components/list/list-item-field';
import PaymentMethodItem from './payment-method-item';

class SettingsPaymentsOffSite extends Component {

	state = {
		methods: [
			{
				label: 'PayPal Standard',
				isSuggested: true,
				fee: '2.9% + 30c per transaction',
				informationUrl: 'http://paypal.com',
			},
		],
	};

	renderMethodItem = ( method ) => {
		return (
			<PaymentMethodItem key={ method.label } method={ method } />
		);
	}

	render() {
		const { translate } = this.props;
		const { methods } = this.state;
		return (
			<div className="payments__off-site-container">
				<ExtendedHeader
					label={ translate( 'Off-site credit card payment methods' ) }
					description={
						translate(
							'Off-site payment methods involve sending the customer to a ' +
							'third party web site to complete payment, like PayPal. More ' +
							'information'
						)
					} />
					<List>
						<ListHeader>
							<ListItemField className="payments__methods-column-method">
								{ translate( 'Method' ) }
							</ListItemField>
							<ListItemField className="payments__methods-column-fees">
								{ translate( 'Fees' ) }
							</ListItemField>
							<ListItemField className="payments__methods-column-settings">
							</ListItemField>
						</ListHeader>
						{ methods && methods.map( this.renderMethodItem ) }
					</List>
			</div>
		);
	}

}

export default localize( SettingsPaymentsOffSite );
