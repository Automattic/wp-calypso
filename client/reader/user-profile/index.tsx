import './style.scss';
import { userQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import EmptyContent from 'calypso/components/empty-content';
import ReaderBackButton from 'calypso/reader/components/back-button';
import UserProfileHeader from 'calypso/reader/user-profile/components/user-profile-header';
import UserAchievements from 'calypso/reader/user-profile/views/achievements';
import UserLists from 'calypso/reader/user-profile/views/lists';
import UserPosts from 'calypso/reader/user-profile/views/posts';
import UserRecommendedBlogs from 'calypso/reader/user-profile/views/recommended-blogs';
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

	useEffect( () => {
		if ( path?.startsWith( '/reader/users/id/' ) && user ) {
			page.replace( `/reader/users/${ user.user_login }` );
		}
	}, [ path, user ] );

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
				return <UserAchievements />;
			default:
				return null;
		}
	};

	return (
		<div className="user-profile">
			<ReaderMain>
				<ReaderBackButton />
				<UserProfileHeader user={ user } view={ view } />
				{ renderSelectedTabContent() }
			</ReaderMain>
		</div>
	);
}

export default UserProfile;
