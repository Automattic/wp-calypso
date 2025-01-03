import { Railcar } from '@automattic/calypso-analytics';
import { useSelector } from 'react-redux';
import FollowButtonContainer from 'calypso/blocks/follow-button';
import { FollowButtonProps } from 'calypso/blocks/follow-button/button';
import ReaderFollowFeedIcon from 'calypso/reader/components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from 'calypso/reader/components/icons/following-feed-icon';
import {
	recordFollow as recordFollowTracks,
	recordUnfollow as recordUnfollowTracks,
} from 'calypso/reader/stats';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

interface ReaderFollowButtonProps extends FollowButtonProps {
	followSource?: string;
	railcar?: Railcar;
	siteUrl: string;
}

export default function ReaderFollowButton( props: ReaderFollowButtonProps ) {
	const { onFollowToggle, railcar, followSource, hasButtonStyle, siteUrl, iconSize } = props;

	const isLoggedIn = useSelector( isUserLoggedIn );

	function recordFollowToggle( isFollowing: boolean ): void {
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
