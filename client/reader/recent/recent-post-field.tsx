import { Button } from '@wordpress/components';
import { useSelector } from 'react-redux';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import { AppState } from 'calypso/types';
import type { ReaderPost } from './types';

interface RecentPostFieldProps {
	item: ReaderPost;
	setSelectedItem: ( post: ReaderPost | null ) => void;
}

const RecentPostField: React.FC< RecentPostFieldProps > = ( { item, setSelectedItem } ) => {
	const post = useSelector( ( state: AppState ) =>
		getPostByKey( state, {
			feedId: +item.feedId,
			postId: +item.postId,
		} )
	);

	return (
		<Button onClick={ () => setSelectedItem( item ) }>
			{ post?.title }
			{ item.site_name }
		</Button>
	);
};

export default RecentPostField;
