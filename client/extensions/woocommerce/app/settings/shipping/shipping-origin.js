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
import Notice from 'components/notice';

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
			<div>
				<ExtendedHeader
					label={ translate( 'Shipping Origin' ) }
					description={ translate( 'The address of where you will be shipping from.' ) } />
				<Notice
					status="is-info"
					className="shipping__address-notice"
					text={ translate( 'This is the address you entered while signing up for a WordPress.com Store.' ) }
					showDismiss={ true } >
				</Notice>
				<Card>
					<AddressView address={ this.state.address } />
				</Card>
			</div>
		);
	}
}

export default localize( ShippingOrigin );
