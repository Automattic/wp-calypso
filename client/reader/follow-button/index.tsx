import { Railcar } from '@automattic/calypso-analytics';
import { useTranslate } from 'i18n-calypso';
import { omitBy } from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import { Action, Dispatch } from 'redux';
import FollowButton, { FollowButtonProps } from 'calypso/blocks/follow-button/button';
import { useResendEmailVerification } from 'calypso/landing/stepper/hooks/use-resend-email-verification';
import {
	recordFollow as recordFollowEvent,
	recordUnfollow as recordUnfollowEvent,
} from 'calypso/reader/stats';
import { isUserLoggedIn, isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { NoticeAction } from 'calypso/state/notices/types';
import { Follow, follow, unfollow } from 'calypso/state/reader/follows/actions';
import { isFollowing } from 'calypso/state/reader/follows/selectors';
import { registerLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';
import { AppState } from 'calypso/types';

interface ReaderFollowButtonProps extends FollowButtonProps {
	feedId?: number;
	followSource?: string;
	railcar?: Railcar;
	siteId?: string;
	siteUrl: string;
}

/**
 * A specialization of the generic `FollowButton` that sends stats.
 */
export default function ReaderFollowButton( props: ReaderFollowButtonProps ) {
	const { onFollowToggle, railcar, followSource, siteUrl } = props;

	const isLoggedIn = useSelector( isUserLoggedIn );
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );
	const following = useSelector( ( state: AppState ) =>
		isFollowing( state, { feedUrl: props.siteUrl } )
	);

	const dispatch = useDispatch< Dispatch< NoticeAction | Action > >();
	const resendEmailVerification = useResendEmailVerification();
	const translate = useTranslate();

	function handleFollowToggle( isFollowing: boolean ): void {
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

		if ( isFollowing ) {
			const followData = omitBy(
				{
					feed_ID: props.feedId,
					blog_ID: props.siteId,
				},
				( data ) => typeof data === 'undefined'
			) as unknown as Follow;

			dispatch( follow( props.siteUrl, followData ) as Action );
			recordFollowEvent( siteUrl, railcar, { follow_source: followSource } );
		} else {
			dispatch( unfollow( props.siteUrl ) );
			recordUnfollowEvent( siteUrl, railcar, { follow_source: followSource } );
		}

		if ( onFollowToggle ) {
			onFollowToggle( isFollowing );
		}
	}

	return (
		<FollowButton { ...props } following={ following } onFollowToggle={ handleFollowToggle } />
	);
}
