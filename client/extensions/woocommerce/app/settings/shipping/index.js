/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import LabelSettings from 'woocommerce/woocommerce-services/views/label-settings';
import Packages from 'woocommerce/woocommerce-services/views/packages';
import ShippingHeader from './shipping-header';
import ShippingOrigin from './shipping-origin';
import ShippingZoneList from './shipping-zone-list';
import { getSelectedSite } from 'state/ui/selectors';
import { isWcsEnabled } from 'woocommerce/state/selectors/plugins';

const Shipping = ( { className, wcsEnabled } ) => {
	return (
		<Main className={ classNames( 'shipping', className ) } wideLayout>
			<ShippingHeader />
			<ShippingOrigin />
			<ShippingZoneList />
			{ wcsEnabled && <LabelSettings /> }
			{ wcsEnabled && <Packages /> }
		</Main>
	);
};

Shipping.propTypes = {
	className: PropTypes.string,
};

export default connect( state => {
	const site = getSelectedSite( state );
	return {
		wcsEnabled: isWcsEnabled( state, site.ID ),
	};
} )( Shipping );
