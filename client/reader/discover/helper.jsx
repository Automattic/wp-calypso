//var debug = require( 'debug' )( 'calypso:reader:discover' );

// External dependencies
var find = require( 'lodash/find' ),
	get = require( 'lodash/get' ),
	url = require( 'url' ),
	config = require( 'config' );

/**
 * Internal Dependencies
 */
var userUtils = require( 'lib/user/utils' ),
	readerRoute = require( 'reader/route' );

module.exports = {
	isEnabled: function() {
		return userUtils.getLocaleSlug() === 'en';
	},

	isDiscoverPost: function( post ) {
		return post && !! ( post.discover_metadata || post.site_ID === config( 'discover_blog_id' ) );
	},

	isDiscoverSitePick: function( post ) {
		return post && !! ( post.discover_metadata && find( post.discover_metadata.discover_fp_post_formats, { slug: 'site-pick' } ) );
	},

	isInternalDiscoverPost: function( post ) {
		const featured_post_wpcom_data = get( post, 'discover_metadata.featured_post_wpcom_data' );
		return !! featured_post_wpcom_data;
	},

	getSiteUrl: function( post ) {
		if ( ! get( post, 'discover_metadata' ) ) {
			return false;
		}

		// If we have a blog ID, we want to send them to the site detail page
		const blogId = get( post, 'discover_metadata.featured_post_wpcom_data.blog_id' );
		if ( blogId ) {
			return readerRoute.getSiteUrl( blogId );
		}

		return post.discover_metadata.permalink;
	},

	hasSource( post ) {
		return post && this.isDiscoverPost( post ) && ! this.isDiscoverSitePick( post );
	},

	getSourceData: function( post ) {
		if ( ! this.hasSource( post ) ) {
			return null;
		}

		const data = get( post, 'discover_metadata.featured_post_wpcom_data' );

		if ( ! data ) {
			return null;
		}

		return {
			blogId: data.blog_id,
			postId: data.post_id
		};
	},

	// Given an external or internal URL, return the relevant link props for an <a> tag
	getLinkProps: function( linkUrl ) {
		let parsedUrl = url.parse( linkUrl );
		const isExternal = ( parsedUrl.hostname && ( parsedUrl.hostname !== window.location.hostname ) );
		return {
			rel: isExternal ? 'external' : '',
			target: isExternal ? '_blank' : ''
		};
	}
};
