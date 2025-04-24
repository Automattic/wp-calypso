import { useTranslate } from 'i18n-calypso';
import { omitBy } from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import { isUserLoggedIn, isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { follow, unfollow } from 'calypso/state/reader/follows/actions';
import { isFollowing } from 'calypso/state/reader/follows/selectors';
import { registerLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';
import { useResendEmailVerification } from '../../landing/stepper/hooks/use-resend-email-verification';
import FollowButton from './button';

function FollowButtonContainer( props ) {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );
	const following = useSelector( ( state ) => isFollowing( state, { feedUrl: props.siteUrl } ) );

	const dispatch = useDispatch();
	const resendEmailVerification = useResendEmailVerification( { from: 'wpcom-reader' } );
	const translate = useTranslate();

	const handleFollowToggle = ( followingSite ) => {
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

		if ( followingSite ) {
			dispatch( follow( props.siteUrl, followData ) );
		} else {
			dispatch( unfollow( props.siteUrl ) );
		}

		props.onFollowToggle( followingSite );
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

export default FollowButtonContainer;
