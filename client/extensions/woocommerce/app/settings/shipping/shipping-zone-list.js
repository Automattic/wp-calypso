/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ExtendedHeader from 'woocommerce/components/extended-header';
import ShippingZone from './shipping-zone';
import ShippingZoneDialog from './shipping-zone-dialog';

class ShippingZoneList extends Component {
	constructor( props ) {
		super( props );

		//TODO: use redux state with real data
		this.state = {
			showDialog: false,
			shippingZones: [ {
				locationName: 'United States',
				locationDescription: '50 states',
				methods: [ {
					name: 'USPS',
					description: 'All domestic services',
				}, {
					name: 'Flat Rate',
					description: 'Minimum spend: $100',
				} ],
				icon: 'location'
			}, {
				locationName: 'Rest of the world',
				locationDescription: '240 countries',
				methods: [ {
					name: 'USPS',
					description: 'All international services',
				} ],
				icon: 'globe'
			} ],
		};
	}

	renderShippingZone( zone, index ) {
		return ( <ShippingZone key={ index } { ...zone } /> );
	}

	render() {
		const { translate } = this.props;

		const onAddZoneOpen = () => {
			this.setState( { showDialog: true } );
		};

		const onAddZoneClose = () => {
			this.setState( { showDialog: false } );
		};

		return (
			<div>
				<ExtendedHeader
					label={ translate( 'Shipping Zones' ) }
					description={ translate( 'The regions you ship to and the methods you will provide.' ) }>
					<Button onClick={ onAddZoneOpen }>{ translate( 'Add zone' ) }</Button>
				</ExtendedHeader>
				<Card className="shipping__zones">
					<div className="shipping__zones-row shipping__zones-header">
						<div className="shipping__zones-row-icon"></div>
						<div className="shipping__zones-row-location">{ translate( 'Location' ) }</div>
						<div className="shipping__zones-row-methods">{ translate( 'Shipping methods' ) }</div>
						<div className="shipping__zones-row-actions" />
					</div>
					{ this.state.shippingZones.map( this.renderShippingZone ) }
				</Card>
				<ShippingZoneDialog isVisible={ this.state.showDialog } onClose={ onAddZoneClose } />
			</div>
		);
	}
}

export default localize( ShippingZoneList );
