import { useTranslate } from 'i18n-calypso';
import { omitBy } from 'lodash';
import {
	getFollowingSource,
	useFollowSite,
	useIsFollowing,
	useUnfollowSite,
} from 'calypso/reader/data/follows';
import { useSelector, useDispatch } from 'calypso/state';
import { isUserLoggedIn, isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { registerLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';
import { useResendEmailVerification } from '../../landing/stepper/hooks/use-resend-email-verification';
import FollowButton from './button';

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

function FollowButtonContainer( props: FollowButtonContainerProps ): JSX.Element {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );
	const following = useIsFollowing( {
		feedUrl: props.siteUrl,
		feedId: props.feedId,
		blogId: props.siteId,
	} );
	const followSite = useFollowSite();
	const unfollowSite = useUnfollowSite();

	const dispatch = useDispatch();
	const resendEmailVerification = useResendEmailVerification( { from: 'wpcom-reader' } );
	const translate = useTranslate();

	const handleFollowToggle = ( followingSite: boolean ) => {
		const followData = omitBy(
			{
				feed_ID: props.feedId,
				blog_ID: props.siteId,
			},
			( data ) => typeof data === 'undefined'
		);

		if ( ! isLoggedIn ) {
			return dispatch(
				registerLastActionRequiresLogin( {
					type: 'follow-site',
					siteUrl: props.siteUrl,
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

		if ( following ) {
			unfollowSite.mutate( { feedUrl: props.siteUrl, source: getFollowingSource() } );
		} else {
			followSite.mutate( { feedUrl: props.siteUrl, source: getFollowingSource() } );
		}

		props.onFollowToggle( followingSite );
	};

	return (
		<FollowButton
			following={ following }
			onFollowToggle={ handleFollowToggle }
			iconSize={ props.iconSize }
			tagName={ props.tagName }
			disabled={ props.disabled || followSite.isPending || unfollowSite.isPending }
			followLabel={ props.followLabel }
			followingLabel={ props.followingLabel }
			className={ props.className }
			followIcon={ props.followIcon }
			followingIcon={ props.followingIcon }
			hasButtonStyle={ props.hasButtonStyle }
			isButtonOnly={ props.isButtonOnly }
		/>
	);
}

export default FollowButtonContainer;
