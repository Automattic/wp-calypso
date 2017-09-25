/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import ShippingZoneEntry from './shipping-zone-list-entry';
import Button from 'components/button';
import Card from 'components/card';
import Notice from 'components/notice';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import ExtendedHeader from 'woocommerce/components/extended-header';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';
import QueryShippingZones, { areShippingZonesFullyLoaded } from 'woocommerce/components/query-shipping-zones';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getActionList } from 'woocommerce/state/action-list/selectors';
import { areSettingsGeneralLoaded, areSettingsGeneralLoadError } from 'woocommerce/state/sites/settings/general/selectors';
import { areShippingZonesLocationsValid } from 'woocommerce/state/sites/shipping-zone-locations/selectors';
import { createAddDefultShippingZoneActionList } from 'woocommerce/state/ui/shipping/zones/actions';
import { getShippingZones } from 'woocommerce/state/ui/shipping/zones/selectors';

class ShippingZoneList extends Component {
	componentWillMount() {
		if ( this.props.loaded ) {
			this.props.actions.createAddDefultShippingZoneActionList();
		}
	}

	componentWillReceiveProps( { loaded } ) {
		if ( ! this.props.loaded && loaded && ! this.props.savingZones ) {
			this.props.actions.createAddDefultShippingZoneActionList();
		}
	}

	renderContent = () => {
		const { siteId, loaded, fetchError, shippingZones, isValid, translate } = this.props;

		const renderShippingZone = ( zone, index ) => {
			return ( <ShippingZoneEntry key={ index } siteId={ siteId } loaded={ loaded } isValid={ isValid } { ...zone } /> );
		};

		let zonesToRender = loaded ? shippingZones : [ {}, {}, {} ];
		if ( fetchError ) {
			zonesToRender = [];
		}

		return (
			<div>
				<div className="shipping__zones-row shipping__zones-header">
					<div className="shipping__zones-row-icon"></div>
					<div className="shipping__zones-row-location">{ translate( 'Location' ) }</div>
					<div className="shipping__zones-row-methods">{ translate( 'Shipping methods' ) }</div>
					<div className="shipping__zones-row-actions" />
				</div>
				{ ! isValid && <Notice
					status="is-warning"
					className="shipping__zones-notice"
					text={ translate( 'Invalid shipping locations detected in one or more zones' ) }
					showDismiss={ false } /> }
				{ zonesToRender.map( renderShippingZone ) }
			</div>
		);
	}

	onAddNewClick = ( event ) => {
		if ( ! this.props.loaded ) {
			event.preventDefault();
		}
	}

	render() {
		const { site, siteId, loaded, isValid, translate } = this.props;

		const addNewHref = loaded
			? getLink( '/store/settings/shipping/zone/:site/', site )
			: '#';

		return (
			<div>
				<QueryShippingZones siteId={ siteId } />
				<QuerySettingsGeneral siteId={ siteId } />
				<ExtendedHeader
					label={ translate( 'Shipping Zones' ) }
					description={ translate( 'These are the regions you’ll ship to. ' +
						'You can define different shipping methods for each region. ' ) }>
					<Button
						href={ addNewHref }
						onClick={ this.onAddNewClick }
						disabled={ ! isValid || ! loaded }>{
						translate( 'Add zone' ) }
					</Button>
				</ExtendedHeader>
				<Card className="shipping__zones">
					{ this.renderContent() }
				</Card>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const savingZones = Boolean( getActionList( state ) );
		const loaded = areShippingZonesFullyLoaded( state ) && areSettingsGeneralLoaded( state ) && ! savingZones;

		return {
			site: getSelectedSite( state ),
			siteId: getSelectedSiteId( state ),
			shippingZones: getShippingZones( state ),
			savingZones,
			loaded,
			fetchError: areSettingsGeneralLoadError( state ), // TODO: add shipping zones/methods fetch errors too
			isValid: ! loaded || areShippingZonesLocationsValid( state ),
		};
	},
	( dispatch ) => ( {
		actions: bindActionCreators( {
			createAddDefultShippingZoneActionList,
		}, dispatch )
	} )
)( localize( ShippingZoneList ) );
