/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import ShippingZoneHeader from './shipping-zone-header';
import ShippingZoneLocations from './shipping-zone-locations';
import ShippingZoneMethodList from './shipping-zone-method-list';

const Shipping = ( { className } ) => {
	return (
		<Main className={ classNames( 'shipping', className ) }>
			<ShippingZoneHeader />
			<ShippingZoneLocations />
			<ShippingZoneMethodList />
		</Main>
	);
};

Shipping.propTypes = {
	className: PropTypes.string,
	zoneId: PropTypes.string
};

export default Shipping;
