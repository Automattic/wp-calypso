/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import ShippingLabels from './shipping-labels';
import ShippingOrigin from './shipping-origin';
import ShippingPackageList from './shipping-package-list';
import ShippingZone from './shipping-zone/index';
import ShippingZoneList from './shipping-zone-list';
import { isCurrentlyEditingShippingZone } from 'woocommerce/state/ui/shipping/zones/selectors';

const Shipping = ( { className, isEditingZone } ) => {
	if ( isEditingZone ) {
		return <ShippingZone className={ className } />;
	}

	return (
		<Main className={ classNames( 'shipping', className ) }>
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

export default connect(
	( state ) => ( {
		isEditingZone: isCurrentlyEditingShippingZone( state )
	} )
)( Shipping );
