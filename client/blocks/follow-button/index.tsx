import { useTranslate } from 'i18n-calypso';
import { omitBy } from 'lodash';
import { ReactElement } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Action, Dispatch } from 'redux';
import { isUserLoggedIn, isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { NoticeAction } from 'calypso/state/notices/types';
import { Follow, follow, unfollow } from 'calypso/state/reader/follows/actions';
import { isFollowing } from 'calypso/state/reader/follows/selectors';
import { registerLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';
import { useResendEmailVerification } from '../../landing/stepper/hooks/use-resend-email-verification';
import FollowButton, { FollowButtonProps } from './button';

export interface FollowButtonContainerProps extends FollowButtonProps {
	feedId?: number;
	siteId?: string;
	siteUrl: string;
}

export default function FollowButtonContainer(
	props: FollowButtonContainerProps
): ReactElement< typeof FollowButton > {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );
	const following = useSelector( ( state ) => isFollowing( state, { feedUrl: props.siteUrl } ) );

	const dispatch = useDispatch< Dispatch< NoticeAction | Action > >();
	const resendEmailVerification = useResendEmailVerification();
	const translate = useTranslate();

	const handleFollowToggle = ( followingSite: boolean ): void => {
		if ( ! isLoggedIn ) {
			dispatch(
				registerLastActionRequiresLogin( {
					type: 'follow-site',
					siteId: props.siteId,
				} ) as Action
			);

			return;
		}

		if ( ! isEmailVerified ) {
			dispatch(
				errorNotice( translate( 'Your email has not been verified yet.' ), {
					id: 'resend-verification-email',
					button: translate( 'Resend Email' ),
					onClick: () => {
						resendEmailVerification();
					},
				} )
			);

			return;
		}

		if ( followingSite ) {
			const followData = omitBy(
				{
					feed_ID: props.feedId,
					blog_ID: props.siteId,
				},
				( data ) => typeof data === 'undefined'
			) as unknown as Follow;

			dispatch( follow( props.siteUrl, followData ) as Action );
		} else {
			dispatch( unfollow( props.siteUrl ) );
		}

		if ( props.onFollowToggle ) {
			props.onFollowToggle( followingSite );
		}
	};

	return (
		<FollowButton
			following={ following }
			onFollowToggle={ handleFollowToggle }
			iconSize={ props.iconSize }
			tagName={ props.tagName }
			disabled={ props.disabled }
			followLabel={ props.followLabel }
			followingLabel={ props.followingLabel }
			className={ props.className }
			followIcon={ props.followIcon }
			followingIcon={ props.followingIcon }
			hasButtonStyle={ props.hasButtonStyle }
		/>
	);
}
