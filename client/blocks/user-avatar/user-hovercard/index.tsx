import './styles.scss';
import { Spinner } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import UserAvatarDefaultIcon from 'calypso/reader/components/icons/user-avatar-default-icon';
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
	const translate = useTranslate();
	const { user: userProp } = props;
	const wpcomIdOrLogin = userProp.wpcom_id || userProp.wpcom_login;

	const { isLoading: isGravatarLoading, data: gravatarData } = useGravatarProfileV3Query(
		userProp,
		! wpcomIdOrLogin // Only fetch Gravatar profile if we don't have a WPCOM ID or login.
	);
	const gravatarUser = { ...gravatarData, primary_blog: null };

	const { isLoading: isWpcomLoading, data: wpcomData } = useGetReaderUserQuery(
		userProp.wpcom_login || gravatarUser?.user_login, // Use WPCOM login if available, otherwise fall back to Gravatar login.
		userProp.wpcom_id
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
		return (
			<div className="user-hovercard user-hovercard--not-found">
				<UserAvatarDefaultIcon iconSize={ 102 } />
				<p>
					{ translate( 'User not found.' ) }
					<br />
					{ createInterpolateElement(
						translate( 'Is this you? <link>Claim your free profile.</link>' ),
						{
							link: <a href="https://gravatar.com/signup?utm_source=wpcom-reader" />,
						}
					) }
				</p>
			</div>
		);
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
