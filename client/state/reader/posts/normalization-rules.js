import { flow } from 'lodash';
import addImageWrapperElement from 'calypso/lib/post-normalizer/rule-add-image-wrapper-element';
import addMinutesToRead from 'calypso/lib/post-normalizer/rule-add-minutes-to-read';
import convertVideoPressBlocks from 'calypso/lib/post-normalizer/rule-content-convert-videopress-blocks';
import detectMedia from 'calypso/lib/post-normalizer/rule-content-detect-media';
import detectPolls from 'calypso/lib/post-normalizer/rule-content-detect-polls';
import detectSurveys from 'calypso/lib/post-normalizer/rule-content-detect-surveys';
import {
	disableAutoPlayOnMedia,
	disableAutoPlayOnEmbeds,
} from 'calypso/lib/post-normalizer/rule-content-disable-autoplay';
import linkJetpackCarousels from 'calypso/lib/post-normalizer/rule-content-link-jetpack-carousels';
import makeEmbedsSafe from 'calypso/lib/post-normalizer/rule-content-make-embeds-safe';
import makeImagesSafe from 'calypso/lib/post-normalizer/rule-content-make-images-safe';
import makeContentLinksSafe from 'calypso/lib/post-normalizer/rule-content-make-links-safe';
import removeElementsBySelector from 'calypso/lib/post-normalizer/rule-content-remove-elements-by-selector';
import removeStyles from 'calypso/lib/post-normalizer/rule-content-remove-styles';
import createBetterExcerpt from 'calypso/lib/post-normalizer/rule-create-better-excerpt';
import decodeEntities from 'calypso/lib/post-normalizer/rule-decode-entities';
import keepValidImages from 'calypso/lib/post-normalizer/rule-keep-valid-images';
import makeLinksSafe from 'calypso/lib/post-normalizer/rule-make-links-safe';
import makeSiteIdSafeForApi from 'calypso/lib/post-normalizer/rule-make-site-id-safe-for-api';
import pickCanonicalImage from 'calypso/lib/post-normalizer/rule-pick-canonical-image';
import pickCanonicalMedia from 'calypso/lib/post-normalizer/rule-pick-canonical-media';
import pickPrimaryTag from 'calypso/lib/post-normalizer/rule-pick-primary-tag';
import preventWidows from 'calypso/lib/post-normalizer/rule-prevent-widows';
import safeImageProperties from 'calypso/lib/post-normalizer/rule-safe-image-properties';
import stripHtml from 'calypso/lib/post-normalizer/rule-strip-html';
import waitForImagesToLoad from 'calypso/lib/post-normalizer/rule-wait-for-images-to-load';
import withContentDom from 'calypso/lib/post-normalizer/rule-with-content-dom';
import DISPLAY_TYPES from './display-types';
import {
	READER_CONTENT_WIDTH,
	PHOTO_ONLY_MIN_WIDTH,
	PHOTO_ONLY_MAX_CHARACTER_COUNT,
	GALLERY_MIN_IMAGES,
	GALLERY_MAX_IMAGES,
	GALLERY_MIN_IMAGE_WIDTH,
	MIN_IMAGE_WIDTH,
	MIN_IMAGE_HEIGHT,
} from './sizes';

function getCharacterCount( post ) {
	if ( ! post || ! post.content_no_html ) {
		return 0;
	}

	return post.content_no_html.length;
}

export function imageIsBigEnoughForGallery( image ) {
	return image.width >= GALLERY_MIN_IMAGE_WIDTH && image.height >= MIN_IMAGE_HEIGHT;
}

export function imageWithCorrectRatio( image ) {
	const imageRatio = image.height / image.width;
	const minRatio = 1 / 3;
	const maxRatio = 3;
	return imageRatio >= minRatio && imageRatio <= maxRatio;
}

export function getImagesFromPostToDisplay( post, numberOfImagesToDisplay ) {
	const images = ( post.images && [ ...post.images ] ) || [];

	// Remove duplicates, small images and images that are outside ideal aspect ratio
	return images
		.filter(
			( element, index ) => index === images.findIndex( ( elem ) => elem.src === element.src )
		)
		.filter( imageIsBigEnoughForGallery )
		.filter( imageWithCorrectRatio )
		.slice( 0, numberOfImagesToDisplay );
}

const hasShortContent = ( post ) => getCharacterCount( post ) <= PHOTO_ONLY_MAX_CHARACTER_COUNT;

/**
 * Attempt to classify the post into a display type
 * @param  {Object}   post     A post to classify
 * @returns {Object}            The classified post
 */
export function classifyPost( post ) {
	const imagesForGallery = getImagesFromPostToDisplay( post, GALLERY_MAX_IMAGES );
	let displayType = DISPLAY_TYPES.UNCLASSIFIED;

	if ( imagesForGallery.length >= GALLERY_MIN_IMAGES ) {
		displayType ^= DISPLAY_TYPES.GALLERY;
	} else if (
		post.canonical_media &&
		post.canonical_media.mediaType === 'image' &&
		post.canonical_media.width >= PHOTO_ONLY_MIN_WIDTH &&
		hasShortContent( post )
	) {
		displayType ^= DISPLAY_TYPES.PHOTO_ONLY;
	}

	if ( post.canonical_media && post.canonical_media.mediaType === 'video' ) {
		displayType ^= DISPLAY_TYPES.FEATURED_VIDEO;
	}

	if ( post.tags && post.tags[ 'p2-xpost' ] ) {
		displayType ^= DISPLAY_TYPES.X_POST;
	}

	post.display_type = displayType;

	return post;
}

function identifyRedditPost( post ) {
	if ( ! post ) {
		return post;
	}

	post.is_reddit_post =
		post.site_URL?.includes( 'reddit.com' ) ||
		post.site_name?.includes( 'reddit' ) ||
		post.author?.name?.includes( 'reddit' );

	return post;
}

const fastPostNormalizationRules = flow( [
	decodeEntities,
	stripHtml,
	preventWidows,
	makeSiteIdSafeForApi,
	pickPrimaryTag,
	safeImageProperties( READER_CONTENT_WIDTH ),
	makeLinksSafe,
	withContentDom( [
		convertVideoPressBlocks,
		removeStyles,
		removeElementsBySelector,
		makeImagesSafe(),
		makeEmbedsSafe,
		makeContentLinksSafe,
		disableAutoPlayOnEmbeds,
		disableAutoPlayOnMedia,
		detectMedia,
		detectPolls,
		detectSurveys,
		linkJetpackCarousels,
		addImageWrapperElement,
	] ),
	createBetterExcerpt,
	addMinutesToRead,
	pickCanonicalImage,
	pickCanonicalMedia,
	identifyRedditPost,
	classifyPost,
] );

export function runFastRules( post ) {
	if ( ! post ) {
		return post;
	}
	post = Object.assign( {}, post );
	fastPostNormalizationRules( post );
	return post;
}

const slowSyncRules = flow( [
	keepValidImages( MIN_IMAGE_WIDTH, MIN_IMAGE_HEIGHT ),
	pickCanonicalImage,
	pickCanonicalMedia,
	classifyPost,
] );

export function runSlowRules( post ) {
	post = Object.assign( {}, post );
	return waitForImagesToLoad( post ).then( slowSyncRules );
}
