/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ExtendedHeader from 'woocommerce/components/extended-header';
import ShippingZoneEntry from './shipping-zone-list-entry';
import QueryShippingZones, { areShippingZonesFullyLoaded } from 'woocommerce/components/query-shipping-zones';
import Notice from 'components/notice';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getShippingZones } from 'woocommerce/state/ui/shipping/zones/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { areShippingZonesLocationsValid } from 'woocommerce/state/sites/shipping-zone-locations/selectors';

class ShippingZoneList extends Component {
	renderContent = () => {
		const { siteId, loaded, shippingZones, isValid, translate } = this.props;

		const renderShippingZone = ( zone, index ) => {
			return ( <ShippingZoneEntry key={ index } siteId={ siteId } loaded={ loaded } isValid={ isValid } { ...zone } /> );
		};

		const zonesToRender = loaded ? shippingZones : [ {}, {}, {} ];

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
			? getLink( '/store/settings/shipping/:site/zone/new', site )
			: '#';

		return (
			<div>
				<QueryShippingZones siteId={ siteId } />
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
		const loaded = areShippingZonesFullyLoaded( state );

		return {
			site: getSelectedSite( state ),
			siteId: getSelectedSiteId( state ),
			shippingZones: getShippingZones( state ),
			loaded,
			isValid: ! loaded || areShippingZonesLocationsValid( state ),
		};
	}
)( localize( ShippingZoneList ) );
