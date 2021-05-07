/**
 * External dependencies
 */

import { find } from 'lodash';
import { getThemeIdFromStylesheet } from 'calypso/state/themes/utils';

/**
 * Module variables
 */
const REGEXP_PUBLICIZE_SERVICE_SKIPPED = /^_wpas_skip_(\d+)$/;

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
		.filter( function ( meta ) {
			return pattern.test( meta.key ) && 1 === parseInt( meta.value, 10 );
		} )
		.map( function ( meta ) {
			return parseInt( meta.key.match( pattern )[ 1 ], 10 );
		} );
}

const PostMetadata = {
	/**
	 * Given a post object, returns the Publicize custom message assigned to
	 * that post, or `undefined` if the value cannot be determined.
	 *
	 * @param  {object} post Post object
	 * @returns {string}      Publicize custom message
	 */
	publicizeMessage: function ( post ) {
		if ( ! post ) {
			return;
		}

		return getValueByKey( post.metadata, '_wpas_mess' );
	},

	/**
	 * Given a post object, returns an array of Publicize service IDs for which
	 * the user has chosen not to have the post Publicized, or `undefined` if
	 * the value cannot be determined.
	 *
	 * @param  {object} post Post object
	 * @returns {Array}       Array of Publicize service IDs
	 */
	publicizeSkipped: function ( post ) {
		if ( ! post ) {
			return;
		}

		return getConnectionIdsByPattern( post.metadata, REGEXP_PUBLICIZE_SERVICE_SKIPPED );
	},

	/**
	 * Given a post object, returns the theme id of a template-first theme, or `undefined` if the value
	 * cannot be determined.
	 *
	 * @param  {object} post Post object
	 * @returns {string|undefined} ThemeId on success.
	 */
	homepageTemplate: function ( post ) {
		if ( ! post ) {
			return;
		}

		return getThemeIdFromStylesheet( getValueByKey( post.metadata, '_tft_homepage_template' ) );
	},

	/**
	 * Given a post object, returns the custom post meta description for
	 * the post, or undefined if it is has not been set.
	 *
	 * @param  {object} post Post object
	 * @returns {string}      Custom post meta description
	 */
	metaDescription: function ( post ) {
		if ( ! post ) {
			return;
		}

		return getValueByKey( post.metadata, 'advanced_seo_description' );
	},
};

export default PostMetadata;
