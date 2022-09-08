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
	imageUrl,
	imageWidth,
	imageHeight,
} ) => {
	const featuredImageUrl = imageUrl || canonicalMedia?.src;
	if ( featuredImageUrl === undefined ) {
		return null;
	}
	// Don't resize image if it was already fetched.
	const resizedUrl = fetched
		? featuredImageUrl
		: resizeImageUrl( featuredImageUrl, { w: imageWidth || READER_CONTENT_WIDTH } );
	const safeCssUrl = cssSafeUrl( resizedUrl );

	let featuredImageStyle = { background: 'none' };
	if ( safeCssUrl ) {
		featuredImageStyle = {
			backgroundImage: 'url(' + safeCssUrl + ')',
			backgroundSize: 'cover',
			backgroundPosition: '50% 50%',
			backgroundRepeat: 'no-repeat',
		};
	}
	const newHeight = imageHeight || READER_FEATURED_MAX_IMAGE_HEIGHT;

	featuredImageStyle.height = newHeight;
	featuredImageStyle.width = imageWidth || READER_CONTENT_WIDTH;

	const classNames = classnames( className, 'reader-featured-image' );

	return (
		<a className={ classNames } href={ href } style={ featuredImageStyle } onClick={ onClick }>
			{ children }
		</a>
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
