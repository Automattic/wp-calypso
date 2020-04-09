/**
 * External dependencies
 */
import express from 'express';
import fs from 'fs';
import path from 'path';
import { stringify } from 'qs';
import crypto from 'crypto';
import { execSync } from 'child_process';
import cookieParser from 'cookie-parser';
import debugFactory from 'debug';
import {
	defaults,
	endsWith,
	get,
	includes,
	pick,
	flatten,
	groupBy,
	intersection,
	snakeCase,
	split,
} from 'lodash';
import bodyParser from 'body-parser';
// eslint-disable-next-line no-restricted-imports
import superagent from 'superagent'; // Don't have Node.js fetch lib yet.
import { matchesUA } from 'browserslist-useragent';

/**
 * Internal dependencies
 */
import config from 'config';
import sanitize from 'server/sanitize';
import utils from 'server/bundler/utils';
import { pathToRegExp } from 'utils';
import sections from 'sections';
import isSectionEnabled from 'sections-filter';
import loginRouter, { LOGIN_SECTION_DEFINITION } from 'login';
import { serverRouter, getNormalizedPath } from 'server/isomorphic-routing';
import {
	serverRender,
	renderJsx,
	attachBuildTimestamp,
	attachHead,
	attachI18n,
} from 'server/render';
import stateCache from 'server/state-cache';
import { createReduxStore } from 'state';
import { setStore } from 'state/redux-store';
import initialReducer from 'state/reducer';
import { DESERIALIZE, LOCALE_SET } from 'state/action-types';
import { setCurrentUser } from 'state/current-user/actions';
import { login } from 'lib/paths';
import { logSectionResponse } from './analytics';
import analytics from 'server/lib/analytics';
import { getLanguage, filterLanguageRevisions } from 'lib/i18n-utils';
import { isWooOAuth2Client } from 'lib/oauth2-clients';
import GUTENBOARDING_BASE_NAME from 'landing/gutenboarding/basename.json';
import { GUTENBOARDING_SECTION_DEFINITION } from 'landing/gutenboarding/section';

const debug = debugFactory( 'calypso:pages' );

const SERVER_BASE_PATH = '/public';
const calypsoEnv = config( 'env_id' );

const staticFiles = [ { path: 'editor.css' }, { path: 'tinymce/skins/wordpress/wp-content.css' } ];

const staticFilesUrls = staticFiles.reduce( ( result, file ) => {
	if ( ! file.hash ) {
		file.hash = utils.hashFile( process.cwd() + SERVER_BASE_PATH + '/' + file.path );
	}
	result[ file.path ] = utils.getUrl( file.path, file.hash );
	return result;
}, {} );

// List of browser languages to show pride styling for.
// Add a '*' element to show the styling for all visitors.
const prideLanguages = [];

// List of geolocated locations to show pride styling for.
// Geolocation may not be 100% accurate.
const prideLocations = [];

// TODO: Re-use (a modified version of) client/state/initial-state#getInitialServerState here
function getInitialServerState( serializedServerState ) {
	// Bootstrapped state from a server-render
	const serverState = initialReducer( serializedServerState, { type: DESERIALIZE } );
	return pick( serverState, Object.keys( serializedServerState ) );
}

/**
 * Checks whether a user agent is included in the browser list for an environment.
 *
 * @param {string} userAgentString The user agent string.
 * @param {string} environment The `browserslist` environment.
 *
 * @returns {boolean} Whether the user agent is included in the browser list.
 */
function isUAInBrowserslist( userAgentString, environment = 'defaults' ) {
	return matchesUA( userAgentString, {
		env: environment,
		ignorePatch: true,
		ignoreMinor: true,
		allowHigherVersions: true,
	} );
}

function getBuildTargetFromRequest( request ) {
	const isDevelopment = process.env.NODE_ENV === 'development';
	const isDesktop = calypsoEnv === 'desktop' || calypsoEnv === 'desktop-development';

	const devTarget = process.env.DEV_TARGET || 'evergreen';
	const uaTarget = isUAInBrowserslist( request.useragent.source, 'evergreen' )
		? 'evergreen'
		: 'fallback';

	// Did the user force fallback, via query parameter?
	const prodTarget = request.query.forceFallback ? 'fallback' : uaTarget;

	let target = isDevelopment ? devTarget : prodTarget;

	if ( isDesktop ) {
		target = 'fallback';
	}

	return target === 'fallback' ? null : target;
}

const ASSETS_PATH = path.join( __dirname, '../', 'bundler' );
function getAssetsPath( target ) {
	const result = path.join(
		ASSETS_PATH,
		target ? `assets-${ target }.json` : 'assets-fallback.json'
	);
	return result;
}

const cachedAssets = {};
const getAssets = target => {
	if ( ! cachedAssets[ target ] ) {
		cachedAssets[ target ] = JSON.parse( fs.readFileSync( getAssetsPath( target ), 'utf8' ) );
	}
	return cachedAssets[ target ];
};

const EMPTY_ASSETS = { js: [], 'css.ltr': [], 'css.rtl': [] };

const getAssetType = asset => {
	if ( asset.endsWith( '.rtl.css' ) ) {
		return 'css.rtl';
	}
	if ( asset.endsWith( '.css' ) ) {
		return 'css.ltr';
	}

	return 'js';
};

const groupAssetsByType = assets => defaults( groupBy( assets, getAssetType ), EMPTY_ASSETS );

const getFilesForChunk = ( chunkName, request ) => {
	const target = getBuildTargetFromRequest( request );

	const assets = getAssets( target );

	function getChunkByName( _chunkName ) {
		return assets.chunks.find( chunk => chunk.names.some( name => name === _chunkName ) );
	}

	function getChunkById( chunkId ) {
		return assets.chunks.find( chunk => chunk.id === chunkId );
	}

	const chunk = getChunkByName( chunkName );
	if ( ! chunk ) {
		console.warn( 'cannot find the chunk ' + chunkName );
		console.warn( 'available chunks:' );
		assets.chunks.forEach( c => {
			console.log( '    ' + c.id + ': ' + c.names.join( ',' ) );
		} );
		return EMPTY_ASSETS;
	}

	const allTheFiles = chunk.files.concat(
		flatten( chunk.siblings.map( sibling => getChunkById( sibling ).files ) )
	);

	return groupAssetsByType( allTheFiles );
};

const getFilesForEntrypoint = ( target, name ) => {
	const entrypointAssets = getAssets( target ).entrypoints[ name ].assets.filter(
		asset => ! asset.startsWith( 'manifest' )
	);
	return groupAssetsByType( entrypointAssets );
};

function getCurrentBranchName() {
	try {
		return execSync( 'git rev-parse --abbrev-ref HEAD' )
			.toString()
			.replace( /\s/gm, '' );
	} catch ( err ) {
		return undefined;
	}
}

function getCurrentCommitShortChecksum() {
	try {
		return execSync( 'git rev-parse --short HEAD' )
			.toString()
			.replace( /\s/gm, '' );
	} catch ( err ) {
		return undefined;
	}
}

/**
 * Given the content of an 'Accept-Language' request header, returns an array of the languages.
 *
 * This differs slightly from other language functions, as it doesn't try to validate the language codes,
 * or merge similar language codes.
 *
 * @param  {string} header - The content of the AcceptedLanguages header.
 * @returns {Array} An array of language codes in the header, all in lowercase.
 */
function getAcceptedLanguagesFromHeader( header ) {
	if ( ! header ) {
		return [];
	}

	return header
		.split( ',' )
		.map( lang => {
			const match = lang.match( /^[A-Z]{2,3}(-[A-Z]{2,3})?/i );
			if ( ! match ) {
				return false;
			}

			return match[ 0 ].toLowerCase();
		} )
		.filter( lang => lang );
}

/*
 * Look at the request headers and determine if the request is logged in or logged out or if
 * it's a support session. Set `req.context.isLoggedIn` and `req.context.isSupportSession` flags
 * accordingly. The handler is called very early (immediately after parsing the cookies) and
 * all following handlers (including the locale and redirect ones) can rely on the context values.
 */
function setupLoggedInContext( req, res, next ) {
	const isSupportSession = !! req.get( 'x-support-session' ) || !! req.cookies.support_session_id;
	const isLoggedIn = !! req.cookies.wordpress_logged_in;

	req.context = {
		...req.context,
		isSupportSession,
		isLoggedIn,
	};

	next();
}

function getDefaultContext( request, entrypoint = 'entry-main' ) {
	let initialServerState = {};
	let lang = config( 'i18n_default_locale_slug' );
	const bodyClasses = [];
	// We don't compare context.query against a whitelist here. Whitelists are route-specific,
	// i.e. they can be created by route-specific middleware. `getDefaultContext` is always
	// called before route-specific middleware, so it's up to the cache *writes* in server
	// render to make sure that Redux state and markup are only cached for whitelisted query args.
	const cacheKey = getNormalizedPath( request.path, request.query );
	const geoLocation = ( request.headers[ 'x-geoip-country-code' ] || '' ).toLowerCase();
	const devEnvironments = [ 'development', 'jetpack-cloud-development' ];
	const isDebug = devEnvironments.includes( calypsoEnv ) || request.query.debug !== undefined;

	if ( cacheKey ) {
		const serializeCachedServerState = stateCache.get( cacheKey ) || {};
		initialServerState = getInitialServerState( serializeCachedServerState );
	}

	// Note: The x-geoip-country-code header should *not* be considered 100% accurate.
	// It should only be used for guestimating the visitor's location.
	const acceptedLanguages = getAcceptedLanguagesFromHeader( request.headers[ 'accept-language' ] );
	if (
		prideLanguages.indexOf( '*' ) > -1 ||
		intersection( prideLanguages, acceptedLanguages ).length > 0 ||
		prideLocations.indexOf( '*' ) > -1 ||
		prideLocations.indexOf( geoLocation ) > -1
	) {
		bodyClasses.push( 'pride' );
	}

	// We assign request.context.lang in the handleLocaleSubdomains()
	// middleware function if we detect a language slug in subdomain
	if ( request.context && request.context.lang ) {
		lang = request.context.lang;
	}

	const target = getBuildTargetFromRequest( request );

	const oauthClientId = request.query.oauth2_client_id || request.query.client_id;
	const isWCComConnect =
		config.isEnabled( 'woocommerce/onboarding-oauth' ) &&
		( 'login' === request.context.sectionName || 'signup' === request.context.sectionName ) &&
		request.query[ 'wccom-from' ] &&
		isWooOAuth2Client( { id: parseInt( oauthClientId ) } );

	const reduxStore = createReduxStore( initialServerState );
	setStore( reduxStore );

	const flags = ( request.query.flags || '' ).split( ',' );
	const context = Object.assign( {}, request.context, {
		commitSha: process.env.hasOwnProperty( 'COMMIT_SHA' ) ? process.env.COMMIT_SHA : '(unknown)',
		compileDebug: process.env.NODE_ENV === 'development',
		user: false,
		env: calypsoEnv,
		sanitize: sanitize,
		isRTL: config( 'rtl' ),
		requestFrom: request.query.from,
		isWCComConnect,
		badge: false,
		lang,
		entrypoint: getFilesForEntrypoint( target, entrypoint ),
		manifest: getAssets( target ).manifests.manifest,
		faviconURL: config( 'favicon_url' ),
		abTestHelper: !! config.isEnabled( 'dev/test-helper' ),
		preferencesHelper: !! config.isEnabled( 'dev/preferences-helper' ),
		devDocsURL: '/devdocs',
		store: reduxStore,
		bodyClasses,
		addEvergreenCheck: target === 'evergreen' && calypsoEnv !== 'development',
		target: target || 'fallback',
		useTranslationChunks:
			config.isEnabled( 'use-translation-chunks' ) || flags.includes( 'use-translation-chunks' ),
	} );

	context.app = {
		// use ipv4 address when is ipv4 mapped address
		clientIp: request.ip ? request.ip.replace( '::ffff:', '' ) : request.ip,
		isDebug,
		staticUrls: staticFilesUrls,
	};

	if ( calypsoEnv === 'wpcalypso' ) {
		context.badge = calypsoEnv;
		context.devDocs = true;
		context.feedbackURL = 'https://github.com/Automattic/wp-calypso/issues/';
		// this is for calypso.live, so that branchName can be available while rendering the page
		if ( request.query.branch ) {
			context.branchName = request.query.branch;
		}
	}

	if ( calypsoEnv === 'horizon' ) {
		context.badge = 'feedback';
		context.feedbackURL = 'https://horizonfeedback.wordpress.com/';
	}

	if ( calypsoEnv === 'stage' ) {
		context.badge = 'staging';
		context.feedbackURL = 'https://github.com/Automattic/wp-calypso/issues/';
	}

	if ( calypsoEnv === 'development' ) {
		context.badge = 'dev';
		context.devDocs = true;
		context.feedbackURL = 'https://github.com/Automattic/wp-calypso/issues/';
		context.branchName = getCurrentBranchName();
		context.commitChecksum = getCurrentCommitShortChecksum();
	}

	if ( calypsoEnv === 'jetpack-cloud-stage' ) {
		context.badge = 'jetpack-cloud-staging';
		context.feedbackURL = 'https://github.com/Automattic/wp-calypso/issues/';
	}

	if ( calypsoEnv === 'jetpack-cloud-development' ) {
		context.badge = 'jetpack-cloud-dev';
		context.feedbackURL = 'https://github.com/Automattic/wp-calypso/issues/';
		context.branchName = getCurrentBranchName();
		context.commitChecksum = getCurrentCommitShortChecksum();
	}

	return context;
}

const setupDefaultContext = entrypoint => ( req, res, next ) => {
	req.context = getDefaultContext( req, entrypoint );
	next();
};

function setUpLoggedOutRoute( req, res, next ) {
	res.set( {
		'X-Frame-Options': 'SAMEORIGIN',
	} );

	next();
}

function setUpLoggedInRoute( req, res, next ) {
	let redirectUrl, start;

	res.set( {
		'X-Frame-Options': 'SAMEORIGIN',
	} );

	const setupRequests = [];

	if ( config.isEnabled( 'use-translation-chunks' ) ) {
		const target = getBuildTargetFromRequest( req );
		const rootPath = path.join( __dirname, '..', '..', '..' );
		const langRevisionsPath = path.join(
			rootPath,
			'public',
			target,
			'languages',
			'lang-revisions.json'
		);
		const langPromise = fs.promises
			.readFile( langRevisionsPath, 'utf8' )
			.then( languageRevisions => {
				req.context.languageRevisions = languageRevisions;

				return languageRevisions;
			} )
			.catch( error => {
				console.error( 'Failed to read the language revision files.', error );

				throw error;
			} );

		setupRequests.push( langPromise );
	} else {
		const LANG_REVISION_FILE_URL = 'https://widgets.wp.com/languages/calypso/lang-revisions.json';
		const langPromise = superagent
			.get( LANG_REVISION_FILE_URL )
			.then( response => {
				const languageRevisions = filterLanguageRevisions( response.body );

				req.context.languageRevisions = languageRevisions;

				return languageRevisions;
			} )
			.catch( error => {
				console.error( 'Failed to fetch the language revision files.', error );

				throw error;
			} );

		setupRequests.push( langPromise );
	}

	if ( config.isEnabled( 'wpcom-user-bootstrap' ) ) {
		const protocol = req.get( 'X-Forwarded-Proto' ) === 'https' ? 'https' : 'http';

		redirectUrl = login( {
			isNative: config.isEnabled( 'login/native-login-links' ),
			redirectTo: protocol + '://' + config( 'hostname' ) + req.originalUrl,
		} );

		if ( ! req.context.isLoggedIn ) {
			debug( 'User not logged in. Redirecting to %s', redirectUrl );
			res.redirect( redirectUrl );
			return;
		}

		const user = require( 'server/user-bootstrap' );

		start = new Date().getTime();

		debug( 'Issuing API call to fetch user object' );

		const userPromise = user( req )
			.then( data => {
				const end = new Date().getTime() - start;

				debug( 'Rendering with bootstrapped user object. Fetched in %d ms', end );
				req.context.user = data;

				// Setting user in the state is safe as long as we don't cache it
				req.context.store.dispatch( setCurrentUser( data ) );

				if ( data.localeSlug ) {
					req.context.lang = data.localeSlug;
					req.context.store.dispatch( {
						type: LOCALE_SET,
						localeSlug: data.localeSlug,
						localeVariant: data.localeVariant,
					} );
				}

				if ( req.path === '/' && req.query ) {
					const searchParam = req.query.s || req.query.q;
					if ( searchParam ) {
						res.redirect(
							'https://' +
								req.context.lang +
								'.search.wordpress.com/?q=' +
								encodeURIComponent( searchParam )
						);
						return;
					}

					if ( req.query.newuseremail ) {
						debug( 'Detected legacy email verification action. Redirecting...' );
						res.redirect( 'https://wordpress.com/verify-email/?' + stringify( req.query ) );
						return;
					}

					if ( req.query.action === 'wpcom-invite-users' ) {
						debug( 'Detected legacy invite acceptance action. Redirecting...' );
						res.redirect( 'https://wordpress.com/accept-invite/?' + stringify( req.query ) );
						return;
					}
				}
			} )
			.catch( error => {
				if ( error.error === 'authorization_required' ) {
					debug( 'User public API authorization required. Redirecting to %s', redirectUrl );
					res.clearCookie( 'wordpress_logged_in', {
						path: '/',
						httpOnly: true,
						domain: '.wordpress.com',
					} );
					res.redirect( redirectUrl );
				} else {
					let errorMessage;

					if ( error.error ) {
						errorMessage = error.error + ' ' + error.message;
					} else {
						errorMessage = error.message;
					}

					console.error( 'API Error: ' + errorMessage );
				}

				throw error;
			} );

		setupRequests.push( userPromise );
	}

	Promise.all( setupRequests )
		.then( () => next() )
		.catch( error => next( error ) );
}

/**
 * Sets up a Content Security Policy header
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {Function} next a callback to call when done
 */
function setUpCSP( req, res, next ) {
	const originalUrlPathname = req.originalUrl.split( '?' )[ 0 ];

	// We only setup CSP for /log-in* for now
	if ( ! /^\/log-in/.test( originalUrlPathname ) ) {
		next();
		return;
	}

	// This is calculated by taking the contents of the script text from between the tags,
	// and calculating SHA256 hash on it, encoded in base64, example:
	// `sha256-${ base64( sha256( 'window.AppBoot();' ) ) }` === sha256-3yiQswl88knA3EhjrG5tj5gmV6EUdLYFvn2dygc0xUQ
	// you can also just run it in Chrome, chrome will give you the hash of the violating scripts
	const inlineScripts = [
		'sha256-3yiQswl88knA3EhjrG5tj5gmV6EUdLYFvn2dygc0xUQ=',
		'sha256-ZKTuGaoyrLu2lwYpcyzib+xE4/2mCN8PKv31uXS3Eg4=',
	];

	req.context.inlineScriptNonce = crypto.randomBytes( 48 ).toString( 'hex' );

	const policy = {
		'default-src': [ "'self'" ],
		'script-src': [
			"'self'",
			"'report-sample'",
			"'unsafe-eval'",
			'stats.wp.com',
			'https://widgets.wp.com',
			'*.wordpress.com',
			'https://apis.google.com',
			'https://appleid.cdn-apple.com',
			`'nonce-${ req.context.inlineScriptNonce }'`,
			'www.google-analytics.com',
			...inlineScripts.map( hash => `'${ hash }'` ),
		],
		'base-uri': [ "'none'" ],
		'style-src': [ "'self'", '*.wp.com', 'https://fonts.googleapis.com' ],
		'form-action': [ "'self'" ],
		'object-src': [ "'none'" ],
		'img-src': [
			"'self'",
			'data',
			'*.wp.com',
			'*.files.wordpress.com',
			'*.gravatar.com',
			'https://www.google-analytics.com',
			'https://amplifypixel.outbrain.com',
			'https://img.youtube.com',
		],
		'frame-src': [ "'self'", 'https://public-api.wordpress.com', 'https://accounts.google.com/' ],
		'font-src': [
			"'self'",
			'*.wp.com',
			'https://fonts.gstatic.com',
			'data:', // should remove 'data:' ASAP
		],
		'media-src': [ "'self'" ],
		'connect-src': [ "'self'", 'https://*.wordpress.com/', 'https://*.wp.com' ],
		'report-uri': [ '/cspreport' ],
	};

	const policyString = Object.keys( policy )
		.map( key => `${ key } ${ policy[ key ].join( ' ' ) }` )
		.join( '; ' );

	// For now we're just logging policy violations and not blocking them
	// so we won't actually break anything, later we'll remove the 'Report-Only'
	// part so browsers will block violating content.
	res.set( { 'Content-Security-Policy-Report-Only': policyString } );
	next();
}

function setUpRoute( req, res, next ) {
	setUpCSP( req, res, () =>
		req.context.isLoggedIn
			? setUpLoggedInRoute( req, res, next )
			: setUpLoggedOutRoute( req, res, next )
	);
}

const render404 = ( entrypoint = 'entry-main' ) => ( req, res ) => {
	const ctx = {
		faviconURL: config( 'favicon_url' ),
		entrypoint: getFilesForEntrypoint( getBuildTargetFromRequest( req ), entrypoint ),
	};

	res.status( 404 ).send( renderJsx( '404', ctx ) );
};

/* We don't use `next` but need to add it for express.js to
   recognize this function as an error handler, hence the
	 eslint-disable. */
// eslint-disable-next-line no-unused-vars
const renderServerError = ( entrypoint = 'entry-main' ) => ( err, req, res, next ) => {
	if ( process.env.NODE_ENV !== 'production' ) {
		console.error( err );
	}

	const ctx = {
		faviconURL: config( 'favicon_url' ),
		entrypoint: getFilesForEntrypoint( getBuildTargetFromRequest( req ), entrypoint ),
	};

	res.status( err.status || 500 ).send( renderJsx( '500', ctx ) );
};

/**
 * Sets language properties to context if
 * a WordPress.com language slug is detected in the hostname
 *
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {Function} next a callback to call when done
 * @returns {Function|undefined} res.redirect if not logged in
 */
function handleLocaleSubdomains( req, res, next ) {
	const langSlug = endsWith( req.hostname, config( 'hostname' ) )
		? split( req.hostname, '.' )[ 0 ]
		: null;

	if ( langSlug && includes( config( 'magnificent_non_en_locales' ), langSlug ) ) {
		// Retrieve the language object for the RTL information.
		const language = getLanguage( langSlug );

		// Switch locales only in a logged-out state.
		if ( language && ! req.context.isLoggedIn ) {
			req.context = {
				...req.context,
				lang: language.langSlug,
				isRTL: !! language.rtl,
			};
		} else {
			// Strip the langSlug and redirect using hostname
			// so that the user's locale preferences take priority.
			const protocol = req.get( 'X-Forwarded-Proto' ) === 'https' ? 'https' : 'http';
			const port = process.env.PORT || config( 'port' ) || '';
			const hostname = req.hostname.substr( langSlug.length + 1 );
			const redirectUrl = `${ protocol }://${ hostname }:${ port }${ req.path }`;
			return res.redirect( redirectUrl );
		}
	}
	next();
}

module.exports = function() {
	const app = express();

	app.set( 'views', __dirname );

	app.use( logSectionResponse );
	app.use( cookieParser() );
	app.use( setupLoggedInContext );
	app.use( handleLocaleSubdomains );

	// Temporarily redirect cloud.jetpack.com to jetpack.com in the production enviroment
	app.use( function( req, res, next ) {
		if ( 'jetpack-cloud-production' === calypsoEnv ) {
			res.redirect( 'https://jetpack.com/' );
		}
		next();
	} );

	// redirect homepage if the Reader is disabled
	app.get( '/', function( request, response, next ) {
		if ( ! config.isEnabled( 'reader' ) && config.isEnabled( 'stats' ) ) {
			response.redirect( '/stats' );
		} else {
			next();
		}
	} );

	// redirects to handle old newdash formats
	app.use( '/sites/:site/:section', function( req, res, next ) {
		const redirectedSections = [
			'posts',
			'pages',
			'sharing',
			'upgrade',
			'checkout',
			'change-theme',
		];
		let redirectUrl;

		if ( -1 === redirectedSections.indexOf( req.params.section ) ) {
			next();
			return;
		}
		if ( 'change-theme' === req.params.section ) {
			redirectUrl = req.originalUrl.replace( /^\/sites\/[0-9a-zA-Z\-.]+\/change-theme/, '/themes' );
		} else {
			redirectUrl = req.originalUrl.replace(
				/^\/sites\/[0-9a-zA-Z\-.]+\/\w+/,
				'/' + req.params.section + '/' + req.params.site
			);
		}
		res.redirect( redirectUrl );
	} );

	if ( process.env.NODE_ENV !== 'development' ) {
		app.get( '/discover', function( req, res, next ) {
			if ( ! req.context.isLoggedIn ) {
				res.redirect( config( 'discover_logged_out_redirect_url' ) );
			} else {
				next();
			}
		} );

		// redirect logged-out searches to en.search.wordpress.com
		app.get( '/read/search', function( req, res, next ) {
			if ( ! req.context.isLoggedIn ) {
				res.redirect( 'https://en.search.wordpress.com/?q=' + encodeURIComponent( req.query.q ) );
			} else {
				next();
			}
		} );

		app.get( '/plans', function( req, res, next ) {
			if ( ! req.context.isLoggedIn ) {
				const queryFor = req.query && req.query.for;
				if ( queryFor && 'jetpack' === queryFor ) {
					res.redirect(
						'https://wordpress.com/wp-login.php?redirect_to=https%3A%2F%2Fwordpress.com%2Fplans'
					);
				} else {
					res.redirect( 'https://wordpress.com/pricing' );
				}
			} else {
				next();
			}
		} );
	}

	// Redirect legacy `/menus` routes to the corresponding Customizer panel
	// TODO: Move to `my-sites/customize` route defs once that section is isomorphic
	app.get( [ '/menus', '/menus/:site?' ], ( req, res ) => {
		const siteSlug = get( req.params, 'site', '' );
		const newRoute = '/customize/menus/' + siteSlug;
		res.redirect( 301, newRoute );
	} );

	app.get( [ '/domains', '/start/domain-first' ], function( req, res ) {
		let redirectUrl = '/start/domain';
		const domain = get( req, 'query.new', false );
		if ( domain ) {
			redirectUrl += '?new=' + encodeURIComponent( domain );
		}

		res.redirect( redirectUrl );
	} );

	// Landing pages for domains-related emails
	app.get(
		'/domain-services/:action',
		setupDefaultContext( 'entry-domains-landing' ),
		( req, res ) => {
			const ctx = req.context;
			attachBuildTimestamp( ctx );
			attachHead( ctx );
			attachI18n( ctx );

			ctx.clientData = config.clientData;
			ctx.domainsLandingData = {
				action: get( req, [ 'params', 'action' ], 'unknown-action' ),
				query: get( req, 'query', {} ),
			};

			const pageHtml = renderJsx( 'domains-landing', ctx );
			res.send( pageHtml );
		}
	);

	function handleSectionPath( section, sectionPath, entrypoint ) {
		const pathRegex = pathToRegExp( sectionPath );

		app.get( pathRegex, setupDefaultContext( entrypoint ), function( req, res, next ) {
			req.context.sectionName = section.name;

			if ( ! entrypoint && config.isEnabled( 'code-splitting' ) ) {
				req.context.chunkFiles = getFilesForChunk( section.name, req );
			} else {
				req.context.chunkFiles = EMPTY_ASSETS;
			}

			if ( section.secondary && req.context ) {
				req.context.hasSecondary = true;
			}

			if ( section.group && req.context ) {
				req.context.sectionGroup = section.group;
			}

			next();
		} );

		if ( ! section.isomorphic ) {
			app.get( pathRegex, setUpRoute, serverRender );
		}
	}

	sections
		.filter( section => ! section.envId || section.envId.indexOf( config( 'env_id' ) ) > -1 )
		.filter( isSectionEnabled )
		.forEach( section => {
			section.paths.forEach( sectionPath => handleSectionPath( section, sectionPath ) );

			if ( section.isomorphic ) {
				// section.load() uses require on the server side so we also need to access the
				// default export of it. See webpack/bundler/sections-loader.js
				// TODO: section initialization is async function since #28301. At the moment when
				// some isomorphic section really starts doing something async, we should start
				// awaiting the result here. Will be solved together with server-side dynamic reducers.
				section.load().default( serverRouter( app, setUpRoute, section ) );
			}
		} );

	// Set up login routing.
	handleSectionPath( LOGIN_SECTION_DEFINITION, '/log-in', 'entry-login' );
	loginRouter( serverRouter( app, setUpRoute, null ) );

	handleSectionPath(
		GUTENBOARDING_SECTION_DEFINITION,
		`/${ GUTENBOARDING_BASE_NAME }`,
		'entry-gutenboarding'
	);

	// Handle redirection from development basename
	// TODO: Remove after a few months
	handleSectionPath( GUTENBOARDING_SECTION_DEFINITION, `/gutenboarding`, 'entry-gutenboarding' );

	// This is used to log to tracks Content Security Policy violation reports sent by browsers
	app.post(
		'/cspreport',
		bodyParser.json( { type: [ 'json', 'application/csp-report' ] } ),
		function( req, res ) {
			const cspReport = req.body[ 'csp-report' ] || {};
			const cspReportSnakeCase = Object.keys( cspReport ).reduce( ( report, key ) => {
				report[ snakeCase( key ) ] = cspReport[ key ];
				return report;
			}, {} );

			if ( calypsoEnv !== 'development' ) {
				analytics.tracks.recordEvent( 'calypso_csp_report', cspReportSnakeCase, req );
			}

			res.status( 200 ).send( 'Got it!' );
		},
		// eslint-disable-next-line no-unused-vars
		function( err, req, res, next ) {
			res.status( 500 ).send( 'Bad report!' );
		}
	);

	app.get( '/browsehappy', setupDefaultContext(), setUpRoute, function( req, res ) {
		const wpcomRe = /^https?:\/\/[A-z0-9_-]+\.wordpress\.com$/;
		const primaryBlogUrl = get( req, 'context.user.primary_blog_url', '' );
		const isWpcom = wpcomRe.test( primaryBlogUrl );

		req.context.dashboardUrl = isWpcom
			? primaryBlogUrl + '/wp-admin'
			: 'https://dashboard.wordpress.com/wp-admin/';

		res.send( renderJsx( 'browsehappy', req.context ) );
	} );

	app.get( '/support-user', function( req, res ) {
		// Do not iframe
		res.set( {
			'X-Frame-Options': 'DENY',
		} );

		if ( calypsoEnv === 'development' ) {
			return res.send(
				renderJsx( 'support-user', {
					authorized: true,
					supportUser: req.query.support_user,
					supportToken: req.query._support_token,
					supportPath: req.query.support_path,
				} )
			);
		}

		if ( ! config.isEnabled( 'wpcom-user-bootstrap' ) || ! req.cookies.wordpress_logged_in ) {
			return res.send( renderJsx( 'support-user' ) );
		}

		// Maybe not logged in, note that you need docker to test this properly
		const user = require( 'server/user-bootstrap' );

		debug( 'Issuing API call to fetch user object' );

		user( req )
			.then( data => {
				const activeFlags = get( data, 'meta.data.flags.active_flags', [] );

				// A8C check
				if ( ! includes( activeFlags, 'calypso_support_user' ) ) {
					return res.send( renderJsx( 'support-user' ) );
				}

				// Passed all checks, prepare support user session
				return res.send(
					renderJsx( 'support-user', {
						authorized: true,
						supportUser: req.query.support_user,
						supportToken: req.query._support_token,
						supportPath: req.query.support_path,
					} )
				);
			} )
			.catch( () => {
				res.clearCookie( 'wordpress_logged_in', {
					path: '/',
					httpOnly: true,
					domain: '.wordpress.com',
				} );

				return res.send( renderJsx( 'support-user' ) );
			} );
	} );

	// catchall to render 404 for all routes not whitelisted in client/sections
	app.use( render404() );

	// Error handling middleware for displaying the server error 500 page must be the very last middleware defined
	app.use( renderServerError() );

	return app;
};
