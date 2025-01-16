import { Icon, postList } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import { UserData } from 'calypso/lib/user/user';
import Stream from 'calypso/reader/stream';
import UserProfileHeader from 'calypso/reader/user-stream/components/user-profile-header';

interface UserPostsProps {
	streamKey: string;
	user: UserData;
}

const UserPosts = ( { streamKey, user }: UserPostsProps ): JSX.Element => {
	const translate = useTranslate();

	return (
		<Stream
			streamKey={ streamKey }
			className="is-user-stream"
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
		>
			<UserProfileHeader user={ user } />
		</Stream>
	);
};

export default UserPosts;
