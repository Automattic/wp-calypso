/**
 * External dependencies
 */

import { every } from 'lodash';
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
		pristine: { units: true, shipping: true },
	};

	onChangeUnits = () => {
		this.setState( { pristine: Object.assign( {}, this.state.pristine, { units: false } ) } );
	};

	onChangeShipping = () => {
		this.setState( { pristine: Object.assign( {}, this.state.pristine, { shipping: false } ) } );
	};

	onSaveSuccess = ( option ) => {
		this.setState( { pristine: Object.assign( {}, this.state.pristine, { [ option ]: true } ) } );
	};

	render = () => {
		const { className, wcsEnabled } = this.props;
		const { pristine } = this.state;
		const toSave = { units: ! pristine.units, shipping: ! pristine.shipping };

		return (
			<Main className={ classNames( 'shipping', className ) } wideLayout>
				<ShippingHeader onSaveSuccess={ this.onSaveSuccess } toSave={ toSave } />
				<ShippingOrigin onChange={ this.onChangeUnits } />
				<ShippingZoneList />
				{ wcsEnabled && <LabelSettings onChange={ this.onChangeShipping } /> }
				{ wcsEnabled && <Packages onChange={ this.onChangeShipping } /> }
				<ProtectFormGuard isChanged={ ! every( this.state.pristine ) } />
			</Main>
		);
	};
}

Shipping.propTypes = {
	className: PropTypes.string,
};

export default connect( ( state ) => {
	const site = getSelectedSite( state );
	return {
		wcsEnabled: isWcsEnabled( state, site.ID ),
	};
} )( Shipping );
