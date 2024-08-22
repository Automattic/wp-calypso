import clsx from 'clsx';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cssSafeUrl from 'calypso/lib/css-safe-url';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import {
	READER_COMPACT_POST_FEATURED_MAX_IMAGE_HEIGHT,
	READER_COMPACT_POST_FEATURED_MAX_IMAGE_WIDTH,
	READER_COMPACT_POST_NO_EXCERPT_FEATURED_MAX_IMAGE_WIDTH,
	READER_FEATURED_MAX_IMAGE_HEIGHT,
} from 'calypso/state/reader/posts/sizes';
import './style.scss';

const noop = () => {};

const getFeaturedImageType = (
	canonicalMedia,
	imageWidth,
	imageHeight,
	isCompactPost,
	hasExcerpt
) => {
	let featuredImageType = 'image';
	if ( canonicalMedia?.mediaType === 'video' ) {
		if ( canonicalMedia?.type === 'pocketcasts' ) {
			featuredImageType = 'pocketcasts';
		} else {
			featuredImageType = 'video';
		}
		featuredImageType += '-thumbnail';
	}

	if ( isCompactPost ) {
		featuredImageType += '-compact';
	}

	if ( ! hasExcerpt ) {
		featuredImageType += '-no-excerpt';
	}

	if ( isCompactPost ) {
		if ( hasExcerpt ) {
			if ( imageWidth < READER_COMPACT_POST_FEATURED_MAX_IMAGE_WIDTH ) {
				featuredImageType += '-small';
			}
			if ( imageHeight < READER_COMPACT_POST_FEATURED_MAX_IMAGE_HEIGHT ) {
				featuredImageType += '-short';
			}
		} else {
			if ( imageWidth < READER_COMPACT_POST_NO_EXCERPT_FEATURED_MAX_IMAGE_WIDTH ) {
				featuredImageType += '-small';
			}
			if ( imageHeight < READER_FEATURED_MAX_IMAGE_HEIGHT ) {
				featuredImageType += '-short';
			}
		}
	}

	return featuredImageType;
};

const ReaderFeaturedImage = ( {
	canonicalMedia,
	href,
	children,
	onClick,
	className,
	fetched,
	imageUrl,
	imageWidth,
	imageHeight,
	isCompactPost,
	hasExcerpt,
} ) => {
	// No featured image, so don't render anything
	if ( imageUrl === undefined ) {
		return null;
	}

	const featuredImageType = getFeaturedImageType(
		canonicalMedia,
		imageWidth,
		imageHeight,
		isCompactPost,
		hasExcerpt
	);

	let containerWidth = null;
	let containerHeight = null;

	switch ( featuredImageType ) {
		case 'video-thumbnail':
			containerWidth = READER_COMPACT_POST_FEATURED_MAX_IMAGE_WIDTH;
			containerHeight = READER_FEATURED_MAX_IMAGE_HEIGHT;
			break;
		case 'image-compact':
		case 'video-thumbnail-compact':
			containerWidth = READER_COMPACT_POST_FEATURED_MAX_IMAGE_WIDTH;
			containerHeight = READER_COMPACT_POST_FEATURED_MAX_IMAGE_HEIGHT;
			break;
		case 'image-compact-no-excerpt':
		case 'pocketcasts-thumbnail-compact-no-excerpt':
		case 'video-thumbnail-compact-no-excerpt':
		case 'image-no-excerpt':
		case 'pocketcasts-thumbnail-no-excerpt':
		case 'video-thumbnail-no-excerpt':
			containerWidth = READER_COMPACT_POST_NO_EXCERPT_FEATURED_MAX_IMAGE_WIDTH;
			containerHeight = READER_FEATURED_MAX_IMAGE_HEIGHT;
			break;
		case 'pocketcasts-thumbnail':
			containerWidth = READER_COMPACT_POST_NO_EXCERPT_FEATURED_MAX_IMAGE_WIDTH;
			containerHeight = containerWidth; // Make square
			break;
		case 'pocketcasts-thumbnail-compact':
			containerWidth = READER_COMPACT_POST_FEATURED_MAX_IMAGE_WIDTH;
			containerHeight = containerWidth; // Make square
			break;
		case 'image-compact-small':
		case 'video-thumbnail-compact-small':
			containerWidth = imageWidth;
			containerHeight = READER_COMPACT_POST_FEATURED_MAX_IMAGE_HEIGHT;
			break;
		case 'image-compact-short':
		case 'video-thumbnail-compact-short':
			containerWidth = READER_COMPACT_POST_FEATURED_MAX_IMAGE_WIDTH;
			containerHeight = imageHeight;
			break;
		case 'image':
		case 'image-compact-small-short':
		case 'video-thumbnail-compact-small-short':
		case 'image-compact-no-excerpt-small-short':
		case 'video-thumbnail-compact-no-excerpt-small-short':
			containerWidth = imageWidth;
			containerHeight = imageHeight;
			break;
		default:
			containerWidth = READER_COMPACT_POST_FEATURED_MAX_IMAGE_WIDTH;
			containerHeight = READER_COMPACT_POST_FEATURED_MAX_IMAGE_HEIGHT;
	}

	const resizedImageUrl = fetched
		? imageUrl
		: resizeImageUrl( imageUrl, { w: containerWidth }, containerHeight );
	const safeCssUrl = cssSafeUrl( resizedImageUrl );
	if ( ! safeCssUrl ) {
		return null;
	}

	// Set default style to no background
	let featuredImageStyle = {
		background: 'none',
		height: containerHeight,
	};

	const isPortrait = imageHeight > imageWidth;

	if ( children ) {
		// If there are children, then we are rendering an image tag inside the anchor tag
		// In this case we will need to anchor tag will need specific styling to show the image(s)
		featuredImageStyle = {
			backgroundImage: 'url(' + safeCssUrl + ')',
			backgroundPosition: '50% 50%',
			height: containerHeight,
			width: 'auto',
			backgroundSize: 'cover',
			backgroundRepeat: 'no-repeat',
		};
	} else {
		if ( isPortrait ) {
			featuredImageStyle.background = 'var(--studio-gray-0)';
		}

		// Since there is no children in props, we need to create a new image tag to ensure the correct size is rendered
		children = (
			<img
				src={ safeCssUrl }
				alt="Featured"
				style={ { height: containerHeight, ...( ! isPortrait && { width: '100%' } ) } }
			/>
		);
	}

	const classNames = clsx( className, 'reader-featured-image' );

	return (
		<a className={ classNames } href={ href } style={ featuredImageStyle } onClick={ onClick }>
			{ children }
		</a>
	);
};

ReaderFeaturedImage.propTypes = {
	canonicalMedia: PropTypes.object,
	href: PropTypes.string,
	onClick: PropTypes.func,
};

ReaderFeaturedImage.defaultProps = {
	onClick: noop,
};

const mapStateToProps = ( state, ownProps ) => {
	const { canonicalMedia, imageUrl } = ownProps;
	const { src, width, height } = canonicalMedia ?? {};
	const imageWidth = ownProps.imageWidth ?? width;
	const imageHeight = ownProps.imageHeight ?? height;
	return {
		imageUrl: imageUrl ?? src,
		imageWidth: imageWidth,
		imageHeight: imageHeight,
	};
};

export default connect( mapStateToProps )( ReaderFeaturedImage );
