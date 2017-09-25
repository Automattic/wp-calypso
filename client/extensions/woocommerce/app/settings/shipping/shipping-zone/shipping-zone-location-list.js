/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ShippingZoneLocationDialog from './shipping-zone-location-dialog';
import Button from 'components/button';
import { decodeEntities } from 'lib/formatting';
import ExtendedHeader from 'woocommerce/components/extended-header';
import List from 'woocommerce/components/list/list';
import ListHeader from 'woocommerce/components/list/list-header';
import ListItem from 'woocommerce/components/list/list-item';
import ListItemField from 'woocommerce/components/list/list-item-field';
import LocationFlag from 'woocommerce/components/location-flag';
import { areShippingZonesFullyLoaded } from 'woocommerce/components/query-shipping-zones';
import { bindActionCreatorsWithSiteId } from 'woocommerce/lib/redux-utils';
import { areSettingsGeneralLoaded, areSettingsGeneralLoadError } from 'woocommerce/state/sites/settings/general/selectors';
import { openEditLocations } from 'woocommerce/state/ui/shipping/zones/locations/actions';
import { getCurrentlyEditingShippingZoneLocationsList } from 'woocommerce/state/ui/shipping/zones/locations/selectors';

const ShippingZoneLocationList = ( { siteId, loaded, fetchError, translate, locations, actions } ) => {
	const getLocationFlag = ( location ) => {
		if ( 'continent' === location.type ) {
			return null;
		}

		if ( 'state' === location.type ) {
			return <LocationFlag code={ location.countryCode } />;
		}

		return <LocationFlag code={ location.code } />;
	};

	const getLocationDescription = ( location ) => {
		switch ( location.type ) {
			case 'continent':
				if ( location.selectedCountryCount && location.selectedCountryCount !== location.countryCount ) {
					return translate(
						'%(selected)s out of %(count)s country',
						'%(selected)s out of %(count)s countries',
						{
							count: location.countryCount,
							args: {
								selected: location.selectedCountryCount,
								count: location.countryCount,
							}
						}
					);
				}

				return translate( 'All countries' );
			case 'country':
				if ( location.postcodeFilter ) {
					return translate( 'Specific postcodes: %s', { args: [ location.postcodeFilter ] } );
				}

				return translate( 'Whole country' );
			case 'state':
				return translate( 'Whole state' );
		}
	};

	const renderLocation = ( location, index ) => {
		if ( ! loaded ) {
			return (
				<ListItem key={ index } className="shipping-zone__location is-placeholder" >
					<ListItemField className="shipping-zone__location-title">
						<div className="shipping-zone__placeholder-flag" />
						<span />
					</ListItemField>
					<ListItemField className="shipping-zone__location-summary">
						<span />
						<span />
					</ListItemField>
				</ListItem>
			);
		}

		return (
			<ListItem key={ index } className="shipping-zone__location" >
				<ListItemField className="shipping-zone__location-title">
					{ getLocationFlag( location ) }
					{ decodeEntities( location.name ) }
				</ListItemField>
				<ListItemField className="shipping-zone__location-summary">
					{ getLocationDescription( location ) }
				</ListItemField>
			</ListItem>
		);
	};

	const onAddLocation = () => {
		if ( ! loaded ) {
			return;
		}
		actions.openEditLocations();
	};

	let locationsToRender = loaded ? locations : [ {}, {}, {} ];
	if ( fetchError ) {
		locationsToRender = [];
	}

	return (
		<div className="shipping-zone__locations-container">
			<ExtendedHeader
				label={ translate( 'Zone locations' ) }
				description={ translate( 'Define the places that are included in this zone.' ) } >
				<Button onClick={ onAddLocation } disabled={ ! loaded } >
					{ isEmpty( locations ) ? translate( 'Add locations' ) : translate( 'Edit locations' ) }
				</Button>
			</ExtendedHeader>
			<List>
				{ locationsToRender.length
				? <ListHeader>
					<ListItemField className="shipping-zone__location-title">
						{ translate( 'Location' ) }
					</ListItemField>
					<ListItemField className="shipping-zone__location-summary">
						{ translate( 'Details' ) }
					</ListItemField>
				</ListHeader>
				: null }
				{ locationsToRender.map( renderLocation ) }
			</List>
			<ShippingZoneLocationDialog siteId={ siteId } isAdding={ isEmpty( locations ) } />
		</div>
	);
};

ShippingZoneLocationList.PropTypes = {
	siteId: PropTypes.number,
};

export default connect(
	( state ) => {
		const loaded = areShippingZonesFullyLoaded( state ) && areSettingsGeneralLoaded( state );
		return {
			loaded,
			fetchError: areSettingsGeneralLoadError( state ), // TODO: add shipping zones/methods fetch errors too
			locations: loaded && getCurrentlyEditingShippingZoneLocationsList( state, 20 ),
		};
	},
	( dispatch, ownProps ) => ( {
		actions: bindActionCreatorsWithSiteId( {
			openEditLocations,
		}, dispatch, ownProps.siteId ),
	} )
)( localize( ShippingZoneLocationList ) );
