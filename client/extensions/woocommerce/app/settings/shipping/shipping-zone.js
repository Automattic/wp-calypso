/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const ShippingZone = ( { translate, locationName, locationDescription, methods, icon } ) => {
	const renderMethod = ( { name, description }, index ) => {
		return (
			<div key={ index } className="shipping__zones-row-method">
				<p className="shipping__zones-row-method-name">{ name }</p>
				<p className="shipping__zones-row-method-description">{ description }</p>
			</div>
		);
	};

	return (
		<div className="shipping__zones-row">
			<div className="shipping__zones-row-icon">
				<Gridicon icon={ icon } size={ 36 } />
			</div>
			<div className="shipping__zones-row-location">
				<p className="shipping__zones-row-location-name">{ locationName }</p>
				<p className="shipping__zones-row-location-description">{ locationDescription }</p>
			</div>
			<div className="shipping__zones-row-methods">
				{ methods.map( renderMethod ) }
			</div>
			<div className="shipping__zones-row-actions">
				<Button compact>{ translate( 'Edit' ) }</Button>
			</div>
		</div>
	);
};

ShippingZone.propTypes = {
	locationName: PropTypes.string,
	locationDescription: PropTypes.string,
	methods: PropTypes.arrayOf( PropTypes.shape( {
		name: PropTypes.string,
		description: PropTypes.string,
	} ) ),
	icon: PropTypes.string
};

export default localize( ShippingZone );
