import ReaderAvatar from 'calypso/blocks/reader-avatar';
import type { PostItem } from './types';

interface RecentSeenFieldProps {
	post: PostItem;
}

const RecentSeenField: React.FC< RecentSeenFieldProps > = ( { post } ) => {
	return (
		<div className="recent-seen-field">
			<ReaderAvatar siteIcon={ post?.site_icon?.img || post?.author?.avatar_URL } iconSize={ 24 } />
		</div>
	);
};

export default RecentSeenField;
