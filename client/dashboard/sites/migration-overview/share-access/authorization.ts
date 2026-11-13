import { isAllowedRedirectUrl } from '@automattic/calypso-url';

type Attempt = {
	state: string;
	siteId: number;
	source: string;
	authorizationUrl: string;
	expiresAt: number;
};

const storageKey = 'msd-migration-authorization';
const shareAccessPath = /^\/sites\/[a-z\d.-]+\/migration-overview\/share-access\/?$/i;

let authorizationReturn: {
	path: string;
	params: URLSearchParams;
} | null = null;

export function captureMigrationAuthorization() {
	const { hash, pathname, search } = window.location;
	if ( ! shareAccessPath.test( pathname ) || ! hash.startsWith( '#migration-authorization=' ) ) {
		return;
	}

	// Keep the password out of the router and telemetry, including on failed callbacks.
	authorizationReturn = { path: pathname, params: new URLSearchParams( hash.slice( 1 ) ) };
	window.history.replaceState( window.history.state, '', pathname + search );
}

export function getMigrationAuthorizationUrl(
	siteId: number,
	source: string,
	authorizationUrl: string
): URL | null {
	if (
		! shareAccessPath.test( window.location.pathname ) ||
		! isAllowedRedirectUrl( authorizationUrl, [ new URL( source ).hostname ] )
	) {
		return null;
	}

	const state = window.crypto.randomUUID();
	const attempt: Attempt = {
		state,
		siteId,
		source,
		authorizationUrl,
		expiresAt: Date.now() + 30 * 60 * 1000,
	};
	const callback = new URL(
		window.location.pathname.replace( /\/$/, '' ) + '/authorize',
		window.location.origin
	);
	callback.searchParams.set( 'state', state );
	const url = new URL( authorizationUrl );
	callback.searchParams.set( 'success', 'false' );
	url.searchParams.set( 'reject_url', callback.href );
	callback.searchParams.delete( 'success' );
	// WordPress appends credentials to the URL. Its JS flow can return them in the fragment.
	callback.hash = 'migration-authorization=' + state;
	url.searchParams.set( 'success_url', callback.href );
	window.sessionStorage.setItem( storageKey, JSON.stringify( attempt ) );
	return url;
}

export function takeMigrationAuthorization( siteId: number ) {
	const result = authorizationReturn;
	if ( ! result || result.path !== window.location.pathname ) {
		return null;
	}
	authorizationReturn = null;
	const attempt = readAttempt();
	if (
		! attempt ||
		attempt.siteId !== siteId ||
		attempt.state !== result.params.get( 'migration-authorization' ) ||
		attempt.expiresAt < Date.now()
	) {
		return null;
	}
	window.sessionStorage.removeItem( storageKey );
	const username = result.params.get( 'user_login' );
	const password = result.params.get( 'password' )?.replaceAll( ' ', '' );
	const formattedPassword =
		password && /^[a-z\d]{24}$/i.test( password ) ? password.match( /.{4}/g )?.join( ' ' ) : null;
	return {
		source: attempt.source,
		authorizationUrl: attempt.authorizationUrl,
		credentials: username && formattedPassword ? { username, password: formattedPassword } : null,
	};
}

function readAttempt(): Attempt | null {
	try {
		return JSON.parse( window.sessionStorage.getItem( storageKey ) ?? 'null' );
	} catch {
		return null;
	}
}
