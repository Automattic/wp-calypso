import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import FollowButtonContainer from 'calypso/blocks/follow-button';
import FollowButton from 'calypso/blocks/follow-button/button';
import ReaderFollowFeedIcon from 'calypso/reader/components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from 'calypso/reader/components/icons/following-feed-icon';
import {
	recordFollow as recordFollowTracks,
	recordUnfollow as recordUnfollowTracks,
} from 'calypso/reader/stats';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

function ReaderFollowButton( props ) {
	const { onFollowToggle, railcar, followSource, isButtonOnly, siteUrl, iconSize } = props;

	const isLoggedIn = useSelector( isUserLoggedIn );

	function recordFollowToggle( isFollowing ) {
		if ( isLoggedIn ) {
			if ( isFollowing ) {
				recordFollowTracks( siteUrl, railcar, { follow_source: followSource } );
			} else {
				recordUnfollowTracks( siteUrl, railcar, { follow_source: followSource } );
			}
		}

		if ( onFollowToggle ) {
			onFollowToggle( isFollowing );
		}
	}

	const followingIcon = ReaderFollowingFeedIcon( { iconSize: iconSize || 20 } );
	const followIcon = ReaderFollowFeedIcon( { iconSize: iconSize || 20 } );

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
	isButtonOnly: PropTypes.bool,
	siteUrl: PropTypes.string,
	iconSize: PropTypes.number,
};

export default ReaderFollowButton;
