/**
 * External dependencies
 */
import config from '@automattic/calypso-config';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import { decodeEntities } from 'calypso/lib/formatting/decode-entities';
import { getLanguage } from 'calypso/lib/i18n-utils/utils';
import {
	isSupportUserSession,
	isSupportNextSession,
	supportUserBoot,
	supportNextBoot,
} from 'calypso/lib/user/support-user-interop';
import { withoutHttp } from 'calypso/lib/url';

function getSiteSlug( url ) {
	const slug = withoutHttp( url );
	return slug.replace( /\//g, '::' );
}

const allowedKeys = [
	'ID',
	'display_name',
	'username',
	'avatar_URL',
	'site_count',
	'jetpack_site_count',
	'visible_site_count',
	'jetpack_visible_site_count',
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
	'lasagna_jwt',
	'i18n_empathy_mode',
	'use_fallback_for_incomplete_languages',
];
const requiredKeys = [ 'ID' ];
const decodedKeys = [ 'display_name', 'description', 'user_URL' ];

export function filterUserObject( obj ) {
	if ( typeof obj !== 'object' ) {
		throw new Error( 'the /me response is not an object' );
	}

	for ( const key of requiredKeys ) {
		if ( ! obj.hasOwnProperty( key ) ) {
			throw new Error( `the /me response misses a required field '${ key }'` );
		}
	}

	const user = {};
	for ( const key of allowedKeys ) {
		const value = obj[ key ];
		user[ key ] = value && decodedKeys.includes( key ) ? decodeEntities( value ) : value;
	}

	return Object.assign( user, getComputedAttributes( obj ) );
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

export function getLogoutUrl( userData, redirect ) {
	let url;
	let subdomain = '';

	// If logout_URL isn't set, then go ahead and return the logout URL
	// without a proper nonce as a fallback.
	// Note: we never want to use logout_URL in the desktop app
	if ( ! userData?.logout_URL || config.isEnabled( 'always_use_logout_url' ) ) {
		// Use localized version of the homepage in the redirect
		if ( userData?.localeSlug && userData.localeSlug !== '' && userData.localeSlug !== 'en' ) {
			subdomain = userData.localeSlug + '.';
		}

		url = config( 'logout_url' ).replace( '|subdomain|', subdomain );
	} else {
		url = userData.logout_URL;
	}

	if ( 'string' === typeof redirect ) {
		redirect = '&redirect_to=' + encodeURIComponent( redirect );
		url += redirect;
	}

	return url;
}

export function rawCurrentUserFetch() {
	return wpcom.me().get( {
		meta: 'flags',
	} );
}

export async function initializeCurrentUser() {
	let skipBootstrap = false;

	if ( isSupportUserSession() ) {
		// boot the support session and skip the user bootstrap: the server sent the unwanted
		// user info there (me) instead of the target SU user.
		supportUserBoot();
		skipBootstrap = true;
	}

	if ( isSupportNextSession() ) {
		// boot the support session and proceed with user bootstrap (unlike the SupportUserSession,
		// the initial GET request includes the right cookies and header and returns a server-generated
		// page with the right window.currentUser value)
		supportNextBoot();
	}

	if ( ! skipBootstrap && config.isEnabled( 'wpcom-user-bootstrap' ) ) {
		if ( window.currentUser ) {
			return window.currentUser;
		}
		return false;
	}

	let userData;
	try {
		userData = await rawCurrentUserFetch();
	} catch ( error ) {
		if ( error.error !== 'authorization_required' ) {
			// eslint-disable-next-line no-console
			console.error( 'Failed to fetch the user from /me endpoint:', error );
		}
	}

	if ( ! userData ) {
		return false;
	}

	return filterUserObject( userData );
}
