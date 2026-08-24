import './styles.scss';
import { UserResponse } from '@automattic/api-core';
import { userQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useEffect, type JSX } from 'react';
import UserAvatarDefaultIcon from 'calypso/reader/components/icons/user-avatar-default-icon';
import { UserAvatarInfo } from '..';
import PrimaryBlogCard from './primary-blog-card';
import { useGravatarProfileV3Query } from './queries/use-gravatar-profile-v3-query';
import RecommendedBlogs from './recommended-blogs';
import UserHovercardHeader from './user-hovercard-header';

interface UserHovercardProps {
	user: UserAvatarInfo;
	onUserLoaded: ( user: UserResponse | null ) => void;
}

export default function UserHovercard( props: UserHovercardProps ): JSX.Element | null {
	const translate = useTranslate();
	const { user: userProp, onUserLoaded } = props;
	const wpcomIdOrLogin = userProp.wpcom_id || userProp.wpcom_login;
	const classNames = 'user-hovercard ignore-click';
	const displayName = translate( 'User Profile: %s', {
		args: userProp.display_name ?? '',
	} ) as string;

	const { isLoading: isGravatarLoading, data: gravatarData } = useGravatarProfileV3Query(
		{
			profile_URL: userProp.profile_URL,
			avatar_URL: userProp.avatar_URL,
			cache404: true,
		},
		! wpcomIdOrLogin // Only fetch Gravatar profile if we don't have a WPCOM ID or login.
	);
	const gravatarUser = gravatarData ? { ...gravatarData, primary_blog: null } : null;

	const { isLoading: isWpcomLoading, data: wpcomData } = useQuery(
		userQuery(
			userProp.wpcom_login || gravatarUser?.user_login, // Use WPCOM login if available, otherwise fall back to Gravatar login.
			userProp.wpcom_id
		)
	);

	const user = wpcomData?.user_login ? wpcomData : gravatarUser;
	useEffect( () => {
		if ( isWpcomLoading || isGravatarLoading ) {
			return;
		}

		onUserLoaded( user ?? null );
	}, [ isWpcomLoading, isGravatarLoading, onUserLoaded, user ] );

	if ( isWpcomLoading || isGravatarLoading ) {
		return (
			<div
				className={ classNames }
				role="dialog"
				aria-label={ displayName }
				aria-busy="true"
				// Using tabIndex to trap focus inside the hovercard while it's loading. Else users focus jump to start of the page.
				tabIndex={ 0 } // eslint-disable-line jsx-a11y/no-noninteractive-tabindex
			>
				<div className="wp-spinner-wrapper" style={ { marginTop: '0' } }>
					<Spinner />
				</div>
			</div>
		);
	}

	if ( ! user ) {
		return (
			<div
				className={ `${ classNames } user-hovercard--not-found` }
				role="dialog"
				aria-label={ displayName }
			>
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
		<div className={ classNames } role="dialog" aria-label={ displayName }>
			<UserHovercardHeader user={ user } />

			{ wpcomData?.primary_blog ? <PrimaryBlogCard user={ user } /> : null }

			{ wpcomData?.recommended_blogs_count ? (
				<RecommendedBlogs userLogin={ user.user_login } />
			) : null }
		</div>
	);
}
