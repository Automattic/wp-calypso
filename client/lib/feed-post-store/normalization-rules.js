/**
 * External Dependencies
 */
const find = require( 'lodash/find' ),
	forEach = require( 'lodash/forEach' ),
	url = require( 'url' ),
	matches = require( 'lodash/matches' ),
	toArray = require( 'lodash/toArray' );

/**
 * Internal Dependencies
 */
const postNormalizer = require( 'lib/post-normalizer' ),
	resizeImageUrl = require( 'lib/resize-image-url' ),
	DISPLAY_TYPES = require( './display-types' );

/**
 * Module vars
 */
const READER_CONTENT_WIDTH = 720,
	DISCOVER_FULL_BLEED_WIDTH = 1082,
	PHOTO_ONLY_MIN_WIDTH = READER_CONTENT_WIDTH * 0.8,
	ONE_LINER_THRESHOLD = ( 20 * 10 ), // roughly 10 lines of words
	DISCOVER_BLOG_ID = 53424024;

const fastPostNormalizationRules = [
		postNormalizer.decodeEntities,
		postNormalizer.stripHTML,
		postNormalizer.preventWidows,
		postNormalizer.makeSiteIDSafeForAPI,
		postNormalizer.pickPrimaryTag,
		postNormalizer.safeImageProperties( READER_CONTENT_WIDTH ),
		postNormalizer.firstPassCanonicalImage,
		postNormalizer.withContentDOM( [
			postNormalizer.content.removeStyles,
			postNormalizer.content.safeContentImages( READER_CONTENT_WIDTH ),
			discoverFullBleedImages,
			postNormalizer.content.makeEmbedsSecure,
			postNormalizer.content.disableAutoPlayOnEmbeds,
			postNormalizer.content.disableAutoPlayOnMedia,
			postNormalizer.content.detectEmbeds,
			postNormalizer.content.detectPolls,
			postNormalizer.content.wordCountAndReadingTime
		] ),
		postNormalizer.createBetterExcerpt,
		classifyPost
	],
	slowPostNormalizationRules = [
		postNormalizer.waitForImagesToLoad,
		postNormalizer.keepValidImages( 144, 72 ),
		postNormalizer.pickCanonicalImage,
		classifyPost
	];

function discoverFullBleedImages( post, callback ) {
	if ( post.site_ID === DISCOVER_BLOG_ID ) {
		const images = toArray( post.__contentDOM.querySelectorAll( '.fullbleed img, img.fullbleed' ) );
		forEach( images, function( image ) {
			const newSrc = resizeImageUrl( image.src, { w: DISCOVER_FULL_BLEED_WIDTH } );
			let oldImageObject = find( post.content_images, { src: image.src } );
			oldImageObject.src = newSrc;
			image.src = newSrc;
		} );
	}
	callback();
}

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
