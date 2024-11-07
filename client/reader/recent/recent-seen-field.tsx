import { Button } from '@wordpress/components';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import type { PostItem, ReaderPost } from './types';

interface RecentSeenFieldProps {
	item: ReaderPost;
	post: PostItem;
	setSelectedItem: ( post: ReaderPost | null ) => void;
}

const RecentSeenField: React.FC< RecentSeenFieldProps > = ( { item, post, setSelectedItem } ) => {
	return (
		<Button className="recent-seen-field" onClick={ () => setSelectedItem( item ) }>
			<ReaderAvatar siteIcon={ post?.site_icon?.img } iconSize={ 24 } />
		</Button>
	);
};

export default RecentSeenField;
