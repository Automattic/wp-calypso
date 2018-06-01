/** @format */

/**
 * External dependencies
 */

import { find } from 'lodash';

/**
 * Module variables
 */
let REGEXP_PUBLICIZE_SERVICE_SKIPPED = /^_wpas_skip_(\d+)$/,
	REGEXP_PUBLICIZE_SERVICE_DONE = /^_wpas_done_(\d+)$/,
	PostMetadata;

function getValueByKey( metadata, key ) {
	const meta = find( metadata, { key: key } );

	if ( meta ) {
		return meta.value;
	}
}

function getConnectionIdsByPattern( metadata, pattern ) {
	if ( ! metadata ) {
		return [];
	}

	return metadata
		.filter( function( meta ) {
			return pattern.test( meta.key ) && 1 === parseInt( meta.value, 10 );
		} )
		.map( function( meta ) {
			return parseInt( meta.key.match( pattern )[ 1 ], 10 );
		} );
}

PostMetadata = {
	/**
	 * Given a post object, returns the Publicize custom message assigned to
	 * that post, or `undefined` if the value cannot be determined.
	 *
	 * @param  {Object} post Post object
	 * @return {string}      Publicize custom message
	 */
	publicizeMessage: function( post ) {
		if ( ! post ) {
			return;
		}

		return getValueByKey( post.metadata, '_wpas_mess' );
	},

	/**
	 * Given a post object, returns an array of Publicize service IDs to which
	 * the post has been successfully Publicized, or `undefined` if the value
	 * cannot be determined.
	 *
	 * @param  {Object} post Post object
	 * @return {Array}       Array of Publicize service IDs
	 */
	publicizeDone: function( post ) {
		if ( ! post ) {
			return;
		}

		return getConnectionIdsByPattern( post.metadata, REGEXP_PUBLICIZE_SERVICE_DONE );
	},

	/**
	 * Given a post object, returns an array of Publicize service IDs for which
	 * the user has chosen not to have the post Publicized, or `undefined` if
	 * the value cannot be determined.
	 *
	 * @param  {Object} post Post object
	 * @return {Array}       Array of Publicize service IDs
	 */
	publicizeSkipped: function( post ) {
		if ( ! post ) {
			return;
		}

		return getConnectionIdsByPattern( post.metadata, REGEXP_PUBLICIZE_SERVICE_SKIPPED );
	},

	/**
	 * Given a post object, returns a human-readable address label representing
	 * the geographic location saved for that post, or `undefined` if the value
	 * cannot be determined.
	 *
	 * @param  {Object} post Post object
	 * @return {string}      Human-readable geographic address label
	 */
	geoLabel: function( post ) {
		if ( ! post ) {
			return;
		}

		return getValueByKey( post.metadata, 'geo_address' );
	},

	/**
	 * Given a post object, returns the custom post meta description for
	 * the post, or undefined if it is has not been set.
	 *
	 * @param  {Object} post Post object
	 * @return {string}      Custom post meta description
	 */
	metaDescription: function( post ) {
		if ( ! post ) {
			return;
		}

		return getValueByKey( post.metadata, 'advanced_seo_description' );
	},

	/**
	 * Given a post object, returns an array of float coordinates representing
	 * the geographic location saved for that post, or `undefined` if the value
	 * cannot be determined.
	 *
	 * @param  {Object} post Post object
	 * @return {string}      Array of geographic float coordinates
	 */
	geoCoordinates: function( post ) {
		let latitude, longitude;

		if ( ! post ) {
			return;
		}

		latitude = parseFloat( getValueByKey( post.metadata, 'geo_latitude' ) );
		longitude = parseFloat( getValueByKey( post.metadata, 'geo_longitude' ) );

		if ( latitude && longitude ) {
			return [ latitude, longitude ];
		}
	},

	/**
	 * Given a post object, return either "public" or "private", indicating whether
	 * the geo-location data associated with the post is allowed to be displayed
	 * publicly.
	 *
	 * @param {Object} post Post object
	 * @returns {boolean} Whether the geo-location data is shared publicly.
	 */
	geoIsSharedPublicly: function( post ) {
		if ( ! post ) {
			return true;
		}

		const isSharedPublicly = getValueByKey( post.metadata, 'geo_public' );

		if ( parseInt( isSharedPublicly, 10 ) ) {
			return true;
		}

		if ( undefined === isSharedPublicly ) {
			// If they have no geo_public value but they do have a lat/long, then we assume they saved with Calypso
			// before it supported geo_public, in which case we should treat it as private.
			if (
				getValueByKey( post.metadata, 'geo_latitude' ) ||
				getValueByKey( post.metadata, 'geo_longitude' )
			) {
				return false;
			}

			return true;
		}

		return false;
	},
};

export default PostMetadata;
