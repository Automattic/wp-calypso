import { Icon, postList } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import { UserData } from 'calypso/lib/user/user';
import Stream from 'calypso/reader/stream';

interface UserPostsProps {
	user: UserData;
}

const UserPosts = ( { user }: UserPostsProps ): JSX.Element => {
	const translate = useTranslate();

	return (
		<Stream
			streamKey={ `user:${ user.ID }` }
			className="is-user-profile"
			listName={ translate( 'User Posts' ) }
			showFollowButton={ false }
			showSiteNameOnCards
			sidebarTabTitle={ translate( 'Related' ) }
			useCompactCards
			trackScrollPage={ () => {} }
			emptyContent={ () => (
				<EmptyContent
					illustration={ null }
					icon={ <Icon icon={ postList } size={ 48 } /> }
					title={ null }
					line={ translate( 'No posts yet.' ) }
				/>
			) }
			showBack={ false }
		/>
	);
};

export default UserPosts;
