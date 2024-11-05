import ReaderAvatar from 'calypso/blocks/reader-avatar';
import type { PostItem } from './types';

interface RecentSeenFieldProps {
	post: PostItem;
}

const RecentSeenField: React.FC< RecentSeenFieldProps > = ( { post } ) => {
	return (
		<ReaderAvatar
			siteIcon={ post.site_icon }
			feedIcon={ post.feed_icon }
			author={ post.author }
			isCompact
		/>
	);
};

export default RecentSeenField;
