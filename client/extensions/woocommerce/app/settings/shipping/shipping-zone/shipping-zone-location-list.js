/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ExtendedHeader from 'woocommerce/components/extended-header';
import List from 'woocommerce/components/list/list';
import ListItem from 'woocommerce/components/list/list-item';
import ListHeader from 'woocommerce/components/list/list-header';
import ListItemField from 'woocommerce/components/list/list-item-field';
import LocationFlag from 'woocommerce/components/location-flag';
import ShippingZoneLocationDialog from './shipping-zone-location-dialog';
import { decodeEntities } from 'lib/formatting';
import { bindActionCreatorsWithSiteId } from 'woocommerce/lib/redux-utils';
import { getCurrentlyEditingShippingZoneLocationsList } from 'woocommerce/state/ui/shipping/zones/locations/selectors';
import { openEditLocations } from 'woocommerce/state/ui/shipping/zones/locations/actions';

const ShippingZoneLocationList = ( { siteId, loaded, translate, locations, actions, onChange } ) => {
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
		onChange();
		actions.openEditLocations();
	};

	const locationsToRender = loaded ? locations : [ {}, {}, {} ];

	return (
		<div className="shipping-zone__locations-container">
			<ExtendedHeader
				label={ translate( 'Zone locations' ) }
				description={ translate( 'Define the places that are included in this zone.' ) } >
				<Button onClick={ onAddLocation } disabled={ ! loaded } >{ translate( 'Edit locations' ) }</Button>
			</ExtendedHeader>
			<List>
				<ListHeader>
					<ListItemField className="shipping-zone__location-title">
						{ translate( 'Location' ) }
					</ListItemField>
					<ListItemField className="shipping-zone__location-summary">
						{ translate( 'Details' ) }
					</ListItemField>
				</ListHeader>
				{ locationsToRender.map( renderLocation ) }
			</List>
			<ShippingZoneLocationDialog siteId={ siteId } onChange={ onChange } />
		</div>
	);
};

ShippingZoneLocationList.PropTypes = {
	siteId: PropTypes.number,
	loaded: PropTypes.bool.isRequired,
	onChange: PropTypes.func.isRequired,
};

export default connect(
	( state, ownProps ) => ( {
		locations: ownProps.loaded && getCurrentlyEditingShippingZoneLocationsList( state, 20 ),
	} ),
	( dispatch, ownProps ) => ( {
		actions: bindActionCreatorsWithSiteId( {
			openEditLocations,
		}, dispatch, ownProps.siteId ),
	} )
)( localize( ShippingZoneLocationList ) );
