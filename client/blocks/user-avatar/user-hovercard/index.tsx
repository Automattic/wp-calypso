import './styles.scss';
import { Spinner } from '@wordpress/components';
import { UserAvatarInfo } from '..';
import PrimaryBlogCard from './primary-blog-card';
import { useUserHovercardQuery } from './queries/use-user-hovercard-query';
import RecommendedBlogs from './recommended-blogs';
import UserHovercardHeader from './user-hovercard-header';

interface UserHovercardProps {
	user: UserAvatarInfo;
	size?: number;
}

export default function UserHovercard( props: UserHovercardProps ): JSX.Element | null {
	const { user } = props;
	const { isLoading, data, error } = useUserHovercardQuery( user.wpcom_id || user.wpcom_login );

	if ( isLoading ) {
		return (
			<div className="user-hovercard">
				<div className="wp-spinner-wrapper" style={ { marginTop: '0' } }>
					<Spinner />
				</div>
			</div>
		);
	}

	if ( error || ! data?.user ) {
		return null;
	}

	const userLogin = data.user.login;

	return (
		<div className="user-hovercard">
			<UserHovercardHeader user={ data.user } />
			<PrimaryBlogCard user={ data.user } primaryBlog={ data.primary_blog } />
			{ data.recommended_blogs_count ? <RecommendedBlogs userLogin={ userLogin } /> : null }
		</div>
	);
}
