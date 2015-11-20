/**
 * External Dependecies
 */
var find = require( 'lodash/collection/find' );

/**
 * Internal Dependencies
 */
var postNormalizer = require( 'lib/post-normalizer' ),
	DISPLAY_TYPES = require( './display-types' );

/**
 * Module vars
 */
var READER_CONTENT_WIDTH = 653, // 68% of our 960 fixed width. Might need to bump if / when we go fluid.
	PHOTO_ONLY_MIN_WIDTH = READER_CONTENT_WIDTH * 0.8,
	ONE_LINER_THRESHOLD = ( 20 * 10 ); // roughly 10 lines of words

var fastPostNormalizationRules = [
		postNormalizer.decodeEntities,
		postNormalizer.stripHTML,
		postNormalizer.preventWidows,
		postNormalizer.makeSiteIDSafeForAPI,
		postNormalizer.pickPrimaryTag,
		postNormalizer.firstPassCanonicalImage,
		postNormalizer.safeImageProperties( READER_CONTENT_WIDTH ),
		postNormalizer.withContentDOM( [
			postNormalizer.content.removeStyles,
			postNormalizer.content.safeContentImages( READER_CONTENT_WIDTH ),
			postNormalizer.content.makeEmbedsSecure,
			postNormalizer.content.disableAutoPlayOnEmbeds,
			postNormalizer.content.detectEmbeds,
			postNormalizer.content.wordCountAndReadingTime
		] ),
		classifyPost
	],
	slowPostNormalizationRules = [
		postNormalizer.waitForImagesToLoad,
		postNormalizer.keepValidImages( 144, 72 ),
		postNormalizer.pickCanonicalImage,
		classifyPost
	];

/**
 * Attempt to classify the post into a display type
 * @param  {object}   post     A post to classify
 * @param  {Function} callback A callback to invoke when we're done
 */
function classifyPost( post, callback ) {
	var displayType = DISPLAY_TYPES.UNCLASSIFIED,
		canonicalImage = post.canonical_image,
		canonicalAspect;

	if ( post.images && post.images.length === 1 && post.images[0].naturalWidth >= PHOTO_ONLY_MIN_WIDTH && post.word_count < 100 ) {
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

		if ( find( post.content_images, { src: canonicalImage.uri } ) ) {
			displayType ^= DISPLAY_TYPES.CANONICAL_IN_CONTENT;
		}
	}

	if ( post.content_embeds && post.content_embeds.length >= 1 ) {
		if ( ! canonicalImage || post.content_embeds.length === 1 ) {
			displayType ^= DISPLAY_TYPES.FEATURED_VIDEO;
		}
	}

	if ( post.word_count <= ONE_LINER_THRESHOLD &&
			( ! post.content_images || post.content_images.length === 0 ) &&
			( ! post.content_embeds || post.content_embeds.length === 0 ) ) {
		displayType ^= DISPLAY_TYPES.ONE_LINER;
	}

	if ( post.content_images && post.content_images.length > 2 ) {
		displayType ^= DISPLAY_TYPES.GALLERY;
	}

	if ( post.tags && post.tags[ 'p2-xpost' ] ) {
		displayType ^= DISPLAY_TYPES.X_POST;
	}

	post.display_type = displayType;

	callback();
}

module.exports = {
	fastRules: fastPostNormalizationRules,
	slowRules: slowPostNormalizationRules
};
