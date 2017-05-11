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
import ListRows from '../../../components/list/list-rows';
import ListTable from '../../../components/list/list-table';
import ListTd from '../../../components/list/list-td';
import PaymentMethodRow from './payment-method-row';

class SettingsPaymentsOffSite extends Component {
	constructor( props ) {
		super( props );

		//TODO: use redux state and real data
		this.state = {
			methods: [
				{
					name: 'PayPal Standard',
					suggested: true,
					fee: '2.9% + 30c per transaction',
					information: 'http://paypal.com',
				},
			],
		};
	}

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
							<ListTd width="30">Method</ListTd>
							<ListTd width="45">Fees</ListTd>
							<ListTd width="25"></ListTd>
						</ListHeader>
						<ListRows>
							{ methods && methods.map( ( m ) => this.renderMethodRow( m ) ) }
						</ListRows>
					</ListTable>

			</div>
		);
	}

}

export default localize( SettingsPaymentsOffSite );
