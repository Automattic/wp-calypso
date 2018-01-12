/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import LabelSettings from 'woocommerce/woocommerce-services/views/label-settings';
import Packages from 'woocommerce/woocommerce-services/views/packages';
import { ProtectFormGuard } from 'lib/protect-form';
import ShippingHeader from './shipping-header';
import ShippingOrigin from './shipping-origin';
import ShippingZoneList from './shipping-zone-list';
import { getSelectedSite } from 'state/ui/selectors';
import { isWcsEnabled } from 'woocommerce/state/selectors/plugins';

class Shipping extends Component {
	state = {
		pristine: true,
	};

	onChange = () => {
		this.setState( { pristine: false } );
	};

	onSaveSuccess = () => {
		this.setState( { pristine: true } );
	};

	render = () => {
		const { className, wcsEnabled } = this.props;

		return (
			<Main className={ classNames( 'shipping', className ) } wideLayout>
				<ShippingHeader onSaveSuccess={ this.onSaveSuccess } />
				<ShippingOrigin onChange={ this.onChange } />
				<ShippingZoneList />
				{ wcsEnabled && <LabelSettings onChange={ this.onChange } /> }
				{ wcsEnabled && <Packages onChange={ this.onChange } /> }
				<ProtectFormGuard isChanged={ ! this.state.pristine } />
			</Main>
		);
	};
}

Shipping.propTypes = {
	className: PropTypes.string,
};

export default connect( state => {
	const site = getSelectedSite( state );
	return {
		wcsEnabled: isWcsEnabled( state, site.ID ),
	};
} )( Shipping );
