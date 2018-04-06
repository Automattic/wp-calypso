/** @format */

/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import GoogleMyBusinessLogo from 'my-sites/google-my-business/logo';
import LocationType from './location-type';

function GoogleMyBusinessLocation( { location, translate } ) {
	return (
		<div className="gmb-location__content">
			{ location.photo ? (
				<img
					alt={ translate( 'Business profile photo' ) }
					className="gmb-location__photo"
					src={ location.photo }
				/>
			) : (
				<div className="gmb-location__logo">
					<GoogleMyBusinessLogo height="30" width="30" />
				</div>
			) }

			<div className="gmb-location__description">
				<h2 className="gmb-location__name">{ location.name }</h2>

				<div className="gmb-location__address">
					{ location.address.map( ( line, index ) => <p key={ index }>{ line }</p> ) }
				</div>

				{ location.verified && (
					<div className="gmb-location__verified">
						<Gridicon className="gmb-location__verified-icon" icon="checkmark-circle" size={ 18 } />{' '}
						{ translate( 'Verified' ) }
					</div>
				) }
			</div>
		</div>
	);
}

GoogleMyBusinessLocation.propTypes = {
	location: LocationType.isRequired,
	translate: PropTypes.func.isRequired,
};

export default localize( GoogleMyBusinessLocation );
