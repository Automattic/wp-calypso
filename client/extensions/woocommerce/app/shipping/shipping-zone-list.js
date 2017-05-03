/**
 * External dependencies
 */
import React, { Component } from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ShippingHeader from './shipping-header';
import ShippingZone from './shipping-zone';

class ShippingZoneList extends Component {
	render() {
		const __ = i18n.translate;

		return (
			<div>
				<ShippingHeader
					label={ __( 'Shipping Zones' ) }
					description={ __( 'Where you will ship and method of which you will ship to' ) }>
					<Button>{ __( 'Add zone' ) }</Button>
				</ShippingHeader>
				<Card className="shipping__zones">
					<div className="shipping__zones-row shipping__zones-header">
						<div className="shipping__zones-row-icon"></div>
						<div className="shipping__zones-row-location">{ __( 'Location' ) }</div>
						<div className="shipping__zones-row-method">{ __( 'Shipping method' ) }</div>
						<div className="shipping__zones-row-actions" />
					</div>
					<ShippingZone
						locationName="United States"
						locationDescription="50 states"
						methodName="USPS"
						methodDescription="All domestic services"
						icon="location" />
					<ShippingZone
						locationName="Rest of the world"
						locationDescription="240 countries"
						methodName="USPS"
						methodDescription="All international services"
						icon="globe" />
				</Card>
			</div>
		);
	}
}

export default ShippingZoneList;
