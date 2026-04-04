import './styles.scss';
import { Spinner } from '@wordpress/components';
import { UserAvatarInfo } from '..';
import PrimaryBlogCard from './primary-blog-card';
import { useGravatarProfileV3Query } from './queries/use-gravatar-profile-v3-query';
import { useUserHovercardQuery } from './queries/use-user-hovercard-query';
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

	const { isLoading: isWpcomLoading, data: wpcomData } = useUserHovercardQuery(
		wpcomIdOrLogin || gravatarUser?.login
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

	const user = wpcomData?.user || gravatarUser || null;
	if ( ! user ) {
		return null;
	}

	return (
		<div className="user-hovercard">
			<UserHovercardHeader user={ user } />

			{ wpcomData?.primary_blog ? (
				<PrimaryBlogCard user={ user } primaryBlog={ wpcomData.primary_blog } />
			) : null }

			{ wpcomData?.recommended_blogs_count ? <RecommendedBlogs userLogin={ user.login } /> : null }
		</div>
	);
}
