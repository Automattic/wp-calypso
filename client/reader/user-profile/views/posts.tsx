import { Icon, postList } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import Stream from 'calypso/reader/stream';
import UserProfilePrivateTabNotice from 'calypso/reader/user-profile/components/private-tab-notice';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import type { ReaderUser } from '@automattic/api-core';
import type { JSX } from 'react';

interface UserPostsProps {
	user: ReaderUser;
}

const UserPosts = ( { user }: UserPostsProps ): JSX.Element => {
	const translate = useTranslate();
	const currentUser = useSelector( getCurrentUser );
	const isOwnProfile = currentUser?.username === user.user_login;

	return (
		<>
			{ isOwnProfile && (
				<UserProfilePrivateTabNotice
					title={ translate( 'Your posts are private' ) }
					tab="posts"
					userPreferencesKey="reader-profile-posts-visibility"
				/>
			) }
			<Stream
				streamKey={ `user:${ user.ID }` }
				className="user-profile-posts no-padding"
				listName={ translate( 'User Posts' ) }
				showFollowButton={ false }
				showSiteNameOnCards
				sidebarTabTitle={ translate( 'Related' ) }
				useCompactCards
				trackScrollPage={ () => {} }
				emptyContent={ () => (
					<EmptyContent
						icon={ <Icon icon={ postList } size={ 48 } /> }
						title={ null }
						line={ translate( 'No posts yet.' ) }
					/>
				) }
			/>
		</>
	);
};

export default UserPosts;
