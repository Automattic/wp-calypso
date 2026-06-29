import { Railcar } from '@automattic/calypso-analytics';
import { cloneElement, type JSX } from 'react';
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
	className?: string;
	feedId?: number;
	followApiSource?: string;
	followSource?: string;
	followIcon?: JSX.Element;
	followingIcon?: JSX.Element;
	hasButtonStyle?: boolean;
	iconSize?: number;
	isButtonOnly?: boolean;
	onFollowToggle?: ( isFollowing: boolean ) => void;
	railcar?: Railcar;
	siteId?: number;
	siteUrl: string;
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

	// FollowButton renders icons as an array child; React requires keys on array
	// items so we attach them here.
	const followingIcon = cloneElement(
		props.followingIcon ?? ReaderFollowingFeedIcon( { iconSize: iconSize || 20 } ),
		{ key: 'reader-following-icon' }
	);
	const followIcon = cloneElement(
		props.followIcon ?? ReaderFollowFeedIcon( { iconSize: iconSize || 20 } ),
		{ key: 'reader-follow-icon' }
	);

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
