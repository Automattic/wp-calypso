import { Button } from '@wordpress/components';
import ReaderFeaturedImage from 'calypso/blocks/reader-featured-image';
import type { ReaderPost, PostItem } from './types';
interface RecentPostFieldProps {
	item: ReaderPost;
	post: PostItem;
	setSelectedItem: ( post: ReaderPost | null ) => void;
}

const RecentPostField: React.FC< RecentPostFieldProps > = ( { item, post, setSelectedItem } ) => {
	if ( ! post ) {
		return null;
	}

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
