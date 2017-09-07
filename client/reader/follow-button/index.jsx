/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import FollowButtonContainer from 'blocks/follow-button';
import FollowButton from 'blocks/follow-button/button';
import {
	recordFollow as recordFollowTracks,
	recordUnfollow as recordUnfollowTracks,
} from 'reader/stats';

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
	onFollowToggle: React.PropTypes.func,
	railcar: React.PropTypes.object,
	followSource: React.PropTypes.string,
};

export default ReaderFollowButton;
