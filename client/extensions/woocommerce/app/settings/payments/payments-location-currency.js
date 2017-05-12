/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AddressView from '../../../components/address-view';
import Card from 'components/card';
import ExtendedHeader from '../../../components/extended-header';

class SettingsPaymentsLocationCurrency extends Component {
	constructor( props ) {
		super( props );

		//TODO: use redux state and real data
		this.state = {
			address: {
				name: 'Octopus Outlet Emporium',
				street: '27 Main Street',
				city: 'Ellington, CT 06029',
				country: 'United States'
			},
		};
	}

	render() {
		const { translate } = this.props;
		return (
			<div>
				<ExtendedHeader
					label={ translate( 'Store location and currency' ) }
					description={
						translate(
							'Different payment methods may be available based on your store' +
							'location and currency.'
						)
					} />
				<Card>
					<AddressView
						address={ this.state.address } />
				</Card>
			</div>
		);
	}

}

export default localize( SettingsPaymentsLocationCurrency );
