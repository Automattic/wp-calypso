/**
 * External dependencies
 */
import React from 'react';
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
import { getLink } from 'woocommerce/lib/nav-utils';
import { getShippingZones } from 'woocommerce/state/ui/shipping/zones/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';

const ShippingZoneList = ( { site, siteId, loaded, shippingZones, translate } ) => {
	const renderContent = () => {
		const renderShippingZone = ( zone, index ) => {
			return ( <ShippingZoneEntry key={ index } siteId={ siteId } loaded={ loaded } { ...zone } /> );
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
				{ zonesToRender.map( renderShippingZone ) }
			</div>
		);
	};

	const addNewHref = loaded
		? getLink( '/store/settings/shipping/:site/zone/new', site )
		: '#';

	const onAddNewClick = ( event ) => {
		if ( ! loaded ) {
			event.preventDefault();
		}
	};

	return (
		<div>
			<QueryShippingZones siteId={ siteId } />
			<ExtendedHeader
				label={ translate( 'Shipping Zones' ) }
				description={ translate( 'The regions you ship to and the methods you will provide.' ) }>
				<Button
					href={ addNewHref }
					onClick={ onAddNewClick }
					disabled={ ! loaded }>{
					translate( 'Add zone' ) }
				</Button>
			</ExtendedHeader>
			<Card className="shipping__zones">
				{ renderContent() }
			</Card>
		</div>
	);
};

export default connect(
	( state ) => ( {
		site: getSelectedSite( state ),
		siteId: getSelectedSiteId( state ),
		shippingZones: getShippingZones( state ),
		loaded: areShippingZonesFullyLoaded( state ),
	} )
)( localize( ShippingZoneList ) );
