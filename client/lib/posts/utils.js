/**
 * External dependecies
 */
import url from 'url';

import i18n from 'i18n-calypso';
import moment from 'moment-timezone';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import postNormalizer from 'lib/post-normalizer';

import sitesFactory from 'lib/sites-list';
const sites = sitesFactory();

import { getFeaturedImageId } from './utils-ssr-ready';

const utils = {

	getFeaturedImageId,

	getEditURL: function( post, site ) {
		let basePath = '';

		if ( ! includes( [ 'post', 'page' ], post.type ) ) {
			basePath = '/edit';
		}

		return `${ basePath }/${ post.type }/${ site.slug }/${ post.ID }`;
	},

	getPreviewURL: function( post ) {
		let parsed, site, previewUrl;

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
			site = sites.getSite( post.site_ID );
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
	},

	userCan: function( capability, post ) {
		const hasCap = post.capabilities && post.capabilities[ capability ];

		if ( capability === 'edit_post' ) {
			return hasCap && post.status !== 'trash';
		}

		return hasCap;
	},

	isPublished: function( post ) {
		return post && ( post.status === 'publish' || post.status === 'private' || this.isBackDatedPublished( post ) );
	},

	isPrivate: function( post ) {
		return post && ( 'private' === post.status );
	},

	isPending: function( post ) {
		return post && ( 'pending' === post.status );
	},

	getEditedTime: function( post ) {
		if ( ! post ) {
			return;
		}

		if ( post.status === 'publish' || post.status === 'future' ) {
			return post.date;
		}

		return post.modified;
	},

	isBackDatedPublished: function( post ) {
		if ( ! post || post.status !== 'future' ) {
			return false;
		}

		return moment( post.date ).isBefore( moment() );
	},

	isFutureDated: function( post ) {
		if ( ! post ) {
			return false;
		}

		const oneMinute = 1000 * 60;

		return post && ( +new Date() + oneMinute < +new Date( post.date ) );
	},

	isBackDated: function( post ) {
		if ( ! post || ! post.date || ! post.modified ) {
			return false;
		}

		return moment( post.date ).isBefore( moment( post.modified ) );
	},

	isPage: function( post ) {
		if ( ! post ) {
			return false;
		}

		return post && 'page' === post.type;
	},

	normalizeSync: function( post, callback ) {
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
	},

	getVisibility: function( post ) {
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
	},

	normalizeAsync: function( post, callback ) {
		postNormalizer(
			post,
			[
				postNormalizer.keepValidImages( 72, 72 )
			],
			callback
		);
	},

	getPermalinkBasePath: function( post ) {
		if ( ! post ) {
			return;
		}

		let path = post.URL;

		// if we have a permalink_URL, utlize that
		if ( ! this.isPublished( post ) && post.other_URLs && post.other_URLs.permalink_URL ) {
			path = post.other_URLs.permalink_URL;
		}

		return this.removeSlug( path );
	},

	getPagePath: function( post ) {
		if ( ! post ) {
			return;
		}
		if ( ! this.isPublished( post ) ) {
			return this.getPermalinkBasePath( post );
		}

		return this.removeSlug( post.URL );
	},

	removeSlug: function( path ) {
		if ( ! path ) {
			return;
		}

		const pathParts = path.slice( 0, -1 ).split( '/' );
		pathParts[ pathParts.length - 1 ] = '';

		return pathParts.join( '/' );
	},

	/**
	 * Return date with timezone offset.
	 * If `date` is not defined it returns `now`.
	 *
	 * @param {String|Date} date - date
	 * @param {String} tz - timezone
	 * @return {Moment} moment instance
	 */
	getOffsetDate: function( date, tz ) {
		if ( ! tz ) {
			return i18n.moment( date );
		}

		return i18n.moment( moment.tz( date, tz ) );
	}

};

module.exports = utils;
