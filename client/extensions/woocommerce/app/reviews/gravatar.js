/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Gravatar from 'calypso/components/gravatar';

// The WP comments endpoint and reviews endpoints return different but similar responses.
// This helper component displays a gravatar for either a review or admin reply to a review.
// Just pass in the review or reply object, and what type it is.
const ReviewGravatar = ( { object, forType = 'review' } ) => {
	let avatarURL;
	let displayName;

	// The API returns avatar URLs for various sizes. 24, 48, and 96.
	const AVATAR_SIZE = 48;

	if ( 'reply' === forType ) {
		avatarURL = object.author_avatar_urls[ AVATAR_SIZE ];
		displayName = object.author_name;
	} else {
		avatarURL = object.avatar_urls[ AVATAR_SIZE ];
		displayName = object.name;
	}

	const author = {
		avatar_URL: avatarURL,
		display_name: displayName,
	};

	return <Gravatar user={ author } />;
};

ReviewGravatar.propTypes = {
	object: PropTypes.object.isRequired,
	forType: PropTypes.string.isRequired,
};

export default ReviewGravatar;
