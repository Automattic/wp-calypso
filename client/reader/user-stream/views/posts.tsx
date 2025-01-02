import { useTranslate } from 'i18n-calypso';
import Stream from 'calypso/reader/stream';

interface UserPostsProps {
	streamKey: string;
}

const UserPosts = ( { streamKey }: UserPostsProps ) => {
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
		/>
	);
};

export default UserPosts;
