/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import GoogleMyBusinessLogo from 'my-sites/google-my-business/logo';

function GoogleMyBusinessLocation( { children, isCompact, location, translate } ) {
	const classes = classNames( 'gmb-location', { 'is-compact': isCompact } );

	return (
		<Card className={ classes }>
			<div className="gmb-location__content">
				{ location.picture ? (
					<img
						alt={ translate( 'Business profile picture' ) }
						className="gmb-location__picture"
						src={ location.picture }
					/>
				) : (
					<div className="gmb-location__logo">
						<GoogleMyBusinessLogo height="30" width="30" />
					</div>
				) }

				<div className="gmb-location__description">
					<h2 className="gmb-location__name">{ location.name }</h2>

					<div className="gmb-location__address">
						{ location.description
							.split( ', ' )
							.map( ( line, index ) => <p key={ index }>{ line }</p> ) }
					</div>

					{ location.verified && (
						<div className="gmb-location__verified">
							<Gridicon
								className="gmb-location__verified-icon"
								icon="checkmark-circle"
								size={ 18 }
							/>{' '}
							{ translate( 'Verified' ) }
						</div>
					) }
				</div>
			</div>

			{ children }
		</Card>
	);
}

GoogleMyBusinessLocation.propTypes = {
	children: PropTypes.node,
	isCompact: PropTypes.bool,
	location: PropTypes.shape( {
		ID: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
		picture: PropTypes.string.isRequired,
		verified: PropTypes.bool.isRequired,
	} ).isRequired,
	translate: PropTypes.func.isRequired,
};

export default localize( GoogleMyBusinessLocation );
