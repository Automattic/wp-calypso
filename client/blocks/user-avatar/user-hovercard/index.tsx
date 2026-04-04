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
	const wpcomIdOrLogin = user.wpcom_id || user.wpcom_login;
	const { isLoading, data, error } = useUserHovercardQuery(
		wpcomIdOrLogin || user.login,
		wpcomIdOrLogin ? undefined : getGravatarEmailHash() // Send email hash only if wpcomIdOrLogin is not available, as it's an alternative way to fetch data from WPCOM.
	);

	function getGravatarEmailHash(): string | undefined {
		if ( wpcomIdOrLogin ) {
			return;
		}

		const profileURL = user.profile_URL;
		if ( ! profileURL ) {
			return;
		}

		const emailHashMatch = profileURL.match( /gravatar\.com\/([a-f0-9]{32})/ );
		return emailHashMatch?.[ 1 ];
	}

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
