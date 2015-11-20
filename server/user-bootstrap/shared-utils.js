/**
 * External dependencies
 */
var assign = require( 'lodash/object/assign' );

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	languages = config( 'languages' );

function getLanguage( slug ) {
	var len = languages.length,
		language,
		index;

	for ( index = 0; index < len; index++ ) {
		if ( slug === languages[ index ].langSlug ) {
			language = languages[ index ];
			break;
		}
	}

	return language;
}

function getSiteSlug( url ) {
	var slug = url.replace( /^https?:\/\//, '' );
	return slug.replace( /\//g, '::' );
}

module.exports = {
	filterUserObject: function( obj ) {
		var user = {},
			allowedKeys = [
				'ID',
				'display_name',
				'username',
				'avatar_URL',
				'site_count',
				'visible_site_count',
				'date',
				'has_unseen_notes',
				'newest_note_type',
				'phone_account',
				'email',
				'email_verified',
				'is_valid_google_apps_country',
				'logout_URL',
				'primary_blog_url',
				'meta',
			];

		allowedKeys.forEach( function( key ) {
			user[ key ] = obj[ key ];
		} );

		return assign( user, this.getComputedAttributes( obj ) );
	},

	getComputedAttributes: function( attributes ) {
		var language = getLanguage( attributes.language ),
			primayBlogUrl = attributes.primary_blog_url || '';
		return {
			primarySiteSlug: getSiteSlug( primayBlogUrl ),
			localeSlug: attributes.language,
			isRTL: !! ( language && language.rtl )
		};
	}

};
