import { omitBy } from 'lodash';
import { useSelector, useDispatch } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { follow, unfollow } from 'calypso/state/reader/follows/actions';
import { isFollowing } from 'calypso/state/reader/follows/selectors';
import { registerLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';
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
	const following = useSelector( ( state ) =>
		isFollowing( state, { feedUrl: props.siteUrl, feedId: props.feedId, blogId: props.siteId } )
	);

	const dispatch = useDispatch();

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

		if ( followingSite ) {
			dispatch( follow( props.siteUrl, followData, null ) );
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
			isButtonOnly={ props.isButtonOnly }
		/>
	);
}

export default FollowButtonContainer;
