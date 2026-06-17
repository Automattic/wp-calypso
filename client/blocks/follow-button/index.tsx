import { omitBy } from '@automattic/js-utils';
import { useTranslate } from 'i18n-calypso';
import {
	getFollowingSource,
	useFollowSite,
	useIsSubscribed,
	useUnfollowSite,
} from 'calypso/reader/data/site-subscriptions';
import { useSelector, useDispatch } from 'calypso/state';
import { isUserLoggedIn, isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { registerLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';
import { useResendEmailVerification } from '../../landing/stepper/hooks/use-resend-email-verification';
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
	onFollowToggle,
}: FollowButtonContainerProps ): JSX.Element {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );
	const following = useIsSubscribed( {
		feedUrl: siteUrl,
		feedId,
		blogId: siteId,
	} );
	const { mutate: followSite, isPending: isFollowingPending } = useFollowSite();
	const { mutate: unfollowSite, isPending: isUnfollowingPending } = useUnfollowSite();

	const dispatch = useDispatch();
	const resendEmailVerification = useResendEmailVerification( { from: 'wpcom-reader' } );
	const translate = useTranslate();

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

		if ( ! isEmailVerified ) {
			return dispatch(
				errorNotice( translate( 'Your email has not been verified yet.' ), {
					id: 'resend-verification-email',
					button: translate( 'Resend Email' ),
					onClick: () => {
						resendEmailVerification();
					},
				} )
			);
		}

		if ( followingSite ) {
			followSite( { feedUrl: siteUrl, source: getFollowingSource() } );
		} else {
			unfollowSite( { feedUrl: siteUrl, source: getFollowingSource() } );
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
