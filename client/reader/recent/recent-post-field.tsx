import ReaderFeaturedImage from 'calypso/blocks/reader-featured-image';
import type { PostItem } from './types';
interface RecentPostFieldProps {
	post: PostItem;
}

const RecentPostField: React.FC< RecentPostFieldProps > = ( { post } ) => {
	if ( ! post ) {
		return null;
	}

	return (
		<div className="recent-post-field">
			<div className="recent-post-field__title">
				<div className="recent-post-field__title-text">{ post?.title }</div>
				<div className="recent-post-field__site-name">{ post?.site_name }</div>
			</div>
			<div className="recent-post-field__featured-image">
				<ReaderFeaturedImage
					imageUrl={ post?.featured_image }
					imageWidth={ 38 }
					imageHeight={ 38 }
					isCompactPost
				/>
			</div>
		</div>
	);
};

export default RecentPostField;
