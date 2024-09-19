import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import CheckMark from 'calypso/assets/images/icons/check-mark.svg';
import Plus from 'calypso/assets/images/icons/plus.svg';
import FollowButtonContainer from 'calypso/blocks/follow-button';
import FollowButton from 'calypso/blocks/follow-button/button';
import SVGIcon from 'calypso/components/svg-icon';
import ReaderFollowFeedIcon from 'calypso/reader/components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from 'calypso/reader/components/icons/following-feed-icon';
import {
	recordFollow as recordFollowTracks,
	recordUnfollow as recordUnfollowTracks,
} from 'calypso/reader/stats';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

function ReaderFollowButton( props ) {
	const { onFollowToggle, railcar, followSource, hasButtonStyle, isButtonOnly, siteUrl, iconSize } =
		props;

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

	const followingIcon = hasButtonStyle ? (
		<SVGIcon
			classes="reader-following-feed"
			name="check-mark"
			size="20"
			icon={ CheckMark }
			key="check-mark-icon"
		/>
	) : (
		ReaderFollowingFeedIcon( { iconSize: iconSize || 20 } )
	);

	const followIcon = hasButtonStyle ? (
		<SVGIcon classes="reader-follow-feed" name="plus" size="20" icon={ Plus } key="plus-icon" />
	) : (
		ReaderFollowFeedIcon( { iconSize: iconSize || 20 } )
	);

	if ( isButtonOnly ) {
		return (
			<FollowButton
				{ ...props }
				onFollowToggle={ recordFollowToggle }
				followIcon={ followIcon }
				followingIcon={ followingIcon }
				hasButtonStyle={ hasButtonStyle }
			/>
		);
	}

	return (
		<FollowButtonContainer
			{ ...props }
			onFollowToggle={ recordFollowToggle }
			followIcon={ followIcon }
			followingIcon={ followingIcon }
			hasButtonStyle={ hasButtonStyle }
		/>
	);
}

ReaderFollowButton.propTypes = {
	onFollowToggle: PropTypes.func,
	railcar: PropTypes.object,
	followSource: PropTypes.string,
	hasButtonStyle: PropTypes.bool,
};

export default ReaderFollowButton;
