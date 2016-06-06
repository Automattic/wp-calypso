/**
 * Module dependencies.
 */
import Category from './site.category';
import Comment from './site.comment';
import Follow from './site.follow';
import Media from './site.media';
import Post from './site.post';
import Tag from './site.tag';
import SitePostType from './site.post-type';
import SiteDomain from './site.domain';
import SitePlugin from './site.plugin';
import SiteSettings from './site.settings';
import SiteTaxonomy from './site.taxonomy';
import SiteCreditVouchers from './site.credit-vouchers';
import SiteWordAds from './site.wordads';
import SiteWPComPlugin from './site.wpcom-plugin';

import siteGetMethods from './runtime/site.get';
import runtimeBuilder from './util/runtime-builder';
import debugFactory from 'debug';

/**
 * Module vars
 */
const debug = debugFactory( 'wpcom:site' );
const root = '/sites';

/**
 * Site class
 */
class Site {
	/**
	 * Create a Site instance
	 *
	 * @param {String} id - site id
	 * @param {WPCOM} wpcom - wpcom instance
	 * @return {Null} null
	 */
	constructor( id, wpcom ) {
		if ( ! ( this instanceof Site ) ) {
			return new Site( id, wpcom );
		}

		this.wpcom = wpcom;

		debug( 'set %o site id', id );
		this._id = encodeURIComponent( id );
		this.path = `${root}/${this._id}`;
	}

	/**
	 * Require site information
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	get( query, fn ) {
		return this.wpcom.req.get( this.path, query, fn );
	}

	/**
	 * Create a `Post` instance
	 *
	 * @param {String} id - post id
	 * @return {Post} Post instance
	 */
	post( id ) {
		return new Post( id, this._id, this.wpcom );
	}

	/**
	 * Add a new blog post
	 *
	 * @param {Object} body - body object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	addPost( body, fn ) {
		var post = new Post( null, this._id, this.wpcom );
		return post.add( body, fn );
	}

	/**
	 * Delete a blog post
	 *
	 * @param {String} id - post id
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	deletePost( id, fn ) {
		var post = new Post( id, this._id, this.wpcom );
		return post.delete( fn );
	}

	/**
	 * Create a `Media` instance
	 *
	 * @param {String} id - post id
	 * @return {Media} Media instance
	 */
	media( id ) {
		return new Media( id, this._id, this.wpcom );
	}

	/**
	 * Add a media from a file
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Array|String} files - media files to add
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	addMediaFiles( query, files, fn ) {
		var media = new Media( null, this._id, this.wpcom );
		return media.addFiles( query, files, fn );
	}

	/**
	 * Add a new media from url
	 *
	 * @param {Object} [query] - query object parameter
	 * @param {Array|String} files - media files to add
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	addMediaUrls( query, files, fn ) {
		var media = new Media( null, this._id, this.wpcom );
		return media.addUrls( query, files, fn );
	}

	/**
	 * Delete a blog media
	 *
	 * @param {String} id - media id
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	deleteMedia( id, fn ) {
		var media = new Media( id, this._id, this.wpcom );
		return media.del( fn );
	}

	/**
	 * Create a `Comment` instance
	 *
	 * @param {String} id - comment id
	 * @return {Comment} Comment instance
	 */
	comment( id ) {
		return new Comment( id, null, this._id, this.wpcom );
	}

	/**
	 * Create a `Follow` instance
	 *
	 * @return {Follow} Follow instance
	 */
	follow() {
		return new Follow( this._id, this.wpcom );
	}

	/**
	 * Create a `SitePlugin` instance
	 *
	 * @param {String} slug - plugin identifier
	 * @return {SitePlugin} SitePlugin instance
	 */
	plugin( slug ) {
		return new SitePlugin( slug, this._id, this.wpcom );
	}

	/**
	 * Create a `SiteWPComPlugin` instance
	 *
	 * @param {String} slug - plugin identifier
	 * @return {SiteWPComPlugin} SiteWPComPlugin instance
	 */
	wpcomPlugin( slug ) {
		return new SiteWPComPlugin( slug, this._id, this.wpcom );
	}

	/**
	 * Create a `Category` instance
	 * Set `cat` alias
	 *
	 * @param {String} [slug] - category slug
	 * @return {Category} Category instance
	 */
	category( slug ) {
		return new Category( slug, this._id, this.wpcom );
	}

	/**
	 * Create a `Tag` instance
	 *
	 * @param {String} [slug] - tag slug
	 * @return {Tag} Tag instance
	 */
	tag( slug ) {
		return new Tag( slug, this._id, this.wpcom );
	}

	/**
	 * Create a `Taxonomy` instance
	 *
	 * @param {String} [slug] - taxonomy slug
	 * @return {SiteTaxonomy} SiteTaxonomy instance
	 */
	taxonomy( slug ) {
		return new SiteTaxonomy( slug, this._id, this.wpcom );
	}

	/**
	 * Create a `SiteCreditVouchers` instance
	 *
	 * @return {SiteCreditVouchers} SiteCreditVouchers instance
	 */
	creditVouchers() {
		return new SiteCreditVouchers( this._id, this.wpcom );
	}

	/**
	 * Create a `SitePostType` instance
	 *
	 * @param {String} [slug] - post type slug
	 * @return {SitePostType} SitePostType instance
	 */
	postType( slug ) {
		return new SitePostType( slug, this._id, this.wpcom );
	}

	/**
	 * Create a `SiteSettings` instance
	 *
	 * @return {SiteSettings} SiteSettings instance
	 */
	settings() {
		return new SiteSettings( this._id, this.wpcom );
	}

	/**
	 * Create a `SiteDomain` instance
	 *
	 * @return {SiteDomain} SiteDomain instance
	 */
	domain() {
		return new SiteDomain( this._id, this.wpcom );
	}

	/**
	 * Get number of posts in the post type groups by post status
	 *
	 * *Example:*
	 *   // Get number post of pages
	 *    wpcom
	 *    .site( 'my-blog.wordpress.com' )
	 *    .postCounts( 'page', function( err, data ) {
	 *      // `counts` data object
	 *    } );
	 *
	 * @param {String} type - post type
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	postCounts( type = 'post', query, fn ) {
		if ( 'function' === typeof query ) {
			fn = query;
			query = {}
		}

		return this.wpcom.req.get( `${this.path}/post-counts/${type}`, query, fn );
	}

	/**
	 * Get a rendered shortcode for a site.
	 *
	 * Note: The current user must have publishing access.
	 *
	 * @param {String} url - shortcode url
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	renderShortcode( url, query, fn ) {
		if ( 'string' !== typeof url ) {
			throw new TypeError( 'expected a url String' );
		}

		if ( 'function' === typeof query ) {
			fn = query;
			query = {}
		}

		query = query || {}
		query.shortcode = url;

		return this.wpcom.req.get( `${this.path}/shortcodes/render`, query, fn );
	}

	/**
	 * Get a rendered embed for a site.
	 *
	 * Note: The current user must have publishing access.
	 *
	 * @param {String} url - embed url
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	renderEmbed( url, query, fn ) {
		if ( 'string' !== typeof url ) {
			throw new TypeError( 'expected an embed String' );
		}

		if ( 'function' === typeof query ) {
			fn = query;
			query = {}
		}

		query = query || {}
		query.embed_url = url;

		return this.wpcom.req.get( `${this.path}/embeds/render`, query, fn );
	}

	/**
	 * Mark a referrering domain as spam
	 *
	 * @param {String} domain - domain
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	statsReferrersSpamNew( domain, fn ) {
		var path = `${this.path}/stats/referrers/spam/new`;
		return this.wpcom.req.post( path, { domain }, null, fn );
	}

	/**
	 * Remove referrering domain from spam
	 *
	 * @param {String} domain - domain
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	statsReferrersSpamDelete( domain, fn ) {
		var path = `${this.path}/stats/referrers/spam/delete`;
		return this.wpcom.req.post( path, { domain }, null, fn );
	}

	/**
	 * Get detailed stats about a VideoPress video
	 *
	 * @param {String} videoId - video id
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	statsVideo( videoId, query, fn ) {
		var path = `${this.path}/stats/video/${videoId}`;

		if ( 'function' === typeof query ) {
			fn = query;
			query = {}
		}

		return this.wpcom.req.get( path, query, fn );
	}

	/**
	 * Get detailed stats about a particular post
	 *
	 * @param {String} postId - post id
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @return {Function} request handler
	 */
	statsPostViews( postId, query, fn ) {
		var path = `${this.path}/stats/post/${postId}`;

		if ( 'function' === typeof query ) {
			fn = query;
			query = {}
		}

		return this.wpcom.req.get( path, query, fn );
	}

	/**
	 * Return a `SiteWordAds` instance.
	 *
	 * *Example:*
	 *    // Create a SiteWordAds instance
	 *
	 *    var wordAds = wpcom
	 *      .site( 'my-blog.wordpress.com' )
	 *      .wordAds();
	 *
	 * @return {SiteWordAds} SiteWordAds instance
	 */
	wordAds() {
		return new SiteWordAds( this._id, this.wpcom );
	}
}

// add methods in runtime
runtimeBuilder( Site, siteGetMethods, ( methodParams, ctx ) => {
	return `/sites/${ctx._id}/${methodParams.subpath}`;
} );

export default Site;
