import classnames from 'classnames';
import PropTypes from 'prop-types';
import cssSafeUrl from 'calypso/lib/css-safe-url';

import './style.scss';

const noop = () => {};

const ReaderFeaturedImage = ( {
	post,
	href,
	children,
	onClick,
	className,
	imageWidth,
	imageHeight,
} ) => {
	const imageUrl = post.canonical_media.src;
	if ( imageUrl === undefined ) {
		return null;
	}

	const imageSize = {
		height: post.canonical_media.height,
		width: post.canonical_media.width,
	};

	const featuredImageStyle = {
		backgroundImage: 'url(' + cssSafeUrl( imageUrl ) + ')',
		backgroundSize: post.isExpanded ? 'contain' : 'cover',
		backgroundRepeat: 'no-repeat',
		backgroundPosition: 'center',
	};

	const classNames = classnames( className, 'reader-featured-image' );
	const { width: naturalWidth, height: naturalHeight } = imageSize;
	const newHeight = Math.min( ( naturalHeight / naturalWidth ) * imageWidth, imageHeight );
	const newWidth = ( naturalWidth / naturalHeight ) * newHeight;

	featuredImageStyle.height = newHeight;
	featuredImageStyle.width = newWidth;

	const divStyle = { height: newHeight, width: newWidth, margin: '0 auto' };

	return (
		<div style={ divStyle }>
			<a className={ classNames } href={ href } style={ featuredImageStyle } onClick={ onClick }>
				{ children }
			</a>
		</div>
	);
};

ReaderFeaturedImage.propTypes = {
	post: PropTypes.object.isRequired,
	href: PropTypes.string,
	onClick: PropTypes.func,
};

ReaderFeaturedImage.defaultProps = {
	onClick: noop,
	imageWidth: 600,
	imageHeight: 400,
};

export default ReaderFeaturedImage;
