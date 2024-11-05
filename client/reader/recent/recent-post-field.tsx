import { Button } from '@wordpress/components';
import { useSelector } from 'react-redux';
import ReaderFeaturedImage from 'calypso/blocks/reader-featured-image';
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
		<Button className="recent-post-field" onClick={ () => setSelectedItem( item ) }>
			<div className="recent-post-field__title">
				<div className="recent-post-field__title-text">{ post?.title }</div>
				<div className="recent-post-field__site-name">{ item.site_name }</div>
			</div>
			<div className="recent-post-field__featured-image">
				<ReaderFeaturedImage
					imageUrl={ post?.featured_image }
					imageWidth={ 38 }
					imageHeight={ 38 }
					isCompactPost
				/>
			</div>
		</Button>
	);
};

export default RecentPostField;
