/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'calypso/components/gridicon';
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

function GoogleMyBusinessLocationPlaceholder( { isCompact } ) {
	const classes = classNames( 'gmb-location', 'is-loading', { 'is-compact': isCompact } );

	return (
		<Card className={ classes }>
			<div className="gmb-location__content">
				<Gridicon icon="institution" height="60px" width="60px" />
				<div className="gmb-location__description">
					<div className="gmb-location__name" />
					<div className="gmb-location__address" />
				</div>
			</div>
		</Card>
	);
}

function GoogleMyBusinessLocation( { children, isCompact, location, translate } ) {
	if ( ! location ) {
		return <GoogleMyBusinessLocationPlaceholder isCompact={ isCompact } />;
	}

	const isLocationVerified = get( location, 'meta.state.isVerified', false );

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
					<Gridicon icon="institution" height="60px" width="60px" />
				) }

				<div className="gmb-location__description">
					<h2 className="gmb-location__name">{ location.name }</h2>

					<div className="gmb-location__address">
						{ location.description.split( '\n' ).map( ( line, index ) => (
							<p key={ index }>{ line }</p>
						) ) }
					</div>

					{ isLocationVerified && (
						<div className="gmb-location__verified">
							<Gridicon
								className="gmb-location__verified-icon"
								icon="checkmark-circle"
								size={ 18 }
							/>{ ' ' }
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
		picture: PropTypes.string,
		verified: PropTypes.bool,
	} ),
	translate: PropTypes.func.isRequired,
};

export default localize( GoogleMyBusinessLocation );
