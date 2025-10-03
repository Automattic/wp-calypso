import { Railcar } from '@automattic/calypso-analytics';
import { useSelector } from 'react-redux';
import FollowButtonContainer from 'calypso/blocks/follow-button';
import ReaderFollowFeedIcon from 'calypso/reader/components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from 'calypso/reader/components/icons/following-feed-icon';
import {
	recordFollow as recordFollowTracks,
	recordUnfollow as recordUnfollowTracks,
} from 'calypso/reader/stats';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getPreviousPath from 'calypso/state/selectors/get-previous-path';

interface ReaderFollowButtonProps {
	hasButtonStyle?: boolean;
	iconSize?: number;
	isButtonOnly?: boolean;
	onFollowToggle?: ( isFollowing: boolean ) => void;
	railcar?: Railcar;
	followSource?: string;
	siteUrl: string;
	className?: string;
}

export default function ReaderFollowButton( props: ReaderFollowButtonProps ): JSX.Element {
	const { onFollowToggle, railcar, followSource, hasButtonStyle, siteUrl, iconSize, className } =
		props;

	const isLoggedIn = useSelector( isUserLoggedIn );
	// We use the previous path to detect how the user arrived on the follow button.
	// It is important to understand our post suggestions strategies.
	const pathnameOverride = useSelector( getPreviousPath );

	function recordFollowToggle( isFollowing: boolean ): void {
		if ( isLoggedIn ) {
			if ( isFollowing ) {
				recordFollowTracks( siteUrl, railcar, { follow_source: followSource }, pathnameOverride );
			} else {
				recordUnfollowTracks( siteUrl, railcar, { follow_source: followSource }, pathnameOverride );
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
			className={ className }
			onFollowToggle={ recordFollowToggle }
			followIcon={ followIcon }
			followingIcon={ followingIcon }
			hasButtonStyle={ hasButtonStyle }
		/>
	);
}
