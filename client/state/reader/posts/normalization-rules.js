/**
 * External Dependencies
 */
import find from 'lodash/find';
import flow from 'lodash/flow';
import forEach from 'lodash/forEach';
import url from 'url';
import matches from 'lodash/matches';

/**
 * Internal Dependencies
 */
import resizeImageUrl from 'lib/resize-image-url';
import DISPLAY_TYPES from './display-types';

/**
 * Rules
 */
import createBetterExcerpt from 'lib/post-normalizer/rule-create-better-excerpt';
import detectEmbeds from 'lib/post-normalizer/rule-content-detect-embeds';
import detectPolls from 'lib/post-normalizer/rule-content-detect-polls';
import makeEmbedsSecure from 'lib/post-normalizer/rule-content-make-embeds-secure';
import removeStyles from 'lib/post-normalizer/rule-content-remove-styles';
import safeImages from 'lib/post-normalizer/rule-content-safe-images';
import wordCount from 'lib/post-normalizer/rule-content-word-count';
import { disableAutoPlayOnMedia, disableAutoPlayOnEmbeds } from 'lib/post-normalizer/rule-content-disable-autoplay';
import decodeEntities from 'lib/post-normalizer/rule-decode-entities';
import firstPassCanonicalImage from 'lib/post-normalizer/rule-first-pass-canonical-image';
import makeSiteIdSafeForApi from 'lib/post-normalizer/rule-make-site-id-safe-for-api';
import pickPrimaryTag from 'lib/post-normalizer/rule-pick-primary-tag';
import preventWidows from 'lib/post-normalizer/rule-prevent-widows';
import safeImageProperties from 'lib/post-normalizer/rule-safe-image-properties';
import stripHtml from 'lib/post-normalizer/rule-strip-html';
import withContentDom from 'lib/post-normalizer/rule-with-content-dom';
import keepValidImages from 'lib/post-normalizer/rule-keep-valid-images';
import pickCanonicalImage from 'lib/post-normalizer/rule-pick-canonical-image';
import waitForImagesToLoad from 'lib/post-normalizer/rule-wait-for-images-to-load';

/**
 * Module vars
 */
const READER_CONTENT_WIDTH = 720,
	DISCOVER_FULL_BLEED_WIDTH = 1082,
	PHOTO_ONLY_MIN_WIDTH = READER_CONTENT_WIDTH * 0.8,
	DISCOVER_BLOG_ID = 53424024;

function discoverFullBleedImages( post, dom ) {
	if ( post.site_ID === DISCOVER_BLOG_ID ) {
		const images = dom.querySelectorAll( '.fullbleed img, img.fullbleed' );
		forEach( images, function( image ) {
			const newSrc = resizeImageUrl( image.src, { w: DISCOVER_FULL_BLEED_WIDTH } );
			const oldImageObject = find( post.content_images, { src: image.src } );
			oldImageObject.src = newSrc;
			image.src = newSrc;
		} );
	}
	return post;
}

/**
 * Attempt to classify the post into a display type
 * @param  {object}   post     A post to classify
 * @return {object}            The classified post
 */
function classifyPost( post ) {
	const canonicalImage = post.canonical_image;
	let displayType = DISPLAY_TYPES.UNCLASSIFIED,
		canonicalAspect;

	if ( post.images &&
			post.images.length >= 1 &&
			canonicalImage && canonicalImage.width >= PHOTO_ONLY_MIN_WIDTH &&
			post.word_count < 100 ) {
		displayType ^= DISPLAY_TYPES.PHOTO_ONLY;
	}

	if ( canonicalImage ) {
		if ( canonicalImage.width >= 600 ) {
			displayType ^= DISPLAY_TYPES.LARGE_BANNER;
		}

		if ( canonicalImage.height && canonicalImage.width ) {
			canonicalAspect = canonicalImage.width / canonicalImage.height;

			if ( canonicalAspect >= 2 && canonicalImage.width >= 600 ) {
				displayType ^= DISPLAY_TYPES.LANDSCAPE_BANNER;
			} else if ( canonicalAspect < 1 && canonicalImage.height > 160 ) {
				displayType ^= DISPLAY_TYPES.PORTRAIT_BANNER;
			} else if ( canonicalAspect > 0.7 && canonicalAspect < 1.3 && canonicalImage.width < 200 ) {
				displayType ^= DISPLAY_TYPES.THUMBNAIL;
			}
		}

		const canonicalImageUrl = url.parse( canonicalImage.uri, true, true ),
			canonicalImageUrlImportantParts = {
				hostname: canonicalImageUrl.hostname,
				pathname: canonicalImageUrl.pathname,
				query: canonicalImageUrl.query
			},
			matcher = matches( canonicalImageUrlImportantParts );
		if ( find( post.content_images, ( img ) => {
			const imgUrl = url.parse( img.src, true, true );
			return matcher( imgUrl );
		} ) ) {
			displayType ^= DISPLAY_TYPES.CANONICAL_IN_CONTENT;
		}
	}

	if ( post.content_embeds && post.content_embeds.length >= 1 ) {
		if ( ! canonicalImage || post.content_embeds.length === 1 ) {
			displayType ^= DISPLAY_TYPES.FEATURED_VIDEO;
		}
	}

	if ( post.content_images && post.content_images.length > 2 ) {
		displayType ^= DISPLAY_TYPES.GALLERY;
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
	firstPassCanonicalImage,
	withContentDom( [
		removeStyles,
		safeImages( READER_CONTENT_WIDTH ),
		discoverFullBleedImages,
		makeEmbedsSecure,
		disableAutoPlayOnEmbeds,
		disableAutoPlayOnMedia,
		detectEmbeds,
		detectPolls,
		wordCount
	] ),
	createBetterExcerpt,
	classifyPost
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
	keepValidImages( 144, 72 ),
	pickCanonicalImage,
	classifyPost
] );

export function runSlowRules( post ) {
	post = Object.assign( {}, post );
	return waitForImagesToLoad( post ).then( slowSyncRules );
}
