/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import accept from 'lib/accept';
import FormattedHeader from 'components/formatted-header';
import Main from 'components/main';
import QueryShippingZones, {
	areShippingZonesFullyLoaded,
} from 'woocommerce/components/query-shipping-zones';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';
import { areSettingsGeneralLoaded } from 'woocommerce/state/sites/settings/general/selectors';
import ShippingZoneHeader from './shipping-zone-header';
import ShippingZoneLocationList from './shipping-zone-location-list';
import ShippingZoneMethodList from './shipping-zone-method-list';
import ShippingZoneName from './shipping-zone-name';
import {
	addNewShippingZone,
	openShippingZoneForEdit,
	createShippingZoneSaveActionList,
	createShippingZoneDeleteActionList,
} from 'woocommerce/state/ui/shipping/zones/actions';
import { getCurrentlyEditingShippingZone } from 'woocommerce/state/ui/shipping/zones/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { successNotice, errorNotice } from 'state/notices/actions';
import { getLink } from 'woocommerce/lib/nav-utils';
import { ProtectFormGuard } from 'lib/protect-form';
import { getSaveZoneActionListSteps } from 'woocommerce/state/data-layer/ui/shipping-zones';

class Shipping extends Component {
	constructor() {
		super();
		this.onSave = this.onSave.bind( this );
		this.onDelete = this.onDelete.bind( this );
	}

	UNSAFE_componentWillMount() {
		const { params, siteId, loaded, actions } = this.props;

		if ( loaded ) {
			if ( isNaN( params.zone ) ) {
				actions.addNewShippingZone( siteId );
			} else {
				actions.openShippingZoneForEdit( siteId, Number( params.zone ) );
			}
		}
	}

	UNSAFE_componentWillReceiveProps( { loaded, siteId, zone, site } ) {
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

		// If the zone didn't have a real ID before but it does now, change the URL from /zone/new to /zone/ID
		if ( this.props.zone && isNaN( this.props.zone.id ) && zone && ! isNaN( zone.id ) ) {
			page.replace(
				getLink( '/store/settings/shipping/zone/:site/' + zone.id, site ),
				null,
				false,
				false
			);
		}
	}

	onSave() {
		const { zone, translate, actions } = this.props;

		const successAction = successNotice(
			isNaN( zone.id ) ? translate( 'Shipping Zone added.' ) : translate( 'Shipping Zone saved.' ),
			{ duration: 4000 }
		);

		const failureAction = errorNotice(
			translate( 'There was a problem saving the Shipping Zone. Please try again.' )
		);

		const locationsFailAction = errorNotice(
			translate( 'Add at least one location to this zone' ),
			{ duration: 4000 }
		);

		const methodsFailAction = errorNotice( translate( 'Add shipping methods to this zone' ), {
			duration: 4000,
		} );

		actions.createShippingZoneSaveActionList(
			successAction,
			failureAction,
			locationsFailAction,
			methodsFailAction
		);
	}

	onDelete() {
		const { translate, actions } = this.props;

		const areYouSure = translate(
			'Are you sure you want to permanently delete this shipping zone?'
		);

		accept( areYouSure, function ( accepted ) {
			if ( ! accepted ) {
				return;
			}

			const successAction = successNotice( translate( 'Shipping Zone deleted.' ), {
				duration: 4000,
				displayOnNextPage: true,
			} );

			const failureAction = errorNotice(
				translate( 'There was a problem deleting the Shipping Zone. Please try again.' )
			);

			actions.createShippingZoneDeleteActionList( successAction, failureAction );
		} );
	}

	render() {
		const { className, isRestOfTheWorld, hasEdits, siteId, translate } = this.props;

		return (
			<Main className={ classNames( 'shipping', className ) } wideLayout>
				<ProtectFormGuard isChanged={ hasEdits } />
				<QueryShippingZones siteId={ siteId } />
				<QuerySettingsGeneral siteId={ siteId } />
				<ShippingZoneHeader onSave={ this.onSave } onDelete={ this.onDelete } />
				<FormattedHeader headerText={ translate( 'Add a Shipping Zone' ) } />
				{ ! isRestOfTheWorld && <ShippingZoneLocationList siteId={ siteId } /> }
				<ShippingZoneMethodList siteId={ siteId } />
				{ ! isRestOfTheWorld && <ShippingZoneName siteId={ siteId } /> }
			</Main>
		);
	}
}

Shipping.propTypes = {
	className: PropTypes.string,
	params: PropTypes.object,
};

export default connect(
	( state, ownProps ) => {
		const loaded = areShippingZonesFullyLoaded( state ) && areSettingsGeneralLoaded( state );
		const zone = loaded && getCurrentlyEditingShippingZone( state );
		const isRestOfTheWorld = 0 === Number( ownProps.params.zone );

		return {
			siteId: getSelectedSiteId( state ),
			site: getSelectedSite( state ),
			loaded,
			zone,
			isRestOfTheWorld,
			hasEdits: Boolean( zone && 0 !== getSaveZoneActionListSteps( state ).length ),
		};
	},
	( dispatch ) => ( {
		actions: bindActionCreators(
			{
				addNewShippingZone,
				openShippingZoneForEdit,
				createShippingZoneSaveActionList,
				createShippingZoneDeleteActionList,
			},
			dispatch
		),
	} )
)( localize( Shipping ) );
