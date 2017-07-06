/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ExtendedHeader from 'woocommerce/components/extended-header';
import FormTextInput from 'components/forms/form-text-input';
import { decodeEntities } from 'lib/formatting';
import { changeShippingZoneName } from 'woocommerce/state/ui/shipping/zones/actions';
import { bindActionCreatorsWithSiteId } from 'woocommerce/lib/redux-utils';

export const getZoneName = ( zone, locations, translate, returnEmpty = false ) => {
	if ( zone && zone.name ) {
		return zone.name;
	}

	if ( returnEmpty ) {
		return '';
	}

	if ( ! locations || ! locations.length ) {
		return translate( 'New shipping zone' );
	}

	const locationNames = locations.map( ( { name, postcodeFilter } ) => (
		postcodeFilter ? `${ name } (${ postcodeFilter })` : decodeEntities( name )
	) );

	if ( locationNames.length > 10 ) {
		const remaining = locationNames.length - 10;
		const listed = locationNames.slice( 0, 10 );
		return ( translate(
			'%(locationList)s and %(count)s other region',
			'%(locationList)s and %(count)s other regions',
			{
				count: remaining,
				args: {
					locationList: listed.join( ', ' ),
					count: remaining,
				}
			}
		) );
	}

	return locationNames.join( ', ' );
};

const ShippingZoneName = ( { loaded, zone, locations, actions, translate } ) => {
	const onNameChange = ( event ) => {
		actions.changeShippingZoneName( event.target.value );
	};

	const renderContent = () => {
		if ( ! loaded ) {
			return (
				<div className="shipping-zone__name is-placeholder">
					<span />
				</div>
			);
		}

		const zoneName = getZoneName( zone, locations, translate, true );

		return (
			<div className="shipping-zone__name">
				<FormTextInput
					value={ zoneName }
					onChange={ onNameChange }
					placeholder={ getZoneName( zone, locations, translate ) } />
			</div>
		);
	};

	return (
		<div>
			<ExtendedHeader
				label={ translate( 'Zone name' ) }
				description={ translate( 'Give the zone a name of your choosing, or just use the one we created for you.' +
					' This is not visible to customers.' ) } />
			<Card className="shipping-zone__name-container">
				{ renderContent() }
			</Card>
		</div>
	);
};

ShippingZoneName.PropTypes = {
	siteId: PropTypes.number,
	loaded: PropTypes.bool.isRequired,
	zone: PropTypes.object,
	locations: PropTypes.array,
};

export default connect(
	null,
	( dispatch, ownProps ) => ( {
		actions: bindActionCreatorsWithSiteId( {
			changeShippingZoneName,
		}, dispatch, ownProps.siteId ),
	} )
)( localize( ShippingZoneName ) );
