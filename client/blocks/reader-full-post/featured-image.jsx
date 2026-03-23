import PropTypes from 'prop-types';
import cssSafeUrl from 'calypso/lib/css-safe-url';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import { getFeaturedImageAlt } from 'calypso/reader/get-helpers';

const hideImageOnError = ( event ) => {
	event.target.parentNode.style.display = 'none';
};

function featuredImageAltString( post ) {
	const alt = getFeaturedImageAlt( post );
	return typeof alt === 'string' ? alt : '';
}

export default function ReaderFullPostFeaturedImage( { post, maxWidth } ) {
	if ( ! post?.featured_image ) {
		return null;
	}

	const resizedUrl = resizeImageUrl( post.featured_image, maxWidth );
	const safeSrc = cssSafeUrl( resizedUrl );
	if ( ! safeSrc ) {
		return null;
	}

	return (
		<div className="reader-full-post__featured-image">
			<img src={ safeSrc } alt={ featuredImageAltString( post ) } onError={ hideImageOnError } />
		</div>
	);
}

ReaderFullPostFeaturedImage.propTypes = {
	post: PropTypes.object.isRequired,
	maxWidth: PropTypes.number.isRequired,
};
