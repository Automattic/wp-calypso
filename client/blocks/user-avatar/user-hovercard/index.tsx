import './styles.scss';
import { userQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import UserAvatarDefaultIcon from 'calypso/reader/components/icons/user-avatar-default-icon';
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
	const classNames = 'user-hovercard ignore-click';

	const { isLoading: isGravatarLoading, data: gravatarData } = useGravatarProfileV3Query(
		userProp,
		! wpcomIdOrLogin // Only fetch Gravatar profile if we don't have a WPCOM ID or login.
	);
	const gravatarUser = gravatarData ? { ...gravatarData, primary_blog: null } : null;

	const { isLoading: isWpcomLoading, data: wpcomData } = useQuery(
		userQuery(
			userProp.wpcom_login || gravatarUser?.user_login, // Use WPCOM login if available, otherwise fall back to Gravatar login.
			userProp.wpcom_id
		)
	);

	if ( isWpcomLoading || isGravatarLoading ) {
		return (
			<div className={ classNames }>
				<div className="wp-spinner-wrapper" style={ { marginTop: '0' } }>
					<Spinner />
				</div>
			</div>
		);
	}

	const user = wpcomData?.user_login ? wpcomData : gravatarUser;
	if ( ! user ) {
		return (
			<div className={ `${ classNames } user-hovercard--not-found` }>
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
		<div className={ classNames }>
			<UserHovercardHeader user={ user } />

			{ wpcomData?.primary_blog ? <PrimaryBlogCard user={ user } /> : null }

			{ wpcomData?.recommended_blogs_count ? (
				<RecommendedBlogs userLogin={ user.user_login } />
			) : null }
		</div>
	);
}
