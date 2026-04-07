import './styles.scss';
import { Spinner } from '@wordpress/components';
import { useGetReaderUserQuery } from 'calypso/reader/user-profile/queries/useGetReaderUserQuery';
import { UserAvatarInfo } from '..';
import PrimaryBlogCard from './primary-blog-card';
import { useGravatarProfileV3Query } from './queries/use-gravatar-profile-v3-query';
import RecommendedBlogs from './recommended-blogs';
import UserHovercardHeader from './user-hovercard-header';

interface UserHovercardProps {
	user: UserAvatarInfo;
	size?: number;
}

export default function UserHovercard( props: UserHovercardProps ): JSX.Element | null {
	const { user: userProp } = props;
	const wpcomIdOrLogin = userProp.wpcom_id || userProp.wpcom_login;

	const { isLoading: isGravatarLoading, data: gravatarUser } = useGravatarProfileV3Query(
		[ userProp.profile_URL, userProp.avatar_URL ],
		! wpcomIdOrLogin
	);

	const { isLoading: isWpcomLoading, data: wpcomData } = useGetReaderUserQuery(
		wpcomIdOrLogin || gravatarUser?.user_login
	);

	if ( isWpcomLoading || isGravatarLoading ) {
		return (
			<div className="user-hovercard">
				<div className="wp-spinner-wrapper" style={ { marginTop: '0' } }>
					<Spinner />
				</div>
			</div>
		);
	}

	const user = wpcomData?.user_login ? wpcomData : gravatarUser;
	if ( ! user ) {
		return null;
	}

	return (
		<div className="user-hovercard">
			<UserHovercardHeader user={ user } />

			{ wpcomData?.primary_blog ? <PrimaryBlogCard user={ user } /> : null }

			{ wpcomData?.recommended_blogs_count ? (
				<RecommendedBlogs userLogin={ user.user_login } />
			) : null }
		</div>
	);
}
