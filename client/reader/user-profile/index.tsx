import './style.scss';
import { userQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, type JSX } from 'react';
import EmptyContent from 'calypso/components/empty-content';
import ReaderBackButton from 'calypso/reader/components/back-button';
import { useProfileTabVisibility } from 'calypso/reader/data/user-profile';
import UserProfileHeader from 'calypso/reader/user-profile/components/user-profile-header';
import { getUserProfileUrl } from 'calypso/reader/user-profile/user-profile.utils';
import UserAchievements from 'calypso/reader/user-profile/views/achievements';
import UserLists from 'calypso/reader/user-profile/views/lists';
import UserPosts from 'calypso/reader/user-profile/views/posts';
import UserRecommendedBlogs from 'calypso/reader/user-profile/views/recommended-blogs';
import UserProfileSettings from 'calypso/reader/user-profile/views/settings';
import UserSites from 'calypso/reader/user-profile/views/sites';
import ReaderMain from '../components/reader-main';

export interface UserProfileProps {
	userLogin: string;
	userId: string;
	path: string;
	view: string;
}

export function UserProfile( props: UserProfileProps ): JSX.Element | null {
	const { userLogin, userId, path, view } = props;
	const translate = useTranslate();
	const { isLoading, data: user } = useQuery( userQuery( userLogin, userId ) );

	const {
		isOwnProfile,
		showPosts,
		showSites,
		isLoading: isVisibilityLoading,
	} = useProfileTabVisibility( userLogin );

	// A view is hidden if the owner has hidden the tab (for public viewers) or it's the
	// owner-only Settings view being visited by someone else.
	const isHiddenView =
		( view === 'settings' && ! isOwnProfile ) ||
		( view === 'posts' && ! showPosts ) ||
		( view === 'sites' && ! showSites );

	useEffect( () => {
		if ( path?.startsWith( '/reader/users/id/' ) && user ) {
			page.replace( `/reader/users/${ user.user_login }` );
		}
	}, [ path, user ] );

	useEffect( () => {
		if ( user && ! isVisibilityLoading && isHiddenView ) {
			// Redirect to the first visible tab. Lists is always available, so falling through to it
			// avoids redirecting back to a hidden Posts/Sites view.
			const profileUrl = getUserProfileUrl( user.user_login );
			let fallbackPath = profileUrl; // Posts is the default view.
			if ( ! showPosts ) {
				fallbackPath = showSites ? `${ profileUrl }/sites` : `${ profileUrl }/lists`;
			}
			page.replace( fallbackPath );
		}
	}, [ user, isVisibilityLoading, isHiddenView, showPosts, showSites ] );

	if ( isLoading ) {
		return (
			<div className="wp-spinner-wrapper" style={ { marginTop: '0' } }>
				<Spinner />
			</div>
		);
	}

	if ( ! user ) {
		return (
			<EmptyContent
				illustration=""
				title={ translate( 'User not found.' ) }
				line={ translate( 'Sorry, the user you were looking for could not be found.' ) }
				action={ translate( 'Return to Reader' ) }
				actionURL="/reader"
				className="user-profile__404"
			/>
		);
	}

	const renderSelectedTabContent = (): React.ReactNode => {
		// Avoid flashing hidden content before the redirect effect above runs.
		if ( isVisibilityLoading || isHiddenView ) {
			return (
				<div className="wp-spinner-wrapper" style={ { marginTop: '0' } }>
					<Spinner />
				</div>
			);
		}

		switch ( view ) {
			case 'posts':
				return <UserPosts user={ user } />;
			case 'sites':
				return <UserSites user={ user } />;
			case 'lists':
				return <UserLists user={ user } />;
			case 'recommended-blogs':
				return <UserRecommendedBlogs user={ user } />;
			case 'achievements':
				return <UserAchievements user={ user } />;
			case 'settings':
				return <UserProfileSettings user={ user } />;
			default:
				return null;
		}
	};

	const isAchievementWideView = view === 'achievements';

	return (
		<div className="user-profile">
			<ReaderMain
				className={ isAchievementWideView ? 'user-profile__achievements-view' : undefined }
			>
				<div className={ isAchievementWideView ? 'user-profile__narrow' : undefined }>
					<ReaderBackButton />
					<UserProfileHeader user={ user } view={ view } />
				</div>
				{ renderSelectedTabContent() }
			</ReaderMain>
		</div>
	);
}

export default UserProfile;
