//var debug = require( 'debug' )( 'calypso:reader:discover' );

// External dependencies
var find = require( 'lodash/collection/find' ),
	get = require( 'lodash/object/get' ),
	url = require( 'url' );

module.exports = {
	isDiscoverPost: function( post ) {
		return !! post.discover_metadata;
	},

	isDiscoverSitePick: function( post ) {
		return !! find( post.discover_metadata.discover_fp_post_formats, { slug: 'site-pick' } );
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
			return `/read/blog/id/${blogId}`;
		}

		return post.discover_metadata.permalink;
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
