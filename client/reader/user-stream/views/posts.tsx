import { Icon, postList } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import Stream from 'calypso/reader/stream';

interface UserPostsProps {
	streamKey: string;
}

const UserPosts = ( { streamKey }: UserPostsProps ): JSX.Element => {
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
		/>
	);
};

export default UserPosts;
