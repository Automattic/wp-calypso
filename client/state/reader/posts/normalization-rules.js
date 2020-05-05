/**
 * External Dependencies
 */
import { filter, flow } from 'lodash';

/**
 * Internal Dependencies
 */
import DISPLAY_TYPES from './display-types';

/**
 * Rules
 */
import createBetterExcerpt from 'lib/post-normalizer/rule-create-better-excerpt';
import detectMedia from 'lib/post-normalizer/rule-content-detect-media';
import detectPolls from 'lib/post-normalizer/rule-content-detect-polls';
import detectSurveys from 'lib/post-normalizer/rule-content-detect-surveys';
import makeEmbedsSafe from 'lib/post-normalizer/rule-content-make-embeds-safe';
import removeStyles from 'lib/post-normalizer/rule-content-remove-styles';
import makeImagesSafe from 'lib/post-normalizer/rule-content-make-images-safe';
import {
	disableAutoPlayOnMedia,
	disableAutoPlayOnEmbeds,
} from 'lib/post-normalizer/rule-content-disable-autoplay';
import decodeEntities from 'lib/post-normalizer/rule-decode-entities';
import pickCanonicalImage from 'lib/post-normalizer/rule-pick-canonical-image';
import makeSiteIdSafeForApi from 'lib/post-normalizer/rule-make-site-id-safe-for-api';
import pickPrimaryTag from 'lib/post-normalizer/rule-pick-primary-tag';
import preventWidows from 'lib/post-normalizer/rule-prevent-widows';
import safeImageProperties from 'lib/post-normalizer/rule-safe-image-properties';
import stripHtml from 'lib/post-normalizer/rule-strip-html';
import withContentDom from 'lib/post-normalizer/rule-with-content-dom';
import keepValidImages from 'lib/post-normalizer/rule-keep-valid-images';
import waitForImagesToLoad from 'lib/post-normalizer/rule-wait-for-images-to-load';
import pickCanonicalMedia from 'lib/post-normalizer/rule-pick-canonical-media';
import removeElementsBySelector from 'lib/post-normalizer/rule-content-remove-elements-by-selector';
import addDiscoverProperties from 'lib/post-normalizer/rule-add-discover-properties';
import linkJetpackCarousels from 'lib/post-normalizer/rule-content-link-jetpack-carousels';
import makeLinksSafe from 'lib/post-normalizer/rule-make-links-safe';
import makeContentLinksSafe from 'lib/post-normalizer/rule-content-make-links-safe';

import {
	READER_CONTENT_WIDTH,
	PHOTO_ONLY_MIN_WIDTH,
	PHOTO_ONLY_MAX_CHARACTER_COUNT,
	GALLERY_MIN_IMAGES,
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

const hasShortContent = ( post ) => getCharacterCount( post ) <= PHOTO_ONLY_MAX_CHARACTER_COUNT;

/**
 * Attempt to classify the post into a display type
 *
 * @param  {object}   post     A post to classify
 * @returns {object}            The classified post
 */
export function classifyPost( post ) {
	const imagesForGallery = filter( post.content_images, imageIsBigEnoughForGallery );
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

const fastPostNormalizationRules = flow( [
	decodeEntities,
	stripHtml,
	preventWidows,
	makeSiteIdSafeForApi,
	pickPrimaryTag,
	safeImageProperties( READER_CONTENT_WIDTH ),
	makeLinksSafe,
	withContentDom( [
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
	] ),
	createBetterExcerpt,
	pickCanonicalImage,
	pickCanonicalMedia,
	classifyPost,
	addDiscoverProperties,
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
