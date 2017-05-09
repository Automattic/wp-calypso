/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import FollowButtonContainer from 'blocks/follow-button';
import FollowButton from 'blocks/follow-button/button';
import {
	recordFollow as recordFollowTracks,
	recordUnfollow as recordUnfollowTracks,
} from 'reader/stats';
import {
	recordFollow as recordFollowAction,
	recordUnfollow as recordUnfollowAction,
} from 'state/reader/follows/actions';

function ReaderFollowButton( props ) {
	const {
		onFollowToggle,
		railcar,
		followSource,
		isButtonOnly,
		dispatchRecordFollow,
		dispatchRecordUnfollow,
		siteUrl,
	} = props;

	function recordFollowToggle( isFollowing ) {
		if ( isFollowing ) {
			dispatchRecordFollow( siteUrl );
			recordFollowTracks( siteUrl, railcar, { follow_source: followSource } );
		} else {
			dispatchRecordUnfollow( siteUrl );
			recordUnfollowTracks( siteUrl, railcar, { follow_source: followSource } );
		}

		if ( onFollowToggle ) {
			onFollowToggle( isFollowing );
		}
	}

	if ( isButtonOnly ) {
		return (
			<FollowButton { ...props } onFollowToggle={ recordFollowToggle } />
		);
	}

	return (
		<FollowButtonContainer { ...props } onFollowToggle={ recordFollowToggle } />
	);
}

ReaderFollowButton.propTypes = {
	onFollowToggle: React.PropTypes.func,
	railcar: React.PropTypes.object,
	followSource: React.PropTypes.string,
};

export default connect(
	( state ) => ( {} ), // eslint-disable-line no-unused-vars
	( dispatch ) => bindActionCreators( {
		dispatchRecordFollow: recordFollowAction,
		dispatchRecordUnfollow: recordUnfollowAction,
	}, dispatch ),
	null,
	{ pure: true } // TODO: is this component pure?
)( ReaderFollowButton );
