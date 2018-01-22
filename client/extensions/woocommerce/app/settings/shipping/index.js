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
		pristineUnits: true,
		pristineShippingSettings: true,
	};

	onChangeUnits = () => {
		this.setState( { pristineUnits: false } );
	};

	onChangeShippingSettings = () => {
		this.setState( { pristineShippingSettings: false } );
	};

	onSaveSuccess = () => {
		this.setState( { pristineUnits: true, pristineShippingSettings: false } );
	};

	render = () => {
		const { className, wcsEnabled } = this.props;
		const toSave = {
			units: this.state.pristineUnits,
			shippingSettings: this.state.pristineShippingSettings,
		};

		return (
			<Main className={ classNames( 'shipping', className ) } wideLayout>
				<ShippingHeader onSaveSuccess={ this.onSaveSuccess } toSave={ toSave } />
				<ShippingOrigin onChange={ this.onChangeUnits } />
				<ShippingZoneList />
				{ wcsEnabled && <LabelSettings onChange={ this.onChangeShippingSettings } /> }
				{ wcsEnabled && <Packages onChange={ this.onChangeShippingSettings } /> }
				<ProtectFormGuard
					isChanged={ ! ( this.state.pristineUnits || this.state.pristineShippingSettings ) }
				/>
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
