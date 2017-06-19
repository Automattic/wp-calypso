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
import ShippingZoneHeader from './shipping-zone-header';
import ShippingZoneLocations from './shipping-zone-locations';
import ShippingZoneMethodList from './shipping-zone-method-list';
import { fetchShippingZones } from 'woocommerce/state/sites/shipping-zones/actions';
import {
	addNewShippingZone,
	openShippingZoneForEdit
} from 'woocommerce/state/ui/shipping/zones/actions';
import { areShippingZonesLoaded } from 'woocommerce/state/sites/shipping-zones/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { protectForm } from 'lib/protect-form';

class Shipping extends Component {
	componentWillMount() {
		const { zone, siteId, loaded, actions } = this.props;

		if ( siteId ) {
			if ( ! loaded ) {
				actions.fetchShippingZones( siteId );
			} else if ( isNaN( zone ) ) {
				actions.addNewShippingZone( siteId );
			} else {
				actions.openShippingZoneForEdit( siteId, Number( zone ) );
			}
		}
	}

	componentWillReceiveProps( { loaded, siteId } ) {
		const { zone, actions } = this.props;

		//site ID changed, fetch new zones
		if ( siteId !== this.props.siteId ) {
			actions.fetchShippingZones( siteId );
		}

		//zones loaded, either open one for edit or add new
		if ( ! this.props.loaded && loaded ) {
			if ( isNaN( zone ) ) {
				actions.addNewShippingZone( siteId );
			} else {
				actions.openShippingZoneForEdit( siteId, Number( zone ) );
			}
		}
	}

	render() {
		const { siteId, className, loaded, markSaved, markChanged } = this.props;

		return (
			<Main className={ classNames( 'shipping', className ) }>
				<ShippingZoneHeader onSave={ markSaved } />
				<ShippingZoneLocations loaded={ loaded } onChange={ markChanged } />
				<ShippingZoneMethodList siteId={ siteId } loaded={ loaded } onChange={ markChanged } />
			</Main>
		);
	}
}

Shipping.propTypes = {
	className: PropTypes.string,
	zoneId: PropTypes.string
};

export default connect(
	( state ) => ( {
		siteId: getSelectedSiteId( state ),
		loaded: areShippingZonesLoaded( state ),
	} ),
	( dispatch ) => ( {
		actions: bindActionCreators(
			{
				fetchShippingZones,
				addNewShippingZone,
				openShippingZoneForEdit
			}, dispatch
		)
	} ) )( protectForm( Shipping ) );
