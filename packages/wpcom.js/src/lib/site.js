import debugFactory from 'debug';
import siteGetMethods from './runtime/site.get';
import Category from './site.category';
import Comment from './site.comment';
import SiteDomain from './site.domain';
import Follow from './site.follow';
import Media from './site.media';
import SitePlugin from './site.plugin';
import Post from './site.post';
import SitePostType from './site.post-type';
import SiteSettings from './site.settings';
import Tag from './site.tag';
import SiteTaxonomy from './site.taxonomy';
import SiteWordAds from './site.wordads';
import SiteWPComPlugin from './site.wpcom-plugin';
import runtimeBuilder from './util/runtime-builder';

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
	 * @param {string} id - site id
	 * @param wpcom - wpcom instance
	 * @returns {null} null
	 */
	constructor( id, wpcom ) {
		if ( ! ( this instanceof Site ) ) {
			return new Site( id, wpcom );
		}

		this.wpcom = wpcom;

		debug( 'set %o site id', id );
		this._id = encodeURIComponent( id );
		this.path = `${ root }/${ this._id }`;
	}

	/**
	 * Require site information
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	get( query, fn ) {
		return this.wpcom.req.get( this.path, query, fn );
	}

	/**
	 * Create a `Post` instance
	 * @param {string} id - post id
	 * @returns {Post} Post instance
	 */
	post( id ) {
		return new Post( id, this._id, this.wpcom );
	}

	/**
	 * Add a new blog post
	 * @param {Object} body - body object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	addPost( body, fn ) {
		const post = new Post( null, this._id, this.wpcom );
		return post.add( body, fn );
	}

	/**
	 * Delete a blog post
	 * @param {string} id - post id
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	deletePost( id, fn ) {
		const post = new Post( id, this._id, this.wpcom );
		return post.delete( fn );
	}

	/**
	 * Create a `Media` instance
	 * @param {string} id - post id
	 * @returns {Media} Media instance
	 */
	media( id ) {
		return new Media( id, this._id, this.wpcom );
	}

	/**
	 * Add a media from a file
	 * @param {Object} [query] - query object parameter
	 * @param {Array|string} files - media files to add
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	addMediaFiles( query, files, fn ) {
		const media = new Media( null, this._id, this.wpcom );
		return media.addFiles( query, files, fn );
	}

	/**
	 * Add a new media from url
	 * @param {Object} [query] - query object parameter
	 * @param {Array|string} files - media files to add
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	addMediaUrls( query, files, fn ) {
		const media = new Media( null, this._id, this.wpcom );
		return media.addUrls( query, files, fn );
	}

	/**
	 * Delete a blog media
	 * @param {string} id - media id
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	deleteMedia( id, fn ) {
		const media = new Media( id, this._id, this.wpcom );
		return media.del( fn );
	}

	/**
	 * Create a `Comment` instance
	 * @param {string} id - comment id
	 * @returns {Comment} Comment instance
	 */
	comment( id ) {
		return new Comment( id, null, this._id, this.wpcom );
	}

	/**
	 * Create a `Follow` instance
	 * @returns {Follow} Follow instance
	 */
	follow() {
		return new Follow( this._id, this.wpcom );
	}

	/**
	 * Create a `SitePlugin` instance
	 * @param {string} slug - plugin identifier
	 * @returns {SitePlugin} SitePlugin instance
	 */
	plugin( slug ) {
		return new SitePlugin( slug, this._id, this.wpcom );
	}

	/**
	 * Create a `SiteWPComPlugin` instance
	 * @param {string} slug - plugin identifier
	 * @returns {SiteWPComPlugin} SiteWPComPlugin instance
	 */
	wpcomPlugin( slug ) {
		return new SiteWPComPlugin( slug, this._id, this.wpcom );
	}

	/**
	 * Create a `Category` instance
	 * Set `cat` alias
	 * @param {string} [slug] - category slug
	 * @returns {Category} Category instance
	 */
	category( slug ) {
		return new Category( slug, this._id, this.wpcom );
	}

	/**
	 * Create a `Tag` instance
	 * @param {string} [slug] - tag slug
	 * @returns {Tag} Tag instance
	 */
	tag( slug ) {
		return new Tag( slug, this._id, this.wpcom );
	}

	/**
	 * Create a `Taxonomy` instance
	 * @param {string} [slug] - taxonomy slug
	 * @returns {SiteTaxonomy} SiteTaxonomy instance
	 */
	taxonomy( slug ) {
		return new SiteTaxonomy( slug, this._id, this.wpcom );
	}

	/**
	 * Create a `SitePostType` instance
	 * @param {string} [slug] - post type slug
	 * @returns {SitePostType} SitePostType instance
	 */
	postType( slug ) {
		return new SitePostType( slug, this._id, this.wpcom );
	}

	/**
	 * Create a `SiteSettings` instance
	 * @returns {SiteSettings} SiteSettings instance
	 */
	settings() {
		return new SiteSettings( this._id, this.wpcom );
	}

	/**
	 * Create a `SiteDomain` instance
	 * @returns {SiteDomain} SiteDomain instance
	 */
	domain() {
		return new SiteDomain( this._id, this.wpcom );
	}

	/**
	 * Get number of posts in the post type groups by post status
	 *
	 * Example:*
	 * // Get number post of pages
	 * wpcom
	 * .site( 'my-blog.wordpress.com' )
	 * .postCounts( 'page', function( err, data ) {
	 * // `counts` data object
	 * } );
	 * @param {string} type - post type
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	postCounts( type = 'post', query, fn ) {
		if ( 'function' === typeof query ) {
			fn = query;
			query = {};
		}

		return this.wpcom.req.get( `${ this.path }/post-counts/${ type }`, query, fn );
	}

	/**
	 * Get a rendered shortcode for a site.
	 *
	 * Note: The current user must have publishing access.
	 * @param {string} url - shortcode url
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	renderShortcode( url, query, fn ) {
		if ( 'string' !== typeof url ) {
			throw new TypeError( 'expected a url String' );
		}

		if ( 'function' === typeof query ) {
			fn = query;
			query = {};
		}

		query = query || {};
		query.shortcode = url;

		return this.wpcom.req.get( `${ this.path }/shortcodes/render`, query, fn );
	}

	/**
	 * Get a rendered embed for a site.
	 *
	 * Note: The current user must have publishing access.
	 * @param {string} url - embed url
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	renderEmbed( url, query, fn ) {
		if ( 'string' !== typeof url ) {
			throw new TypeError( 'expected an embed String' );
		}

		if ( 'function' === typeof query ) {
			fn = query;
			query = {};
		}

		query = query || {};
		query.embed_url = url;

		return this.wpcom.req.get( `${ this.path }/embeds/render`, query, fn );
	}

	/**
	 * Mark a referrering domain as spam
	 * @param {string} domain - domain
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	statsReferrersSpamNew( domain, fn ) {
		const path = `${ this.path }/stats/referrers/spam/new`;
		return this.wpcom.req.post( path, { domain }, null, fn );
	}

	/**
	 * Remove referrering domain from spam
	 * @param {string} domain - domain
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	statsReferrersSpamDelete( domain, fn ) {
		const path = `${ this.path }/stats/referrers/spam/delete`;
		return this.wpcom.req.post( path, { domain }, null, fn );
	}

	/**
	 * Get detailed stats about a VideoPress video
	 * @param {string} videoId - video id
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	statsVideo( videoId, query, fn ) {
		const path = `${ this.path }/stats/video/${ videoId }`;

		if ( 'function' === typeof query ) {
			fn = query;
			query = {};
		}

		return this.wpcom.req.get( path, query, fn );
	}

	/**
	 * Get detailed stats about a particular post
	 * @param {string} postId - post id
	 * @param {Object} [query] - query object parameter
	 * @param {Function} fn - callback function
	 * @returns {Function} request handler
	 */
	statsPostViews( postId, query, fn ) {
		const path = `${ this.path }/stats/post/${ postId }`;

		if ( 'function' === typeof query ) {
			fn = query;
			query = {};
		}

		return this.wpcom.req.get( path, query, fn );
	}

	/**
	 * Get detailed stats about a specific email and period
	 * This fetches the timeline, according to the query passed
	 * @param {string} postId - id of the post which email we are querying
	 * @param  {string} statType The type of stat we are working with. For example: 'opens' for Email Open stats
	 * @param {Object} [query] - query object parameter
	 * @param {Function?} fn - callback function
	 * @returns {Function} request handler
	 */
	emailStatsForPeriod( postId, statType, query, fn ) {
		const path = `${ this.path }/stats/${ statType }/emails/${ postId }`;
		const statFields = [ 'timeline' ];
		return Promise.all(
			statFields.map( ( field ) =>
				this.wpcom.req.get( path, { ...query, stats_fields: field }, fn )
			)
		).then( ( statsArray ) =>
			statsArray.reduce( ( result, item ) => {
				return { ...result, ...item };
			}, {} )
		);
	}

	/**
	 * Get detailed all time stats about a specific email and period
	 * This fetchesthe clients, devices & countries
	 * @param {string} postId - id of the post which email we are querying
	 * @param  {string} statType The type of stat we are working with. For example: 'opens' for Email Open stats
	 * @param {Function?} fn - callback function
	 * @returns {Function} request handler
	 */
	emailStatsAlltime( postId, statType, fn ) {
		const basePath = `${ this.path }/stats/${ statType }/emails/${ postId }`;
		const statFields = [ 'client', 'device', 'country', 'rate' ];
		if ( statType === 'clicks' ) {
			statFields.push( 'link' );
			statFields.push( 'user-content-link' );
		}
		return Promise.all(
			statFields.map( ( field ) => this.wpcom.req.get( `${ basePath }/${ field }`, fn ) )
		).then( ( statsArray ) =>
			statsArray.reduce( ( result, item ) => {
				return { ...result, ...item };
			}, {} )
		);
	}

	/**
	 * Return a `SiteWordAds` instance.
	 *
	 * Example:*
	 * // Create a SiteWordAds instance
	 *
	 * const wordAds = wpcom
	 * .site( 'my-blog.wordpress.com' )
	 * .wordAds();
	 * @returns {SiteWordAds} SiteWordAds instance
	 */
	wordAds() {
		return new SiteWordAds( this._id, this.wpcom );
	}
}

// add methods in runtime
runtimeBuilder( Site, siteGetMethods, ( methodParams, ctx ) => {
	return `/sites/${ ctx._id }/${ methodParams.subpath }`;
} );

export default Site;
