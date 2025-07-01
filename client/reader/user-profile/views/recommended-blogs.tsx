import { isEnabled } from '@automattic/calypso-config';
import { useEffect } from 'react';
import RecommendedBlogItem from 'calypso/components/gravatar-with-hovercards/recommended-blogs/item';
import { UserData } from 'calypso/lib/user/user';
import { useSelector, useDispatch } from 'calypso/state';
import { requestUserRecommendedBlogs } from 'calypso/state/reader/lists/actions';
import { getUserRecommendedBlogs } from 'calypso/state/reader/lists/selectors';

interface UserPostsProps {
	user: UserData;
}

const UserRecommendedBlogs = ( { user }: UserPostsProps ): JSX.Element | null => {
	const { user_login: userLogin } = user;
	const dispatch = useDispatch();

	const recommendedBlogs = useSelector( ( state ) =>
		getUserRecommendedBlogs( state, userLogin || '' )
	);

	useEffect( () => {
		if ( ! recommendedBlogs && userLogin ) {
			dispatch( requestUserRecommendedBlogs( userLogin ) );
		}
	}, [ userLogin, recommendedBlogs, dispatch ] );

	if (
		! isEnabled( 'reader/recommended-blogs-list' ) ||
		! recommendedBlogs ||
		! recommendedBlogs.length
	) {
		return null;
	}

	return (
		<>
			{ recommendedBlogs.map( ( blog ) => (
				<RecommendedBlogItem key={ blog.ID } blog={ blog } classPrefix="user-profile" />
			) ) }
		</>
	);
};

export default UserRecommendedBlogs;
