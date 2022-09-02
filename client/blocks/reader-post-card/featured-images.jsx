import PropTypes from 'prop-types';
import ReaderFeaturedImage from 'calypso/blocks/reader-featured-image';
import { isFeaturedImageInContent } from 'calypso/lib/post-normalizer/utils';
import { imageIsBigEnoughForGallery } from 'calypso/state/reader/posts/normalization-rules';
import { READER_CONTENT_WIDTH, READER_IMAGE_HEIGHT } from 'calypso/state/reader/posts/sizes';

function getGalleryWorthyImages( post ) {
	const numberOfImagesToDisplay = 4;
	const images = ( post.images && [ ...post.images ] ) || [];
	const indexToRemove = isFeaturedImageInContent( post );
	if ( indexToRemove ) {
		images.splice( indexToRemove, 1 );
	}

	return images.filter( imageIsBigEnoughForGallery ).slice( 0, numberOfImagesToDisplay );
}

const ReaderFeaturedImages = ( { post, postUrl, canonicalMedia } ) => {
	const imagesToDisplay = getGalleryWorthyImages( post );

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
		imageWidth = READER_CONTENT_WIDTH;
		imageHeight = READER_IMAGE_HEIGHT;

		if ( imagesToDisplay.length === 4 ) {
			imageWidth = imageWidth / 2;
			imageHeight = imageHeight / 2;
		} else if ( imagesToDisplay.length === 3 ) {
			imageWidth = imageWidth / 2;
			if ( index !== 0 ) {
				imageHeight = imageHeight / 2;
			}
		} else if ( imagesToDisplay.length === 2 ) {
			imageWidth = imageWidth / 2;
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
			<ul className="reader-post-card__featured-images">
				{ listItems.slice( 0, 1 ) }
				<ul className="reader-post-card__featured-images column">{ listItems.slice( 1 ) }</ul>
			</ul>
		);
	}

	return <ul className="reader-post-card__featured-images">{ listItems }</ul>;
};

ReaderFeaturedImages.propTypes = {
	post: PropTypes.object.isRequired,
	isDiscover: PropTypes.bool,
};

export default ReaderFeaturedImages;
