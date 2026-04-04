import './styles.scss';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'calypso/state';
import { requestUser } from 'calypso/state/reader/users/actions';
import getReaderUser from 'calypso/state/selectors/get-reader-user';
import { AppState } from 'calypso/types';
import { UserAvatarInfo } from '..';
import PrimaryBlogCard from './primary-blog-card';
import RecommendedBlogs from './recommended-blogs';
import UserHovercardHeader from './user-hovercard-header';

interface UserHovercardProps {
	user: UserAvatarInfo;
	size?: number;
}

export default function UserHovercard( props: UserHovercardProps ): JSX.Element {
	const dispatch = useDispatch();
	const { user } = props;
	// For some reason there are places where the user object passes in primary blog of -1. Lets
	// find the read one with this selector.
	const readerUserData = useSelector( ( state: AppState ) =>
		getReaderUser( state, user.wpcom_id ?? 0, true )
	);
	const primaryBlogId = readerUserData?.primary_blog || user?.site_ID || 0;
	const userLogin = user.wpcom_login || readerUserData?.user_login;

	useEffect( () => {
		if ( ! readerUserData && ! ( primaryBlogId > 0 ) && user?.wpcom_id ) {
			dispatch( requestUser( user.wpcom_id, true ) );
		}
	}, [ user?.wpcom_id, dispatch, readerUserData, primaryBlogId ] );

	function onCloseCard() {}

	return (
		<div className="user-hovercard">
			<UserHovercardHeader user={ user } />
			{ primaryBlogId > 0 && <PrimaryBlogCard user={ user } primaryBlogId={ primaryBlogId } /> }
			{ userLogin && <RecommendedBlogs userLogin={ userLogin } onCloseCard={ onCloseCard } /> }
		</div>
	);
}
