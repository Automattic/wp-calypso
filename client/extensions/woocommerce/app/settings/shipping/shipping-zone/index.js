/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import QueryShippingZones, { areShippingZonesFullyLoaded } from 'woocommerce/components/query-shipping-zones';
import ShippingZoneHeader from './shipping-zone-header';
import ShippingZoneLocations from './shipping-zone-locations';
import ShippingZoneMethodList from './shipping-zone-method-list';
import ShippingZoneName from './shipping-zone-name';
import {
	addNewShippingZone,
	openShippingZoneForEdit
} from 'woocommerce/state/ui/shipping/zones/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { protectForm } from 'lib/protect-form';

class Shipping extends Component {
	componentWillMount() {
		const { params, siteId, loaded, actions } = this.props;

		if ( loaded ) {
			if ( isNaN( params.zone ) ) {
				actions.addNewShippingZone( siteId );
			} else {
				actions.openShippingZoneForEdit( siteId, Number( params.zone ) );
			}
		}
	}

	componentWillReceiveProps( { loaded, siteId } ) {
		const { params, actions } = this.props;

		//zones loaded, either open one for edit or add new
		if ( ! this.props.loaded && loaded ) {
			if ( isNaN( params.zone ) ) {
				actions.addNewShippingZone( siteId );
			} else {
				actions.openShippingZoneForEdit( siteId, Number( params.zone ) );
			}
		}
	}

	render() {
		const { siteId, className, loaded, markSaved, markChanged } = this.props;

		return (
			<Main className={ classNames( 'shipping', className ) }>
				<QueryShippingZones siteId={ siteId } />
				<ShippingZoneHeader onSave={ markSaved } />
				<ShippingZoneName siteId={ siteId } loaded={ loaded } onChange={ markChanged } />
				<ShippingZoneLocations loaded={ loaded } onChange={ markChanged } />
				<ShippingZoneMethodList siteId={ siteId } loaded={ loaded } onChange={ markChanged } />
			</Main>
		);
	}
}

Shipping.propTypes = {
	className: PropTypes.string,
	params: PropTypes.object,
};

export default connect(
	( state ) => ( {
		siteId: getSelectedSiteId( state ),
		loaded: areShippingZonesFullyLoaded( state ),
	} ),
	( dispatch ) => ( {
		actions: bindActionCreators(
			{
				addNewShippingZone,
				openShippingZoneForEdit,
			}, dispatch
		)
	} ) )( protectForm( Shipping ) );
