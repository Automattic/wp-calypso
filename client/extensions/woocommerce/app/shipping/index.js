/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import ShippingOrigin from './shipping-origin';
import ShippingZoneList from './shipping-zone-list';
import ShippingLabels from './shipping-labels';
import ShippingPackageList from './shipping-package-list';

class Shipping extends Component {
	render() {
		return (
			<Main className="woocommerce shipping">
				<ShippingOrigin />
				<ShippingZoneList />
				<ShippingLabels />
				<ShippingPackageList />
			</Main>
		);
	}
}

export default Shipping;
