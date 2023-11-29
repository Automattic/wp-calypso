import classnames from 'classnames';
import PropTypes from 'prop-types';
import cssSafeUrl from 'calypso/lib/css-safe-url';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import {
	READER_FEATURED_MAX_IMAGE_HEIGHT,
	READER_COMPACT_POST_FEATURED_MAX_IMAGE_HEIGHT,
	READER_COMPACT_POST_FEATURED_MAX_IMAGE_WIDTH,
} from 'calypso/state/reader/posts/sizes';
import './style.scss';

const noop = () => {};

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
	const featuredImageUrl = imageUrl || canonicalMedia?.src;
	if ( featuredImageUrl === undefined ) {
		return null;
	}
	let resizedImageWidth = imageWidth;
	if ( resizedImageWidth === undefined ) {
		resizedImageWidth =
			isCompactPost && hasExcerpt ? READER_COMPACT_POST_FEATURED_MAX_IMAGE_WIDTH : 'auto';
	}
	// Don't resize image if it was already fetched.
	const resizedUrl = fetched
		? featuredImageUrl
		: resizeImageUrl( featuredImageUrl, { w: resizedImageWidth } );
	const safeCssUrl = cssSafeUrl( resizedUrl );
	const newHeight =
		imageHeight ||
		( isCompactPost && hasExcerpt
			? READER_COMPACT_POST_FEATURED_MAX_IMAGE_HEIGHT
			: READER_FEATURED_MAX_IMAGE_HEIGHT );
	let featuredImageStyle = { background: 'none' };
	if ( safeCssUrl ) {
		if ( children ) {
			featuredImageStyle = {
				backgroundImage: 'url(' + safeCssUrl + ')',
				backgroundSize: 'cover',
				backgroundPosition: '50% 50%',
				backgroundRepeat: 'no-repeat',
				height: newHeight,
				width: resizedImageWidth || 'auto',
			};
		} else {
			children = <img src={ safeCssUrl } alt="Featured" />;
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

export default ReaderFeaturedImage;
