import config from '@automattic/calypso-config';
import debugFactory from 'debug';
import store from 'store';
import Connect from './connect';
import type { Callback, Context } from '@automattic/calypso-router';

const WP_AUTHORIZE_ENDPOINT = 'https://public-api.wordpress.com/oauth2/authorize';
const debug = debugFactory( 'calypso:a8c-for-agencies-connect' );

const DEFAULT_NEXT_LOCATION = '/';

export const connect: Callback = ( context, next ) => {
	if ( config.isEnabled( 'oauth' ) && config( 'oauth_client_id' ) ) {
		const redirectUri = new URL( '/connect/oauth/token', window.location.origin );

		const authUrl = new URL( WP_AUTHORIZE_ENDPOINT );
		authUrl.search = new URLSearchParams( {
			response_type: 'token',
			client_id: config( 'oauth_client_id' ),
			redirect_uri: redirectUri.toString(),
			scope: 'global',
		} ).toString();

		debug( `authUrl: ${ authUrl }` );

		window.location.replace( authUrl.toString() );
	} else {
		context.primary = <p>Oauth un-enabled or client id missing!</p>;
	}
	next();
};

// The type of `Context.hash` is `string`, but here it is being used as
// an object. Assuming the types are wrong, here we override them to fix TS
// errors until the types can be corrected.
type OverriddenPageContext = Context & { hash?: Record< string, string > };

export const tokenRedirect: Callback = ( ctx, next ) => {
	const context = ctx as OverriddenPageContext;
	// We didn't get an auth token; take a step back
	// and ask for authorization from the user again
	if ( context.hash?.error ) {
		context.primary = <Connect authUrl="/connect/oauth/token" />;
		return next();
	}

	if ( context.hash?.access_token ) {
		debug( 'setting user token' );
		store.set( 'wpcom_token', context.hash.access_token );
	}

	if ( context.hash?.expires_in ) {
		debug( 'setting user token_expires_in' );
		store.set( 'wpcom_token_expires_in', context.hash.expires_in );
	}

	try {
		const nextUrl = new URL(
			context?.query.next ?? DEFAULT_NEXT_LOCATION,
			new URL( window.location.origin )
		);
		document.location.replace(
			nextUrl.host === window.location.host ? nextUrl.toString() : DEFAULT_NEXT_LOCATION
		);
	} catch ( error ) {
		// if something is fundamentally wrong with context.query.next we just go to root.
		document.location.replace( DEFAULT_NEXT_LOCATION );
	}
};

export const logIn: Callback = () => {
	debug( 'log in' );
	document.location.replace( DEFAULT_NEXT_LOCATION );
};
