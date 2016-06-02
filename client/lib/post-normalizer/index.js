/**
 * External Dependencies
 */
var async = require( 'async' ),
	debug = require( 'debug' )( 'calypso:post-normalizer' );
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

import decodeEntities from './rule-decode-entities';
normalizePost.decodeEntities = wrapSync( decodeEntities );

import stripHtml from './rule-strip-html';
normalizePost.stripHTML = wrapSync( stripHtml );

import preventWidows from './rule-prevent-widows';
normalizePost.preventWidows = wrapSync( preventWidows );

import firstPassCanonicalImage from './rule-first-pass-canonical-image';
normalizePost.firstPassCanonicalImage = wrapSync( firstPassCanonicalImage );

import makeSiteIDSafeForAPI from './rule-make-site-id-safe-for-api';
normalizePost.makeSiteIDSafeForAPI = wrapSync( makeSiteIDSafeForAPI );

import pickPrimaryTag from './rule-pick-primary-tag';
normalizePost.pickPrimaryTag = wrapSync( pickPrimaryTag );

import safeImageProperties from './rule-safe-image-properties';
normalizePost.safeImageProperties = function( maxWidth ) {
	return wrapSync( safeImageProperties( maxWidth ) );
};

import waitForImagesToLoad from './rule-wait-for-images-to-load';
normalizePost.waitForImagesToLoad = function waitForImagesToLoadAdapter( post, callback ) {
	waitForImagesToLoad( post ).then( () => {
		callback();
	}, err => {
		callback( err );
	} );
};

import keepValidImages from './rule-keep-valid-images';
normalizePost.keepValidImages = function( minWidth, minHeight ) {
	return wrapSync( keepValidImages( minWidth, minHeight ) );
};

import pickCanonicalImage from './rule-pick-canonical-image';
normalizePost.pickCanonicalImage = wrapSync( pickCanonicalImage );

import createBetterExcerpt from './rule-create-better-excerpt';
normalizePost.createBetterExcerpt = wrapSync( createBetterExcerpt );

import withContentDOM from './rule-with-content-dom';
normalizePost.withContentDOM = function( transforms ) {
	return function( post, callback ) {
		withContentDOM( transforms )( post );
		callback();
	};
};

import removeStyles from './rule-content-remove-styles';
import safeContentImages from './rule-content-safe-images';
import makeEmbedsSecure from './rule-content-make-embeds-secure';
import wordCountAndReadingTime from './rule-content-word-count';
import detectEmbeds from './rule-content-detect-embeds';
import { disableAutoPlayOnMedia, disableAutoPlayOnEmbeds } from './rule-content-disable-autoplay';
import detectPolls from './rule-content-detect-polls';

normalizePost.content = {
	removeStyles,
	safeContentImages,
	makeEmbedsSecure,
	wordCountAndReadingTime,
	detectEmbeds,
	disableAutoPlayOnMedia,
	disableAutoPlayOnEmbeds,
	detectPolls
};

module.exports = normalizePost;
