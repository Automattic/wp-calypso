import { isEnabled } from '@automattic/calypso-config';
import { LoadingPlaceholder } from '@automattic/components';
import { siteLogo, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import EmptyContent from 'calypso/components/empty-content';
import RecommendedBlogItem from 'calypso/components/gravatar-with-hovercards/recommended-blogs/item';
import { UserData } from 'calypso/lib/user/user';
import { useSelector, useDispatch } from 'calypso/state';
import { requestUserRecommendedBlogs } from 'calypso/state/reader/lists/actions';
import {
	isRequestingUserRecommendedBlogs,
	hasRequestedUserRecommendedBlogs,
	getUserRecommendedBlogs,
} from 'calypso/state/reader/lists/selectors';

interface UserRecommendedBlogsProps {
	user: UserData;
}

const UserRecommendedBlogs = ( { user }: UserRecommendedBlogsProps ): JSX.Element | null => {
	const { user_login: userLogin } = user;
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isRequesting = useSelector( ( state ) =>
		isRequestingUserRecommendedBlogs( state, userLogin || '' )
	);
	const hasRequested = useSelector( ( state ) =>
		hasRequestedUserRecommendedBlogs( state, userLogin || '' )
	);
	const isExpectingRequest = isRequesting || ! hasRequested;
	const recommendedBlogs = useSelector( ( state ) =>
		getUserRecommendedBlogs( state, userLogin || '' )
	);

	useEffect( () => {
		if ( ! recommendedBlogs && userLogin && ! hasRequested ) {
			dispatch( requestUserRecommendedBlogs( userLogin ) );
		}
	}, [ userLogin, recommendedBlogs, dispatch, hasRequested ] );

	if ( ! isEnabled( 'reader/recommended-blogs-list' ) ) {
		return null;
	}

	if ( ! recommendedBlogs?.length && isExpectingRequest ) {
		return <LoadingPlaceholder />;
	}

	if ( ! recommendedBlogs?.length ) {
		return (
			<EmptyContent
				illustration={ null }
				icon={ <Icon icon={ siteLogo } size={ 48 } /> }
				title={ null }
				line={ translate( 'No blogs have been recommended yet.' ) }
			/>
		);
	}

	return (
		<ul className="user-profile__recommended-blogs-list">
			{ recommendedBlogs.map( ( blog ) => (
				<RecommendedBlogItem key={ blog.ID } blog={ blog } classPrefix="user-profile" />
			) ) }
		</ul>
	);
};

export default UserRecommendedBlogs;
