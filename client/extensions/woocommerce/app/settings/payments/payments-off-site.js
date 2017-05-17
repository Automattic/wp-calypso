/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */

import ExtendedHeader from '../../../components/extended-header';
import ListHeader from '../../../components/list/list-header';
import ListRowField from '../../../components/list/list-row-field';
import ListRows from '../../../components/list/list-rows';
import ListTable from '../../../components/list/list-table';
import PaymentMethodRow from './payment-method-row';

class SettingsPaymentsOffSite extends Component {

	state = {
		methods: [
			{
				name: 'PayPal Standard',
				suggested: true,
				fee: '2.9% + 30c per transaction',
				information: 'http://paypal.com',
			},
		],
	};

	renderMethodRow = ( method ) => {
		return (
			<PaymentMethodRow key={ method.name } method={ method } />
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
					<ListTable>
						<ListHeader>
							<ListRowField className="payments__methods-column-method">
								{ translate( 'Method' ) }
							</ListRowField>
							<ListRowField className="payments__methods-column-fees">
								{ translate( 'Fees' ) }
							</ListRowField>
							<ListRowField className="payments__methods-column-settings">
							</ListRowField>
						</ListHeader>
						<ListRows>
							{ methods && methods.map( this.renderMethodRow ) }
						</ListRows>
					</ListTable>
			</div>
		);
	}

}

export default localize( SettingsPaymentsOffSite );
