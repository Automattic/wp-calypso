/** @format */

/**
 * External dependencies
 */

import url from 'url';
import { moment } from 'i18n-calypso';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import postNormalizer from 'lib/post-normalizer';

export const getEditURL = function( post, site ) {
	let basePath = '';

	if ( ! includes( [ 'post', 'page' ], post.type ) ) {
		basePath = '/edit';
	}

	return `${ basePath }/${ post.type }/${ site.slug }/${ post.ID }`;
};

export const getPreviewURL = function( site, post ) {
	let parsed, previewUrl;

	if ( ! post || ! post.URL || post.status === 'trash' ) {
		return '';
	}

	if ( post.preview_URL ) {
		previewUrl = post.preview_URL;
	} else if ( post.status === 'publish' ) {
		previewUrl = post.URL;
	} else {
		parsed = url.parse( post.URL, true );
		parsed.query.preview = 'true';
		delete parsed.search;
		previewUrl = url.format( parsed );
	}

	if ( post.site_ID ) {
		if ( ! ( site && site.options ) ) {
			// site info is still loading, just use what we already have until it does
			return previewUrl;
		}
		if ( site.options.is_mapped_domain ) {
			previewUrl = previewUrl.replace( site.URL, site.options.unmapped_url );
		}
		if ( site.options.frame_nonce ) {
			parsed = url.parse( previewUrl, true );
			parsed.query[ 'frame-nonce' ] = site.options.frame_nonce;
			delete parsed.search;
			previewUrl = url.format( parsed );
		}
	}

	return previewUrl;
};

export const userCan = function( capability, post ) {
	const hasCap = post.capabilities && post.capabilities[ capability ];

	if ( capability === 'edit_post' ) {
		return hasCap && post.status !== 'trash';
	}

	return hasCap;
};

export const isBackDatedPublished = function( post ) {
	if ( ! post || post.status !== 'future' ) {
		return false;
	}

	return moment( post.date ).isBefore( moment() );
};

export const isPublished = function( post ) {
	return (
		post &&
		( post.status === 'publish' || post.status === 'private' || isBackDatedPublished( post ) )
	);
};

export const isPrivate = function( post ) {
	return post && 'private' === post.status;
};

export const isPending = function( post ) {
	return post && 'pending' === post.status;
};

export const getEditedTime = function( post ) {
	if ( ! post ) {
		return;
	}

	if ( post.status === 'publish' || post.status === 'future' ) {
		return post.date;
	}

	return post.modified;
};

export const isFutureDated = function( post ) {
	if ( ! post ) {
		return false;
	}

	const oneMinute = 1000 * 60;

	return post && +new Date() + oneMinute < +new Date( post.date );
};

export const isBackDated = function( post ) {
	if ( ! post || ! post.date || ! post.modified ) {
		return false;
	}

	return moment( post.date ).isBefore( moment( post.modified ) );
};

export const isPage = function( post ) {
	if ( ! post ) {
		return false;
	}

	return post && 'page' === post.type;
};

export const normalizeSync = function( post, callback ) {
	const imageWidth = 653;
	postNormalizer(
		post,
		[
			postNormalizer.decodeEntities,
			postNormalizer.stripHTML,
			postNormalizer.safeImageProperties( imageWidth ),
			postNormalizer.withContentDOM( [
				postNormalizer.content.removeStyles,
				postNormalizer.content.makeImagesSafe( imageWidth ),
				postNormalizer.content.detectMedia,
			] ),
			postNormalizer.pickCanonicalImage,
		],
		callback
	);
};

export const getVisibility = function( post ) {
	if ( ! post ) {
		return;
	}

	if ( post.password ) {
		return 'password';
	}

	if ( 'private' === post.status ) {
		return 'private';
	}

	return 'public';
};

export const normalizeAsync = function( post, callback ) {
	postNormalizer( post, [ postNormalizer.keepValidImages( 72, 72 ) ], callback );
};

export const removeSlug = function( path ) {
	if ( ! path ) {
		return;
	}

	const pathParts = path.slice( 0, -1 ).split( '/' );
	pathParts[ pathParts.length - 1 ] = '';

	return pathParts.join( '/' );
};

export const getPermalinkBasePath = function( post ) {
	if ( ! post ) {
		return;
	}

	let path = post.URL;

	// if we have a permalink_URL, utlize that
	if ( ! isPublished( post ) && post.other_URLs && post.other_URLs.permalink_URL ) {
		path = post.other_URLs.permalink_URL;
	}

	return removeSlug( path );
};

export const getPagePath = function( post ) {
	if ( ! post ) {
		return;
	}
	if ( ! isPublished( post ) ) {
		return getPermalinkBasePath( post );
	}

	return removeSlug( post.URL );
};

/**
 * Returns the ID of the featured image assigned to the specified post, or
 * `undefined` otherwise. A utility function is useful because the format
 * of a post varies between the retrieve and update endpoints. When
 * retrieving a post, the thumbnail ID is assigned in `post_thumbnail`, but
 * in creating a post, the thumbnail ID is assigned to `featured_image`.
 *
 * @param  {Object} post Post object
 * @returns {*} featured image id or undefined
 */
export const getFeaturedImageId = function( post ) {
	if ( ! post ) {
		return;
	}

	if ( 'featured_image' in post && ! /^https?:\/\//.test( post.featured_image ) ) {
		// Return the `featured_image` property if it does not appear to be
		// formatted as a URL
		return post.featured_image;
	}

	if ( post.post_thumbnail ) {
		// After the initial load from the REST API, pull the numeric ID
		// from the thumbnail object if one exists
		return post.post_thumbnail.ID;
	}
};

/**
 * Return date with timezone offset.
 * If `date` is not defined it returns `now`.
 *
 * @param {String|Date} date - date
 * @param {String} tz - timezone
 * @return {Moment} moment instance
 */
export const getOffsetDate = function( date, tz ) {
	if ( ! tz ) {
		return moment( date );
	}

	return moment( moment.tz( date, tz ) );
};
