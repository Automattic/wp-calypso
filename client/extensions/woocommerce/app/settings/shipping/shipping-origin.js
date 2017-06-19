/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AddressView from 'woocommerce/components/address-view';
import Card from 'components/card';
import ExtendedHeader from 'woocommerce/components/extended-header';

class ShippingOrigin extends Component {
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
			<div className="shipping__origin">
				<ExtendedHeader
					label={ translate( 'Shipping Origin' ) }
					description={ translate( 'The address of where you will be shipping from.' ) } />
				<Card>
					<AddressView address={ this.state.address } />
				</Card>
			</div>
		);
	}
}

export default localize( ShippingOrigin );
