import classnames from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cssSafeUrl from 'calypso/lib/css-safe-url';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import {
	READER_FEATURED_MAX_IMAGE_HEIGHT,
	READER_COMPACT_POST_FEATURED_MAX_IMAGE_HEIGHT,
	READER_COMPACT_POST_FEATURED_MAX_IMAGE_WIDTH,
} from 'calypso/state/reader/posts/sizes';
import './style.scss';

const noop = () => {};

/**
 * Check if the image can fit the container without cropping or letterboxing
 *
 * @param imageWidth number Width of the image
 * @param imageHeight number Height of the image
 * @param containerWidth number Width of the container
 * @param containerHeight number Height of the container
 * @returns {boolean}
 */
const canImageFitContainer = ( imageWidth, imageHeight, containerWidth, containerHeight ) => {
	// Calculate the aspect ratios of the image and container
	const imageAspectRatio = imageWidth / imageHeight;
	const containerAspectRatio = containerWidth / containerHeight;

	console.log( 'imageWidth', imageWidth );
	console.log( 'imageHeight', imageHeight );
	console.log( 'containerWidth', containerWidth );
	console.log( 'containerHeight', containerHeight );
	console.log( 'imageAspectRatio', imageAspectRatio );
	console.log( 'containerAspectRatio', containerAspectRatio );

	// Check if the image's aspect ratio is greater than or equal to the container's aspect ratio
	// and if its width and height are less than or equal to the container's dimensions
	if (
		imageAspectRatio >= containerAspectRatio &&
		imageWidth <= containerWidth &&
		imageHeight <= containerHeight
	) {
		return true; // Image can fit without cropping or letterboxing
	}
	return false; // Image cannot fit without cropping or letterboxing
};

const ReaderFeaturedImage = ( {
	canonicalMedia,
	href,
	children,
	onClick,
	className,
	fetched,
	imageUrl,
	origImageWidth,
	imageWidth,
	origImageHeight,
	imageHeight,
	isCompactPost,
	hasExcerpt,
} ) => {
	// No featured image, so don't render anything
	if ( imageUrl === undefined ) {
		return null;
	}

	console.log( 'image details', canonicalMedia, imageWidth, imageHeight, imageUrl );

	// Choose the smallest width between the image width, original image width, and the container width
	const containerWidth = Math.min(
		imageWidth ?? origImageWidth ?? READER_COMPACT_POST_FEATURED_MAX_IMAGE_WIDTH,
		READER_COMPACT_POST_FEATURED_MAX_IMAGE_WIDTH
	);
	const containerHeight = Math.min(
		imageHeight ?? origImageHeight ?? READER_COMPACT_POST_FEATURED_MAX_IMAGE_HEIGHT,
		READER_COMPACT_POST_FEATURED_MAX_IMAGE_HEIGHT
	);

	const resizedImageUrl = fetched
		? imageUrl
		: resizeImageUrl( imageUrl, { w: containerWidth }, containerHeight );
	const safeCssUrl = cssSafeUrl( resizedImageUrl );

	const imageFitsContainer =
		! origImageWidth ||
		! origImageHeight ||
		canImageFitContainer( origImageWidth, origImageHeight, containerWidth, containerHeight );
	let featuredImageStyle = { background: 'none' };
	if ( safeCssUrl ) {
		if ( children ) {
			featuredImageStyle = {
				backgroundImage: 'url(' + safeCssUrl + ')',
				backgroundPosition: '50% 50%',
				height: containerHeight,
				width: containerWidth,
			};
			if ( imageFitsContainer ) {
				featuredImageStyle = {
					...featuredImageStyle,
					backgroundSize: 'contain',
				};
			} else {
				featuredImageStyle = {
					...featuredImageStyle,
					backgroundSize: 'cover',
					backgroundRepeat: 'no-repeat',
				};
			}
		} else {
			featuredImageStyle = {
				...featuredImageStyle,
				height: containerHeight,
			};

			children = <img src={ safeCssUrl } alt="Featured" style={ { height: containerHeight } } />;
		}
	}

	const classNames = classnames( className, 'reader-featured-image' );

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
	return {
		imageUrl: imageUrl ?? src,
		origImageWidth: width,
		origImageHeight: height,
	};
};

export default connect( mapStateToProps )( ReaderFeaturedImage );
