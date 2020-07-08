/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import HandleEmailedLinkForm from './magic-login/handle-emailed-link-form';
import MagicLogin from './magic-login';
import WPLogin from './wp-login';
import { getUrlParts } from 'lib/url';
import { fetchOAuth2ClientData } from 'state/oauth2-clients/actions';
import { getCurrentUser, getCurrentUserLocale } from 'state/current-user/selectors';
import GUTENBOARDING_BASE_NAME from 'landing/gutenboarding/basename.json';

const enhanceContextWithLogin = ( context ) => {
	const {
		params: { flow, isJetpack, isGutenboarding, socialService, twoFactorAuthType },
		path,
		query,
	} = context;

	const previousHash = context.state || {};
	const { client_id, user_email, user_name, id_token, state } = previousHash;
	const socialServiceResponse = client_id
		? { client_id, user_email, user_name, id_token, state }
		: null;

	context.primary = (
		<WPLogin
			isJetpack={ isJetpack === 'jetpack' }
			isGutenboarding={ isGutenboarding === GUTENBOARDING_BASE_NAME }
			path={ path }
			twoFactorAuthType={ twoFactorAuthType }
			socialService={ socialService }
			socialServiceResponse={ socialServiceResponse }
			socialConnect={ flow === 'social-connect' }
			privateSite={ flow === 'private-site' }
			domain={ ( query && query.domain ) || null }
			fromSite={ ( query && query.site ) || null }
			signupUrl={ ( query && query.signup_url ) || null }
		/>
	);
};

export async function login( context, next ) {
	const {
		query: { client_id, redirect_to },
	} = context;

	// Remove id_token from the address bar and push social connect args into the state instead
	if ( context.hash && context.hash.client_id ) {
		page.replace( context.path, context.hash );

		return;
	}

	if ( client_id ) {
		if ( ! redirect_to ) {
			const error = new Error( 'The `redirect_to` query parameter is missing.' );
			error.status = 401;
			return next( error );
		}

		const { searchParams: redirectParams } = getUrlParts( redirect_to );

		if ( client_id !== redirectParams.get( 'client_id' ) ) {
			const error = new Error(
				'The `redirect_to` query parameter is invalid with the given `client_id`.'
			);
			error.status = 401;
			return next( error );
		}

		try {
			await context.store.dispatch( fetchOAuth2ClientData( client_id ) );
		} catch ( error ) {
			return next( error );
		}
	}

	enhanceContextWithLogin( context );

	next();
}

export function magicLogin( context, next ) {
	const { path } = context;

	context.primary = <MagicLogin path={ path } />;

	next();
}

export function magicLoginUse( context, next ) {
	/**
	 * Pull the query arguments out of the URL & into the state.
	 * It unclutters the address bar & will keep tokens out of tracking pixels.
	 */
	if ( context.querystring ) {
		page.replace( context.pathname, context.query );

		return;
	}

	const previousQuery = context.state || {};

	const { client_id, email, token } = previousQuery;

	context.primary = (
		<HandleEmailedLinkForm clientId={ client_id } emailAddress={ email } token={ token } />
	);

	next();
}

export function redirectDefaultLocale( context, next ) {
	// Only handle simple routes
	if ( context.pathname !== '/log-in/en' && context.pathname !== '/log-in/jetpack/en' ) {
		return next();
	}

	// Do not redirect if user bootrapping is disabled
	if (
		! getCurrentUser( context.store.getState() ) &&
		! config.isEnabled( 'wpcom-user-bootstrap' )
	) {
		return next();
	}

	// Do not redirect if user is logged in and the locale is different than english
	// so we force the page to display in english
	const currentUserLocale = getCurrentUserLocale( context.store.getState() );
	if ( currentUserLocale && currentUserLocale !== 'en' ) {
		return next();
	}

	if ( context.params.isJetpack === 'jetpack' ) {
		context.redirect( '/log-in/jetpack' );
	} else {
		context.redirect( '/log-in' );
	}
}

export function redirectJetpack( context, next ) {
	const { isJetpack } = context.params;
	const { redirect_to } = context.query;

	/**
	 * Send arrivals from the jetpack connect process (when site user email matches
	 * a wpcom account) to the jetpack branded login.
	 *
	 * A direct redirect to /log-in/jetpack is not currently done at jetpack.wordpress.com
	 * because the iOS app relies on seeing a request to /log-in$ to show its
	 * native credentials form.
	 */
	if ( isJetpack !== 'jetpack' && includes( redirect_to, 'jetpack/connect' ) ) {
		return context.redirect( context.path.replace( 'log-in', 'log-in/jetpack' ) );
	}
	next();
}
