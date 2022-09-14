import PropTypes from 'prop-types';
import classnames from 'classnames';
import ReaderFeaturedImage from 'calypso/blocks/reader-featured-image';
import { getImagesFromPostToDisplay } from 'calypso/state/reader/posts/normalization-rules';
import {
	READER_CONTENT_WIDTH,
	READER_FEATURED_MAX_IMAGE_HEIGHT,
} from 'calypso/state/reader/posts/sizes';

const ReaderFeaturedImages = ( { post, postUrl, canonicalMedia } ) => {
	let classNames = 'reader-post-card__featured-images';
	const imagesToDisplay = getImagesFromPostToDisplay( post, 4 );
	if ( imagesToDisplay.length === 0 ) {
		return (
			<ReaderFeaturedImage
				canonicalMedia={ canonicalMedia }
				href={ postUrl }
				fetched={ canonicalMedia.fetched }
			/>
		);
	}

	const listItems = imagesToDisplay.map( ( image, index, [ imageWidth, imageHeight ] ) => {
		const border = 2;

		imageWidth = READER_CONTENT_WIDTH - border;
		imageHeight = READER_FEATURED_MAX_IMAGE_HEIGHT - border;

		if ( imagesToDisplay.length === 4 ) {
			imageWidth = imageWidth / 2;
			imageHeight = imageHeight / 2;
			classNames = classnames( 'reader-post-card__featured-images', 'four-images' );
		} else if ( imagesToDisplay.length === 3 ) {
			imageWidth = imageWidth / 2;
			if ( index !== 0 ) {
				imageHeight = imageHeight / 2;
			}
			classNames = classnames( 'reader-post-card__featured-images', 'three-images' );
		} else if ( imagesToDisplay.length === 2 ) {
			imageWidth = imageWidth / 2;
			classNames = classnames( 'reader-post-card__featured-images', 'two-images' );
		}

		const featuredImage = (
			<ReaderFeaturedImage
				canonicalMedia={ image }
				href={ postUrl }
				fetched={ image.fetched }
				imageWidth={ imageWidth }
				imageHeight={ imageHeight }
			/>
		);

		return (
			<li
				key={ `post-${ post.ID }-image-${ index }` }
				className="reader-post-card__featured-images-item"
			>
				{ featuredImage }
			</li>
		);
	} );

	if ( listItems.length === 3 ) {
		return (
			<ul className={ classNames }>
				{ listItems.slice( 0, 1 ) }
				<li className="reader-post-card__featured-images-item column-two">
					<ul className="reader-post-card__featured-images column">{ listItems.slice( 1 ) }</ul>
				</li>
			</ul>
		);
	}

	return <ul className={ classNames }>{ listItems }</ul>;
};

ReaderFeaturedImages.propTypes = {
	post: PropTypes.object.isRequired,
};

export default ReaderFeaturedImages;
