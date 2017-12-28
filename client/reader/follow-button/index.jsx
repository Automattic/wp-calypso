/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import FollowButtonContainer from 'client/blocks/follow-button';
import FollowButton from 'client/blocks/follow-button/button';
import {
	recordFollow as recordFollowTracks,
	recordUnfollow as recordUnfollowTracks,
} from 'client/reader/stats';

function ReaderFollowButton( props ) {
	const { onFollowToggle, railcar, followSource, isButtonOnly, siteUrl } = props;

	function recordFollowToggle( isFollowing ) {
		if ( isFollowing ) {
			recordFollowTracks( siteUrl, railcar, { follow_source: followSource } );
		} else {
			recordUnfollowTracks( siteUrl, railcar, { follow_source: followSource } );
		}

		if ( onFollowToggle ) {
			onFollowToggle( isFollowing );
		}
	}

	if ( isButtonOnly ) {
		return <FollowButton { ...props } onFollowToggle={ recordFollowToggle } />;
	}

	return <FollowButtonContainer { ...props } onFollowToggle={ recordFollowToggle } />;
}

ReaderFollowButton.propTypes = {
	onFollowToggle: PropTypes.func,
	railcar: PropTypes.object,
	followSource: PropTypes.string,
};

export default ReaderFollowButton;
