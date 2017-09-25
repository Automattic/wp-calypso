/**
 * External dependencies
 */
import { assign, includes } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import { decodeEntities } from 'lib/formatting';
import { withoutHttp } from 'lib/url';

/**
 * Module variables
 */
const languages = config( 'languages' );

function getLanguage( slug ) {
	let len = languages.length,
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
	const slug = withoutHttp( url );
	return slug.replace( /\//g, '::' );
}

export default {
	filterUserObject: function( obj ) {
		let user = {},
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
				'user_ip_country_code',
				'logout_URL',
				'primary_blog',
				'primary_blog_url',
				'meta',
				'is_new_reader',
				'social_signup_service',
			],
			decodeWhitelist = [
				'display_name',
				'description',
				'user_URL'
			];

		allowedKeys.forEach( function( key ) {
			user[ key ] = obj[ key ] && includes( decodeWhitelist, key )
				? decodeEntities( obj[ key ] )
				: obj[ key ];
		} );

		return assign( user, this.getComputedAttributes( obj ) );
	},

	getComputedAttributes: function( attributes ) {
		let language = getLanguage( attributes.language ),
			primayBlogUrl = attributes.primary_blog_url || '';
		return {
			primarySiteSlug: getSiteSlug( primayBlogUrl ),
			localeSlug: attributes.language,
			isRTL: !! ( language && language.rtl )
		};
	}

};
