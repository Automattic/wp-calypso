import { Icon, postList } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import Stream from 'calypso/reader/stream';
import type { ReaderUser } from '@automattic/api-core';
import type { JSX } from 'react';

interface UserPostsProps {
	user: ReaderUser;
}

const UserPosts = ( { user }: UserPostsProps ): JSX.Element => {
	const translate = useTranslate();

	return (
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
	);
};

export default UserPosts;
