import classnames from 'classnames';
import PropTypes from 'prop-types';
import cssSafeUrl from 'calypso/lib/css-safe-url';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import {
	READER_FEATURED_MAX_IMAGE_HEIGHT,
	READER_CONTENT_WIDTH,
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
	imageWidth,
	imageHeight,
} ) => {
	const imageUrl = canonicalMedia.src;
	if ( imageUrl === undefined ) {
		return null;
	}

	const resizedImageUrl = fetched
		? imageUrl
		: resizeImageUrl( imageUrl, { w: imageWidth || READER_CONTENT_WIDTH } );
	const safeCssUrl = cssSafeUrl( resizedImageUrl );
	let featuredImageStyle = { background: 'none' };
	if ( safeCssUrl ) {
		featuredImageStyle = {
			backgroundImage: 'url(' + safeCssUrl + ')',
			backgroundSize: 'cover',
			backgroundPosition: '50% 50%',
			backgroundRepeat: 'no-repeat',
		};
	}

	// const imageSize = {
	// 	height: post.canonical_media.height,
	// 	width: post.canonical_media.width,
	// };
	//const { width: naturalWidth, height: naturalHeight } = imageSize;
	//const newHeight = ( naturalHeight / naturalWidth ) * imageWidth;
	const newHeight = imageHeight || READER_FEATURED_MAX_IMAGE_HEIGHT;

	featuredImageStyle.height = newHeight;
	featuredImageStyle.width = imageWidth || READER_CONTENT_WIDTH;

	const divStyle = { height: newHeight };
	const classNames = classnames( className, 'reader-featured-image' );

	return (
		<div style={ divStyle }>
			<a className={ classNames } href={ href } style={ featuredImageStyle } onClick={ onClick }>
				{ children }
			</a>
		</div>
	);
};

ReaderFeaturedImage.propTypes = {
	canonicalMedia: PropTypes.object.isRequired,
	href: PropTypes.string,
	onClick: PropTypes.func,
};

ReaderFeaturedImage.defaultProps = {
	onClick: noop,
};

export default ReaderFeaturedImage;
