/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import QueryShippingZones, { areShippingZonesFullyLoaded } from 'woocommerce/components/query-shipping-zones';
import ShippingZoneHeader from './shipping-zone-header';
import ShippingZoneLocationList from './shipping-zone-location-list';
import ShippingZoneMethodList from './shipping-zone-method-list';
import ShippingZoneName, { getZoneName } from './shipping-zone-name';
import {
	addNewShippingZone,
	openShippingZoneForEdit
} from 'woocommerce/state/ui/shipping/zones/actions';
import { changeShippingZoneName } from 'woocommerce/state/ui/shipping/zones/actions';
import { getCurrentlyEditingShippingZone } from 'woocommerce/state/ui/shipping/zones/selectors';
import { getCurrentlyEditingShippingZoneLocationsList } from 'woocommerce/state/ui/shipping/zones/locations/selectors';
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
		const { siteId, className, loaded, markSaved, markChanged, params, zone, locations, actions, translate } = this.props;
		const isRestOfTheWorld = 0 === Number( params.zone );

		const onSave = () => {
			actions.changeShippingZoneName( siteId, getZoneName( zone, locations, translate ) );

			//TODO: saving

			markSaved();
		};

		return (
			<Main className={ classNames( 'shipping', className ) }>
				<QueryShippingZones siteId={ siteId } />
				<ShippingZoneHeader onSave={ onSave } />
				<ShippingZoneName
					siteId={ siteId }
					loaded={ loaded }
					zone={ zone }
					locations={ locations }
					isRestOfTheWorld={ isRestOfTheWorld }
					onChange={ markChanged } />
				{ isRestOfTheWorld
					? null
					: <ShippingZoneLocationList siteId={ siteId } loaded={ loaded } onChange={ markChanged } /> }
				<ShippingZoneMethodList
					siteId={ siteId }
					loaded={ loaded }
					onChange={ markChanged } />
			</Main>
		);
	}
}

Shipping.propTypes = {
	className: PropTypes.string,
	params: PropTypes.object,
};

export default connect(
	( state ) => {
		const loaded = areShippingZonesFullyLoaded( state );

		return {
			siteId: getSelectedSiteId( state ),
			loaded,
			zone: loaded && getCurrentlyEditingShippingZone( state ),
			locations: loaded && getCurrentlyEditingShippingZoneLocationsList( state, 20 ),
		};
	},
	( dispatch ) => ( {
		actions: bindActionCreators(
			{
				addNewShippingZone,
				openShippingZoneForEdit,
				changeShippingZoneName,
			}, dispatch
		)
	} ) )( localize( protectForm( Shipping ) ) );
