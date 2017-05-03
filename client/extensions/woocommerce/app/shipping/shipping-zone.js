/**
 * External dependencies
 */
import React, { Component } from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';

class ShippingZone extends Component {
	render() {
		const { locationName, locationDescription, methodName, methodDescription, icon } = this.props;

		return (
			<div className="shipping__zones-row">
				<div className="shipping__zones-row-icon">
					<Gridicon icon={ icon } size={ 36 } />
				</div>
				<div className="shipping__zones-row-location">
					<p className="shipping__zones-row-location-name">{ locationName }</p>
					<p className="shipping__zones-row-location-description">{ locationDescription }</p>
				</div>
				<div className="shipping__zones-row-method">
					<p className="shipping__zones-row-method-name">{ methodName }</p>
					<p className="shipping__zones-row-method-description">{ methodDescription }</p>
				</div>
				<div className="shipping__zones-row-actions">
					<Button compact>Edit</Button>
				</div>
			</div>
		);
	}
}

export default ShippingZone;
