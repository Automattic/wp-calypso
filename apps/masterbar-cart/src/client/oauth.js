import wpcom from 'wpcom';
import wpcomXhrRequest from 'wpcom-xhr-request';

const OAUTH_CLIENT_ID = 77214;
const OAUTH_REDIRECT_PATH = '/';

const getStoredToken = () => {
	try {
		const [ expiry, token ] = window.localStorage.getItem( 'auth' ).split( ':', 2 );

		const isExpired = Date.now() >= parseInt( expiry, 10 );
		return isExpired ? null : token;
	} catch ( e ) {
		return null;
	}
};

const storeToken = ( token, expiry ) => {
	try {
		window.localStorage.setItem( 'auth', `${ expiry }:${ token }` );
	} catch ( e ) {}
};

const getTokenInfoFromUrl = () => {
	const tokenPattern = /(?:[#&?]access_token=)([^&]+)/;
	const expiryPattern = /(?:[#&?]expires_in=)(\d+)/;

	const tokenMatch = tokenPattern.exec( document.location );
	if ( ! tokenMatch ) {
		return null;
	}

	const [ , rawToken ] = tokenMatch;
	const token = decodeURIComponent( rawToken );

	const expiryMatch = expiryPattern.exec( document.location );

	if ( ! expiryMatch ) {
		const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
		return {
			token,
			expiration: Date.now() + ONE_DAY_IN_MILLISECONDS,
		};
	}

	const [ , expiry ] = expiryMatch;
	return {
		token,
		expiration: Date.now() + expiry * 1000,
	};
};

const redirectForAuthorization = () => {
	const redirectUri = `${ window.location.origin }${ OAUTH_REDIRECT_PATH }`;

	const tokenInfo = getTokenInfoFromUrl();
	if ( ! tokenInfo ) {
		const baseUrl = 'https://public-api.wordpress.com/oauth2/authorize';
		const uri = `${ baseUrl }?client_id=${ OAUTH_CLIENT_ID }&redirect_uri=${ redirectUri }&response_type=token&scope=global`;

		window.location.replace( uri );
		return;
	}

	const { token, expiration } = tokenInfo;
	storeToken( token, expiration );
	window.location.replace( redirectUri );
	return;
};

const getRequestHandler = ( authToken ) => ( options, fn ) =>
	wpcomXhrRequest( { ...options, authToken }, fn );

const createOauthClient = async () => {
	const token = getStoredToken();
	if ( ! token ) {
		redirectForAuthorization();
		return null;
	}

	const requestHandler = getRequestHandler( token );
	return wpcom( token, requestHandler );
};

export default createOauthClient;
