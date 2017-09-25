/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import ShippingHeader from './shipping-header';
import ShippingOrigin from './shipping-origin';
import ShippingZoneList from './shipping-zone-list';
import Main from 'components/main';
import config from 'config';
import LabelSettings from 'woocommerce/woocommerce-services/views/label-settings';
import Packages from 'woocommerce/woocommerce-services/views/packages';

const Shipping = ( { className } ) => {
	const wcsEnabled = config.isEnabled( 'woocommerce/extension-wcservices' );

	return (
		<Main className={ classNames( 'shipping', className ) }>
			<ShippingHeader />
			<ShippingOrigin />
			<ShippingZoneList />
			{ wcsEnabled && <LabelSettings /> }
			{ wcsEnabled && <Packages /> }
		</Main>
	);
};

Shipping.propTypes = {
	className: PropTypes.string
};

export default Shipping;
