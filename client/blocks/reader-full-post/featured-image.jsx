import PropTypes from 'prop-types';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import { getFeaturedImageAlt } from 'calypso/reader/get-helpers';

const hideImageOnError = ( event ) => {
	event.target.parentNode.style.display = 'none';
};

export default function ReaderFullPostFeaturedImage( { post, maxWidth } ) {
	if ( ! post?.featured_image ) {
		return null;
	}

	const resizedUrl = resizeImageUrl( post.featured_image, maxWidth );
	if ( ! resizedUrl ) {
		return null;
	}

	return (
		<div className="reader-full-post__featured-image">
			<img src={ resizedUrl } alt={ getFeaturedImageAlt( post ) } onError={ hideImageOnError } />
		</div>
	);
}

ReaderFullPostFeaturedImage.propTypes = {
	post: PropTypes.object.isRequired,
	maxWidth: PropTypes.number.isRequired,
};
