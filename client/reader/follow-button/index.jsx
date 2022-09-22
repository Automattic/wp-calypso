import PropTypes from 'prop-types';
import FollowButtonContainer from 'calypso/blocks/follow-button';
import FollowButton from 'calypso/blocks/follow-button/button';
import ReaderFollowIcon from 'calypso/reader/components/icons/follow-icon';
import ReaderFollowingIcon from 'calypso/reader/components/icons/following-icon';
import {
	recordFollow as recordFollowTracks,
	recordUnfollow as recordUnfollowTracks,
} from 'calypso/reader/stats';

function ReaderFollowButton( props ) {
	const { onFollowToggle, railcar, followSource, isButtonOnly, siteUrl, iconSize } = props;

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

	const followingIcon = ReaderFollowingIcon( { iconSize: iconSize || 24 } );
	const followIcon = ReaderFollowIcon( { iconSize: iconSize || 24 } );

	if ( isButtonOnly ) {
		return (
			<FollowButton
				{ ...props }
				onFollowToggle={ recordFollowToggle }
				followIcon={ followIcon }
				followingIcon={ followingIcon }
			/>
		);
	}

	return (
		<FollowButtonContainer
			{ ...props }
			onFollowToggle={ recordFollowToggle }
			followIcon={ followIcon }
			followingIcon={ followingIcon }
		/>
	);
}

ReaderFollowButton.propTypes = {
	onFollowToggle: PropTypes.func,
	railcar: PropTypes.object,
	followSource: PropTypes.string,
};

export default ReaderFollowButton;
