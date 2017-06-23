/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import ShippingHeader from './shipping-header';
import ShippingLabels from './shipping-labels';
import ShippingOrigin from './shipping-origin';
import ShippingPackageList from './shipping-package-list';
import ShippingZoneList from './shipping-zone-list';

const Shipping = ( { className } ) => {
	return (
		<Main className={ classNames( 'shipping', className ) }>
			<ShippingHeader />
			<ShippingOrigin />
			<ShippingZoneList />
			<ShippingLabels />
			<ShippingPackageList />
		</Main>
	);
};

Shipping.propTypes = {
	className: PropTypes.string
};

export default Shipping;
