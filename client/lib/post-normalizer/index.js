/**
 * External dependencies
 */
import async from 'async';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import detectMedia from './rule-content-detect-media';
import detectPolls from './rule-content-detect-polls';
import { disableAutoPlayOnMedia, disableAutoPlayOnEmbeds } from './rule-content-disable-autoplay';
import makeEmbedsSafe from './rule-content-make-embeds-safe';
import makeImagesSafe from './rule-content-make-images-safe';
import removeElementsBySelector from './rule-content-remove-elements-by-selector';
import removeStyles from './rule-content-remove-styles';
import createBetterExcerpt from './rule-create-better-excerpt';
import decodeEntities from './rule-decode-entities';
import keepValidImages from './rule-keep-valid-images';
import makeSiteIDSafeForAPI from './rule-make-site-id-safe-for-api';
import pickCanonicalImage from './rule-pick-canonical-image';
import pickPrimaryTag from './rule-pick-primary-tag';
import preventWidows from './rule-prevent-widows';
import safeImageProperties from './rule-safe-image-properties';
import stripHtml from './rule-strip-html';
import waitForImagesToLoad from './rule-wait-for-images-to-load';
import withContentDOM from './rule-with-content-dom';
const debug = debugFactory( 'calypso:post-normalizer' );
/**
 * Internal dependencies
 */

function debugForPost( post ) {
	return function( msg ) {
		debug( post.global_ID + ': ' + msg );
	};
}

/**
 * Asynchronously normalizes an object shaped like a post. Works on a copy of the post and does not mutate the original post.
 * @param  {object} post A post shaped object, generally returned by the API
 * @param {array} transforms An array of transforms to perform. Each transformation should be a function
 * that takes a post and a node-style callback. It should mutate the post and call the callback when complete.
 * @param {function} callback A node-style callback, invoked when the transformation is complete, or when the first error occurs.
 * If successful, the callback is invoked with `(null, theMutatedPost)`
 */
function normalizePost( post, transforms, callback ) {
	if ( ! callback ) {
		throw new Error( 'must supply a callback' );
	}
	if ( ! post || ! transforms ) {
		debug( 'no post or no transform' );
		callback( null, post );
		return;
	}

	let normalizedPost = Object.assign( {}, post ),
		postDebug = debugForPost( post );

	postDebug( 'running transforms' );

	async.eachSeries(
		transforms, function( transform, transformCallback ) {
			postDebug( 'running transform ' + ( transform.name || 'anonymous' ) );
			transform( normalizedPost, transformCallback );
		}, function( err ) {
			postDebug( 'transforms complete' );
			if ( err ) {
				callback( err );
			} else {
				callback( null, normalizedPost );
			}
		}
	);
}

function wrapSync( fn ) {
	return function wrapped( post, callback ) {
		fn( post );
		callback();
	};
}

normalizePost.decodeEntities = wrapSync( decodeEntities );

normalizePost.stripHTML = wrapSync( stripHtml );

normalizePost.preventWidows = wrapSync( preventWidows );

normalizePost.pickCanonicalImage = wrapSync( pickCanonicalImage );

normalizePost.makeSiteIDSafeForAPI = wrapSync( makeSiteIDSafeForAPI );

normalizePost.pickPrimaryTag = wrapSync( pickPrimaryTag );

normalizePost.safeImageProperties = function( maxWidth ) {
	return wrapSync( safeImageProperties( maxWidth ) );
};

normalizePost.waitForImagesToLoad = function waitForImagesToLoadAdapter( post, callback ) {
	waitForImagesToLoad( post ).then( () => {
		callback();
	}, err => {
		callback( err );
	} );
};

normalizePost.keepValidImages = function( minWidth, minHeight ) {
	return wrapSync( keepValidImages( minWidth, minHeight ) );
};

normalizePost.createBetterExcerpt = wrapSync( createBetterExcerpt );

normalizePost.withContentDOM = function( transforms ) {
	return function( post, callback ) {
		withContentDOM( transforms )( post );
		callback();
	};
};

normalizePost.content = {
	removeStyles,
	removeElementsBySelector,
	makeImagesSafe,
	makeEmbedsSafe,
	detectMedia,
	disableAutoPlayOnMedia,
	disableAutoPlayOnEmbeds,
	detectPolls
};

export default normalizePost;
