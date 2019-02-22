/** @format */

/**
 * External dependencies
 */

import { assign, includes } from 'lodash';

/**
 * Internal dependencies
 */
import { decodeEntities } from 'lib/formatting';
import { getLanguage } from 'lib/i18n-utils/utils';
import { withoutHttp } from 'lib/url';

function getSiteSlug( url ) {
	const slug = withoutHttp( url );
	return slug.replace( /\//g, '::' );
}

export function filterUserObject( obj ) {
	const user = {};
	const allowedKeys = [
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
		'primary_blog_is_jetpack',
		'primary_blog_url',
		'meta',
		'is_new_reader',
		'social_login_connections',
		'abtests',
	];
	const decodeWhitelist = [ 'display_name', 'description', 'user_URL' ];

	allowedKeys.forEach( function( key ) {
		user[ key ] =
			obj[ key ] && includes( decodeWhitelist, key ) ? decodeEntities( obj[ key ] ) : obj[ key ];
	} );

	return assign( user, getComputedAttributes( obj ) );
}

export function getComputedAttributes( attributes ) {
	const language = getLanguage( attributes.language );
	const primaryBlogUrl = attributes.primary_blog_url || '';
	return {
		primarySiteSlug: getSiteSlug( primaryBlogUrl ),
		localeSlug: attributes.language,
		localeVariant: attributes.locale_variant,
		isRTL: !! ( language && language.rtl ),
	};
}
