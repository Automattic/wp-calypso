/** @format */
/**
 * External dependencies
 */
import url from 'url';
import i18n from 'i18n-calypso';
import moment from 'moment-timezone';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import postNormalizer from 'lib/post-normalizer';

const MINUTE_IN_MS = 60 * 1000;

export function getEditURL( post, site ) {
	let basePath = '';

	if ( ! includes( [ 'post', 'page' ], post.type ) ) {
		basePath = '/edit';
	}

	return `${ basePath }/${ post.type }/${ site.slug }/${ post.ID }`;
}

export function getPreviewURL( site, post ) {
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
}

export function userCan( capability, post ) {
	const hasCap = post.capabilities && post.capabilities[ capability ];

	return capability === 'edit_post' ? hasCap && post.status !== 'trash' : hasCap;
}

export function isPublished( post ) {
	return (
		post &&
		( post.status === 'publish' || post.status === 'private' || this.isBackDatedPublished( post ) )
	);
}

export function isPrivate( post ) {
	return post && 'private' === post.status;
}

export function isPending( post ) {
	return post && 'pending' === post.status;
}

export function getEditedTime( post ) {
	if ( ! post ) {
		return;
	}

	return post.status === 'publish' || post.status === 'future' ? post.date : post.modified;
}

export function isBackDatedPublished( post ) {
	return ! post || post.status !== 'future' ? false : moment( post.date ).isBefore( moment() );
}

export function isFutureDated( post ) {
	return ! post ? false : post && +new Date() + MINUTE_IN_MS < +new Date( post.date );
}

export function isBackDated( post ) {
	return ! post || ! post.date || ! post.modified
		? false
		: moment( post.date ).isBefore( moment( post.modified ) );
}

export function isPage( post ) {
	return ! post ? false : post && 'page' === post.type;
}

export function normalizeSync( post, callback ) {
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
}

export function getVisibility( post ) {
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
}

export function normalizeAsync( post, callback ) {
	postNormalizer( post, [ postNormalizer.keepValidImages( 72, 72 ) ], callback );
}

export function getPermalinkBasePath( post ) {
	if ( ! post ) {
		return;
	}

	let path = post.URL;

	// if we have a permalink_URL, utlize that
	if ( ! this.isPublished( post ) && post.other_URLs && post.other_URLs.permalink_URL ) {
		path = post.other_URLs.permalink_URL;
	}

	return this.removeSlug( path );
}

export function getPagePath( post ) {
	if ( ! post ) {
		return;
	}
	if ( ! this.isPublished( post ) ) {
		return this.getPermalinkBasePath( post );
	}

	return this.removeSlug( post.URL );
}

export function removeSlug( path ) {
	if ( ! path ) {
		return;
	}

	const pathParts = path.slice( 0, -1 ).split( '/' );
	pathParts[ pathParts.length - 1 ] = '';

	return pathParts.join( '/' );
}

/**
 * Returns the ID of the featured image assigned to the specified post, or
 * `undefined` otherwise. A utility function is useful because the format
 * of a post varies between the retrieve and update endpoints. When
 * retrieving a post, the thumbnail ID is assigned in `post_thumbnail`, but
 * in creating a post, the thumbnail ID is assigned to `featured_image`.
 *
 * @param  {Object} post Post object
 * @return {Number}      The featured image ID
 */
export function getFeaturedImageId( post ) {
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
}

/**
 * Return date with timezone offset.
 * If `date` is not defined it returns `now`.
 *
 * @param {String|Date} date - date
 * @param {String} tz - timezone
 * @return {Moment} moment instance
 */
export function getOffsetDate( date, tz ) {
	return ! tz ? i18n.moment( date ) : i18n.moment( moment.tz( date, tz ) );
}
