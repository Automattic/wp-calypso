import { Railcar } from '@automattic/calypso-analytics';
import { useSelector } from 'react-redux';
import FollowButtonContainer, { FollowButtonContainerProps } from 'calypso/blocks/follow-button';
import ReaderFollowFeedIcon from 'calypso/reader/components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from 'calypso/reader/components/icons/following-feed-icon';
import {
	recordFollow as recordFollowEvent,
	recordUnfollow as recordUnfollowEvent,
} from 'calypso/reader/stats';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

interface ReaderFollowButtonProps
	extends Omit< FollowButtonContainerProps, 'followIcon' | 'followingIcon' > {
	followSource?: string;
	railcar?: Railcar;
	siteUrl: string;
}

export default function ReaderFollowButton( props: ReaderFollowButtonProps ) {
	const { onFollowToggle, railcar, followSource, siteUrl } = props;
	const iconSize = props.iconSize || 20;
	const isLoggedIn = useSelector( isUserLoggedIn );

	function recordFollowToggle( isFollowing: boolean ): void {
		if ( isLoggedIn ) {
			if ( isFollowing ) {
				recordFollowEvent( siteUrl, railcar, { follow_source: followSource } );
			} else {
				recordUnfollowEvent( siteUrl, railcar, { follow_source: followSource } );
			}
		}

		if ( onFollowToggle ) {
			onFollowToggle( isFollowing );
		}
	}

	return (
		<FollowButtonContainer
			{ ...props }
			onFollowToggle={ recordFollowToggle }
			followIcon={ ReaderFollowFeedIcon( { iconSize } ) }
			followingIcon={ ReaderFollowingFeedIcon( { iconSize } ) }
		/>
	);
}
