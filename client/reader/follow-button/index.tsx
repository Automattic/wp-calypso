import { Railcar } from '@automattic/calypso-analytics';
import { useSelector } from 'react-redux';
import FollowButtonContainer, { FollowButtonContainerProps } from 'calypso/blocks/follow-button';
import {
	recordFollow as recordFollowEvent,
	recordUnfollow as recordUnfollowEvent,
} from 'calypso/reader/stats';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

interface ReaderFollowButtonProps extends FollowButtonContainerProps {
	followSource?: string;
	railcar?: Railcar;
	siteUrl: string;
}

/**
 * A specialization of the generic `components/follow-button` that sends stats.
 */
export default function ReaderFollowButton( props: ReaderFollowButtonProps ) {
	const { onFollowToggle, railcar, followSource, siteUrl } = props;
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

	return <FollowButtonContainer { ...props } onFollowToggle={ recordFollowToggle } />;
}
