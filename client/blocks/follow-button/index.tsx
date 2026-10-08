import { omitBy } from '@automattic/js-utils';
import {
	getFollowingSource,
	useFollowSite,
	useIsSubscribed,
	useUnfollowSite,
} from 'calypso/reader/data/site-subscriptions';
import { useSelector, useDispatch } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { registerLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';
import FollowButton from './button';
import type { JSX } from 'react';

interface FollowButtonContainerProps {
	siteUrl: string;
	feedId?: number;
	siteId?: number;
	iconSize?: number;
	tagName?: string;
	disabled?: boolean;
	followLabel?: string;
	followingLabel?: string;
	className?: string;
	followIcon?: JSX.Element;
	followingIcon?: JSX.Element;
	hasButtonStyle?: boolean;
	isButtonOnly?: boolean;
	followApiSource?: string;
	onFollowToggle: ( following: boolean ) => void;
}

function FollowButtonContainer( {
	siteUrl,
	feedId,
	siteId,
	iconSize,
	tagName,
	disabled,
	followLabel,
	followingLabel,
	className,
	followIcon,
	followingIcon,
	hasButtonStyle,
	isButtonOnly,
	followApiSource,
	onFollowToggle,
}: FollowButtonContainerProps ): JSX.Element {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const following = useIsSubscribed( {
		feedUrl: siteUrl,
		feedId,
		blogId: siteId,
	} );
	const { mutate: followSite, isPending: isFollowingPending } = useFollowSite();
	const { mutate: unfollowSite, isPending: isUnfollowingPending } = useUnfollowSite();

	const dispatch = useDispatch();

	const followSource = followApiSource ?? getFollowingSource();

	const handleFollowToggle = ( followingSite: boolean ) => {
		const followData = omitBy(
			{
				feed_ID: feedId,
				blog_ID: siteId,
			},
			( data ) => typeof data === 'undefined'
		);

		if ( ! isLoggedIn ) {
			return dispatch(
				registerLastActionRequiresLogin( {
					type: 'follow-site',
					siteUrl,
					followData,
				} )
			);
		}

		if ( followingSite ) {
			followSite( { feedUrl: siteUrl, source: followSource } );
		} else {
			unfollowSite( { feedUrl: siteUrl, source: followSource } );
		}

		onFollowToggle( followingSite );
	};

	return (
		<FollowButton
			following={ following }
			onFollowToggle={ handleFollowToggle }
			iconSize={ iconSize }
			tagName={ tagName }
			disabled={ disabled || isFollowingPending || isUnfollowingPending }
			followLabel={ followLabel }
			followingLabel={ followingLabel }
			className={ className }
			followIcon={ followIcon }
			followingIcon={ followingIcon }
			hasButtonStyle={ hasButtonStyle }
			isButtonOnly={ isButtonOnly }
		/>
	);
}

export default FollowButtonContainer;
