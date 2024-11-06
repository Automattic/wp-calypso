import { Button } from '@wordpress/components';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import type { PostItem, ReaderPost } from './types';

interface RecentSeenFieldProps {
	item: ReaderPost;
	post: PostItem;
	handleItemClick: ( item: ReaderPost ) => void;
}

const RecentSeenField: React.FC< RecentSeenFieldProps > = ( { item, post, handleItemClick } ) => {
	return (
		<Button className="recent-seen-field" onClick={ () => handleItemClick( item ) }>
			<ReaderAvatar
				siteIcon={ post.site_icon }
				feedIcon={ post.feed_icon }
				author={ post.author }
				iconSize={ 24 }
			/>
		</Button>
	);
};

export default RecentSeenField;
