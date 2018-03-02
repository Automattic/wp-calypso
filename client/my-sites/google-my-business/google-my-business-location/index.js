/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import Button from 'components/button';

const GoogleMyBusinessLocation = ( { translate, title, text, href, verified } ) => (
	<div>
		<div className="google-my-business-location__content">
			<img
				src="https://lh5.googleusercontent.com/p/AF1QipPBVVXFSwBfsObM5TbyoLSGySD_CJAXiztaxf0a=w408-h544-k-no"
				className="google-my-business-location__image"
			/>
			<div className="google-my-business-location__text">
				<h2 className="google-my-business-location__header">{ title }</h2>
				{ text }
				{ verified ? (
					<div className="google-my-business-location__verified">
						<Gridicon
							icon="checkmark-circle"
							className="google-my-business-location__verified-gridicon"
							size="18"
						/>{' '}
						Verified
					</div>
				) : null }
			</div>
		</div>
		<Button href={ href } className="google-my-business-location__button">
			{ translate( 'Connect location' ) }
		</Button>
	</div>
);

GoogleMyBusinessLocation.propTypes = {
	recordTracksEvent: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
	title: PropTypes.string,
	text: PropTypes.object,
	href: PropTypes.string,
	verified: PropTypes.bool,
};

export default connect( undefined, { recordTracksEvent } )( localize( GoogleMyBusinessLocation ) );
