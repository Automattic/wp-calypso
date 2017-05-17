/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */

import ExtendedHeader from '../../../components/extended-header';
import Table from '../../../components/table/table';
import TableHeader from '../../../components/table/table-header';
import TableRowField from '../../../components/table/table-row-field';
import TableRows from '../../../components/table/table-rows';
import PaymentMethodRow from './payment-method-row';

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

	renderMethodRow = ( method ) => {
		return (
			<PaymentMethodRow key={ method.label } method={ method } />
		);
	}

	render() {
		const { translate } = this.props;
		const { methods } = this.state;
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
					<Table>
						<TableHeader>
							<TableRowField className="payments__methods-column-method">
								{ translate( 'Method' ) }
							</TableRowField>
							<TableRowField className="payments__methods-column-fees">
								{ translate( 'Fees' ) }
							</TableRowField>
							<TableRowField className="payments__methods-column-settings">
							</TableRowField>
						</TableHeader>
						<TableRows>
							{ methods && methods.map( this.renderMethodRow ) }
						</TableRows>
					</Table>
			</div>
		);
	}

}

export default localize( SettingsPaymentsOffSite );
