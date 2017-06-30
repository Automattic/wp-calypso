/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import page from 'page';

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
	openShippingZoneForEdit,
	createShippingZoneActionList,
} from 'woocommerce/state/ui/shipping/zones/actions';
import { changeShippingZoneName } from 'woocommerce/state/ui/shipping/zones/actions';
import { getCurrentlyEditingShippingZone } from 'woocommerce/state/ui/shipping/zones/selectors';
import { getCurrentlyEditingShippingZoneLocationsList } from 'woocommerce/state/ui/shipping/zones/locations/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { successNotice, errorNotice } from 'state/notices/actions';
import { getLink } from 'woocommerce/lib/nav-utils';

class Shipping extends Component {
	constructor() {
		super();
		this.onSave = this.onSave.bind( this );
		this.onDelete = this.onDelete.bind( this );
	}

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

	componentWillReceiveProps( { loaded, siteId, zone, site } ) {
		const { params, actions } = this.props;

		//zones loaded, either open one for edit or add new
		if ( ! this.props.loaded && loaded ) {
			if ( isNaN( params.zone ) ) {
				actions.addNewShippingZone( siteId );
			} else {
				actions.openShippingZoneForEdit( siteId, Number( params.zone ) );
			}
		}

		// If the zone currently being edited vanished, then go back
		if ( this.props.zone && ! zone ) {
			page.redirect( getLink( '/store/settings/shipping/:site', site ) );
		}
	}

	onSave() {
		const { siteId, zone, locations, translate, actions } = this.props;
		if ( ! zone.name ) {
			actions.changeShippingZoneName( siteId, getZoneName( zone, locations, translate ) );
		}

		const successAction = successNotice(
			translate( 'Shipping Zone saved correctly.' ),
			{ duration: 4000 }
		);

		const failureAction = errorNotice(
			translate( 'There was a problem saving the Shipping Zone. Please try again.' )
		);

		actions.createShippingZoneActionList( successAction, failureAction );
	}

	onDelete() {
		const { translate, actions } = this.props;

		const successAction = successNotice(
			translate( 'Shipping Zone deleted correctly.' ),
			{ duration: 4000, displayOnNextPage: true }
		);

		const failureAction = errorNotice(
			translate( 'There was a problem deleting the Shipping Zone. Please try again.' )
		);

		actions.createShippingZoneActionList( successAction, failureAction, true );
	}

	render() {
		const { siteId, className, loaded, zone, locations, params } = this.props;
		const isRestOfTheWorld = 0 === Number( params.zone );

		return (
			<Main className={ classNames( 'shipping', className ) }>
				<QueryShippingZones siteId={ siteId } />
				<ShippingZoneHeader
					onSave={ this.onSave }
					onDelete={ this.onDelete } />
				<ShippingZoneName
					siteId={ siteId }
					loaded={ loaded }
					zone={ zone }
					locations={ locations }
					isRestOfTheWorld={ isRestOfTheWorld } />
				{ isRestOfTheWorld
					? null
					: <ShippingZoneLocationList siteId={ siteId } loaded={ loaded } /> }
				<ShippingZoneMethodList
					siteId={ siteId }
					loaded={ loaded } />
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
			site: getSelectedSite( state ),
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
				createShippingZoneActionList,
			}, dispatch
		)
	} ) )( localize( Shipping ) );
