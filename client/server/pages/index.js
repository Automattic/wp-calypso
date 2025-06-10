import { execSync } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { parseTrackingPrefs } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import {
	filterLanguageRevisions,
	isTranslatedIncompletely,
	isDefaultLocale,
	getLanguageSlugs,
	localizeUrl,
} from '@automattic/i18n-utils';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import debugFactory from 'debug';
import express from 'express';
import { get, includes, snakeCase } from 'lodash';
import { stringify } from 'qs';
// eslint-disable-next-line no-restricted-imports
import superagent from 'superagent'; // Don't have Node.js fetch lib yet.
import {
	DASHBOARD_SECTION_DEFINITION,
	DASHBOARD_A4A_SECTION_DEFINITION,
} from 'calypso/dashboard/section';
import wooDnaConfig from 'calypso/jetpack-connect/woo-dna-config';
import { STEPPER_SECTION_DEFINITION } from 'calypso/landing/stepper/section';
import { SUBSCRIPTIONS_SECTION_DEFINITION } from 'calypso/landing/subscriptions/section';
import { isInStepContainerV2FlowContext } from 'calypso/layout/utils';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { shouldSeeCookieBanner } from 'calypso/lib/analytics/utils';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { login } from 'calypso/lib/paths';
import loginRouter, { LOGIN_SECTION_DEFINITION } from 'calypso/login';
import sections from 'calypso/sections';
import isSectionEnabled from 'calypso/sections-filter';
import { serverRouter, getCacheKey } from 'calypso/server/isomorphic-routing';
import analytics from 'calypso/server/lib/analytics';
import { isWpMobileApp, isWcMobileApp } from 'calypso/server/lib/is-mobile-app';
import performanceMark from 'calypso/server/lib/performance-mark/index';
import {
	serverRender,
	renderJsx,
	attachBuildTimestamp,
	attachHead,
	attachI18n,
} from 'calypso/server/render';
import sanitize from 'calypso/server/sanitize';
import stateCache from 'calypso/server/state-cache';
import getBootstrappedUser from 'calypso/server/user-bootstrap';
import { createReduxStore } from 'calypso/state';
import { LOCALE_SET } from 'calypso/state/action-types';
import { setCurrentUser } from 'calypso/state/current-user/actions';
import { setDocumentHeadLink, setDocumentHeadMeta } from 'calypso/state/document-head/actions';
import { getDocumentHeadMeta } from 'calypso/state/document-head/selectors';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';
import { deserialize } from 'calypso/state/utils';
import { pathToRegExp } from 'calypso/utils';
import middlewareAssets from '../middleware/assets.js';
import middlewareCache from '../middleware/cache.js';
import middlewareUnsupportedBrowser from '../middleware/unsupported-browser.js';
import { logSectionResponse } from './analytics';
const debug = debugFactory( 'calypso:pages' );

const calypsoEnv = config( 'env_id' );

let branchName;
function getCurrentBranchName() {
	if ( ! branchName ) {
		try {
			branchName = execSync( 'git rev-parse --abbrev-ref HEAD' ).toString().replace( /\s/gm, '' );
		} catch ( err ) {}
	}
	return branchName;
}

let commitChecksum;
function getCurrentCommitShortChecksum() {
	if ( ! commitChecksum ) {
		try {
			commitChecksum = execSync( 'git rev-parse --short HEAD' ).toString().replace( /\s/gm, '' );
		} catch ( err ) {}
	}
	return commitChecksum;
}

/*
 * Look at the request headers and determine if the request is logged in or logged out or if
 * it's a support session. Set `req.context.isLoggedIn` and `req.context.isSupportSession` flags
 * accordingly. The handler is called very early (immediately after parsing the cookies) and
 * all following handlers (including the locale and redirect ones) can rely on the context values.
 */
function setupLoggedInContext( req, res, next ) {
	const isSupportSession = !! req.get( 'x-support-session' ) || !! req.cookies.support_session_id;
	const isSSP = !! req.cookies.ssp;
	const isLoggedIn = !! req.cookies.wordpress_logged_in;

	req.context = {
		...req.context,
		isSupportSession,
		isSSP,
		isLoggedIn,
	};

	next();
}

function getDefaultContext( request, response, entrypoint = 'entry-main' ) {
	performanceMark( request.context, 'getDefaultContext' );

	const geoIPCountryCode = request.headers[ 'x-geoip-country-code' ];
	const trackingPrefs = parseTrackingPrefs(
		request.cookies.sensitive_pixel_options,
		request.cookies.sensitive_pixel_option
	);

	const countryCodeCookie = request.cookies.country_code;
	const validCountryCodeCookie =
		countryCodeCookie && countryCodeCookie !== 'unknown' ? countryCodeCookie : undefined;

	const showGdprBanner = shouldSeeCookieBanner(
		validCountryCodeCookie || geoIPCountryCode,
		trackingPrefs
	);

	if ( ! validCountryCodeCookie && geoIPCountryCode ) {
		response.cookie( 'country_code', geoIPCountryCode );
	}

	const cacheKey = getCacheKey( {
		path: request.path,
		query: request.query,
		context: { showGdprBanner },
	} );

	/**
	 * A cache object can be written for an SSR route like /themes when a request
	 * is logged out. To avoid using that logged-out data for an authenticated
	 * request, we should not utilize the state cache for logged-in requests.
	 * Note that in dev mode (when the user is not bootstrapped), all requests
	 * are considered logged out. This shouldn't cause issues because only one
	 * user is using the cache in dev mode -- so cross-request pollution won't happen.
	 */
	performanceMark( request.context, 'get cached redux state', true );
	const cachedServerState = request.context.isLoggedIn ? {} : stateCache.get( cacheKey ) || {};
	const getCachedState = ( reducer, storageKey ) => {
		const storedState = cachedServerState[ storageKey ];

		if ( ! storedState ) {
			return undefined;
		}
		return deserialize( reducer, storedState );
	};
	const reduxStore = createReduxStore( getCachedState( initialReducer, 'root' ) );
	setStore( reduxStore, getCachedState );
	performanceMark( request.context, 'create basic options', true );

	const devEnvironments = [
		'development',
		'jetpack-cloud-development',
		'a8c-for-agencies-development',
	];
	const isDebug = devEnvironments.includes( calypsoEnv ) || request.query.debug !== undefined;

	const reactQueryDevtoolsHelper = config.isEnabled( 'dev/react-query-devtools' );
	const authHelper = config.isEnabled( 'dev/auth-helper' );
	const accountSettingsHelper = config.isEnabled( 'dev/account-settings-helper' );
	const storeSandboxHelper = config.isEnabled( 'dev/store-sandbox-helper' );
	// preferences helper requires a Redux store, which doesn't exist in Gutenboarding
	const preferencesHelper =
		config.isEnabled( 'dev/preferences-helper' ) && entrypoint !== 'entry-gutenboarding';
	const featuresHelper = config.isEnabled( 'dev/features-helper' );

	const flags = ( request.query.flags || '' ).split( ',' );

	performanceMark( request.context, 'getFilesForChunkGroup', true );
	const entrypointFiles = request.getFilesForChunkGroup( entrypoint );

	performanceMark( request.context, 'getAssets', true );
	const manifests = request.getAssets().manifests;

	performanceMark( request.context, 'assign context object', true );
	const context = Object.assign( {}, request.context, {
		commitSha: process.env.hasOwnProperty( 'COMMIT_SHA' ) ? process.env.COMMIT_SHA : '(unknown)',
		compileDebug: process.env.NODE_ENV === 'development',
		user: false,
		env: calypsoEnv,
		sanitize: sanitize,
		isWooDna: wooDnaConfig( request.query ).isWooDnaFlow(),
		badge: false,
		lang: config( 'i18n_default_locale_slug' ),
		entrypoint: entrypointFiles,
		manifests,
		reactQueryDevtoolsHelper,
		accountSettingsHelper,
		authHelper,
		preferencesHelper,
		storeSandboxHelper,
		featuresHelper,
		devDocsURL: '/devdocs',
		store: reduxStore,
		target: 'evergreen',
		useTranslationChunks:
			config.isEnabled( 'use-translation-chunks' ) ||
			flags.includes( 'use-translation-chunks' ) ||
			request.query.hasOwnProperty( 'useTranslationChunks' ),
		showGdprBanner,
		showStepContainerV2Loader: isInStepContainerV2FlowContext( request.path, request.query ),
	} );

	context.app = {
		// use ipv4 address when is ipv4 mapped address
		clientIp: request.ip ? request.ip.replace( '::ffff:', '' ) : request.ip,
		isWpMobileApp: isWpMobileApp( request.useragent.source ),
		isWcMobileApp: isWcMobileApp( request.useragent.source ),
		isDebug,
	};

	performanceMark( request.context, 'setup environments', true );
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

	if ( calypsoEnv === 'a8c-for-agencies-stage' ) {
		context.badge = 'a8c-for-agencies-staging';
		context.feedbackURL = 'https://github.com/Automattic/wp-calypso/issues/';
	}

	if ( calypsoEnv === 'a8c-for-agencies-development' ) {
		context.badge = 'a8c-for-agencies-dev';
		context.feedbackURL = 'https://github.com/Automattic/wp-calypso/issues/';
		context.branchName = getCurrentBranchName();
		context.commitChecksum = getCurrentCommitShortChecksum();
	}

	return context;
}

const setupDefaultContext = ( entrypoint, sectionName ) => ( req, res, next ) => {
	req.context = getDefaultContext( req, res, entrypoint, sectionName );
	next();
};

function setUpLocalLanguageRevisions( req ) {
	performanceMark( req.context, 'setup_local_lang_revs', true );
	const rootPath = path.join( __dirname, '..', '..', '..' );
	const langRevisionsPath = path.join( rootPath, 'public', 'languages', 'lang-revisions.json' );

	performanceMark( req.context, 'read language file', true );
	const langPromise = fs.promises
		.readFile( langRevisionsPath, 'utf8' )
		.then( ( languageRevisions ) => {
			performanceMark( req.context, 'parse_lang_file', true );
			req.context.languageRevisions = JSON.parse( languageRevisions );
			performanceMark( req.context, 'done_parse_lang_file', true );

			return languageRevisions;
		} )
		.catch( ( error ) => {
			performanceMark( req.context, 'err_parse_lang_file', true );
			console.error( 'Failed to read the language revision files.', error );

			throw error;
		} );

	return langPromise;
}

function setUpLoggedOutRoute( req, res, next ) {
	performanceMark( req.context, 'setup_logged_out_route', true );
	res.set( {
		'X-Frame-Options': 'SAMEORIGIN',
	} );

	const setupRequests = [];

	if ( req.context.useTranslationChunks ) {
		setupRequests.push( setUpLocalLanguageRevisions( req ) );
	}

	if ( req.cookies?.subkey ) {
		req.context.user = {
			...( req.context.user ?? {} ),
			subscriptionManagementSubkey: req.cookies.subkey,
		};
	}

	Promise.all( setupRequests )
		.then( () => {
			performanceMark( req.context, 'finish_logged_out_setup', true );
			next();
		} )
		.catch( ( error ) => {
			performanceMark( req.context, 'err_logged_out_setup' );
			next( error );
		} );
}

function setUpLoggedInRoute( req, res, next ) {
	performanceMark( req.context, 'setup_logged_in_route' );
	let redirectUrl;
	let start;

	res.set( {
		'X-Frame-Options': 'SAMEORIGIN',
	} );

	const setupRequests = [];

	if ( req.context.useTranslationChunks ) {
		setupRequests.push( setUpLocalLanguageRevisions( req ) );
	} else {
		performanceMark( req.context, 'download_lang_revs', true );
		const LANG_REVISION_FILE_URL = 'https://widgets.wp.com/languages/calypso/lang-revisions.json';
		const langPromise = superagent
			.get( LANG_REVISION_FILE_URL )
			.then( ( response ) => {
				const languageRevisions = filterLanguageRevisions( response.body );

				req.context.languageRevisions = languageRevisions;
				performanceMark( req.context, 'finish_download_lang_revs', true );

				return languageRevisions;
			} )
			.catch( ( error ) => {
				performanceMark( req.context, 'err_download_lang_revs', true );
				console.error( 'Failed to fetch the language revision files.', error );

				throw error;
			} );

		setupRequests.push( langPromise );
	}

	if ( config.isEnabled( 'wpcom-user-bootstrap' ) ) {
		performanceMark( req.context, 'user_bootstrap', true );
		const protocol = req.get( 'X-Forwarded-Proto' ) === 'https' ? 'https' : 'http';

		redirectUrl = login( {
			redirectTo: protocol + '://' + config( 'hostname' ) + req.originalUrl,
		} );

		if ( ! req.context.isLoggedIn ) {
			debug( 'User not logged in. Redirecting to %s', redirectUrl );
			res.redirect( redirectUrl );
			return;
		}

		start = new Date().getTime();

		debug( 'Issuing API call to fetch user object' );

		const userPromise = getBootstrappedUser( req )
			.then( ( data ) => {
				performanceMark( req.context, 'finish_fetch_user_bootstrap', true );
				const end = new Date().getTime() - start;

				debug( 'Rendering with bootstrapped user object. Fetched in %d ms', end );
				req.context.user = data;

				// Setting user in the state is safe as long as we don't cache it
				req.context.store.dispatch( setCurrentUser( data ) );

				if (
					data.localeSlug &&
					! (
						data.use_fallback_for_incomplete_languages &&
						isTranslatedIncompletely( data.localeVariant || data.localeSlug )
					)
				) {
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
							'https://wordpress.com/reader/search?q=' + encodeURIComponent( searchParam )
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
				performanceMark( req.context, 'finish_user_bootstrap', true );
			} )
			.catch( ( error ) => {
				if ( error.error === 'authorization_required' ) {
					debug( 'User public API authorization required. Redirecting to %s', redirectUrl );
					res.clearCookie( 'wordpress_logged_in', {
						path: '/',
						httpOnly: true,
						domain: '.wordpress.com',
					} );
					res.redirect( redirectUrl );
				} else {
					performanceMark( req.context, 'err_user_bootstrap', true );
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
		.then( () => {
			performanceMark( req.context, 'finish_logged_in_setup' );
			next();
		} )
		.catch( ( error ) => {
			performanceMark( req.context, 'err_logged_in_setup' );
			next( error );
		} );
}

/**
 * Sets up a Content Security Policy header
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 * @param {Object} req Express request object
 * @param {Object} res Express response object
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
	const inlineScripts = [ 'sha256-ZKTuGaoyrLu2lwYpcyzib+xE4/2mCN8PKv31uXS3Eg4=' ];

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
			'use.typekit.net',
			...inlineScripts.map( ( hash ) => `'${ hash }'` ),
		],
		'base-uri': [ "'none'" ],
		'style-src': [
			"'self'",
			'*.wp.com',
			'https://fonts.googleapis.com',
			'use.typekit.net',
			// per https://helpx.adobe.com/ca/fonts/using/content-security-policy.html
			"'unsafe-inline'",
		],
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
			'localhost:8888',
			'p.typekit.net',
		],
		'frame-src': [
			"'self'",
			'https://public-api.wordpress.com',
			'https://accounts.google.com/',
			'https://jetpack.com',
		],
		'font-src': [
			"'self'",
			'*.wp.com',
			'https://fonts.gstatic.com',
			'use.typekit.net',
			'https://woocommerce.com',
			'data:', // should remove 'data:' ASAP
		],
		'media-src': [ "'self'" ],
		'connect-src': [
			"'self'",
			'https://*.wordpress.com/',
			'https://*.wp.com',
			'https://wordpress.com',
		],
		'report-uri': [ '/cspreport' ],
	};

	const policyString = Object.keys( policy )
		.map( ( key ) => `${ key } ${ policy[ key ].join( ' ' ) }` )
		.join( '; ' );

	// For now we're just logging policy violations and not blocking them
	// so we won't actually break anything, later we'll remove the 'Report-Only'
	// part so browsers will block violating content.
	res.set( { 'Content-Security-Policy-Report-Only': policyString } );
	next();
}

function setUpRoute( req, res, next ) {
	performanceMark( req.context, 'setUpRoute' );

	if ( req.context.isRouteSetup === true ) {
		req.logger.warn(
			{
				isLoggedIn: req.context.isLoggedIn,
				path: req.context.path,
			},
			'Route already set up. Ambiguous route definition likely.'
		);

		return next();
	}
	// Prevents function from being called twice.
	req.context.isRouteSetup = true;

	setUpCSP( req, res, () =>
		req.context.isLoggedIn
			? setUpLoggedInRoute( req, res, next )
			: setUpLoggedOutRoute( req, res, next )
	);
}

const setUpSectionContext = ( section, entrypoint ) => ( req, res, next ) => {
	req.context.sectionName = section.name;

	if ( ! entrypoint ) {
		req.context.chunkFiles = req.getFilesForChunkGroup( section.name );
	} else {
		req.context.chunkFiles = req.getEmptyAssets();
	}

	if ( section.group && req.context ) {
		req.context.sectionGroup = section.group;
	}

	if ( Array.isArray( section.links ) ) {
		section.links.forEach( ( link ) => req.context.store.dispatch( setDocumentHeadLink( link ) ) );
	}

	if ( Array.isArray( section.meta ) ) {
		// Append section specific meta tags.
		const meta = getDocumentHeadMeta( req.context.store.getState() ).concat( section.meta );
		req.context.store.dispatch( setDocumentHeadMeta( meta ) );
	}
	next();
};

const render404 =
	( entrypoint = 'entry-main' ) =>
	( req, res ) => {
		const ctx = {
			entrypoint: req.getFilesForChunkGroup( entrypoint ),
		};

		res.status( 404 ).send( renderJsx( '404', ctx ) );
	};

/*
We don't use `next` but need to add it for express.js to
recognize this function as an error handler, hence the
eslint-disable.
*/
const renderServerError =
	( entrypoint = 'entry-main' ) =>
	// eslint-disable-next-line no-unused-vars
	( err, req, res, next ) => {
		// If the response is not writable it means someone else already rendered a page, do nothing
		// Hopefully they logged the error as well.
		if ( res.writableEnded ) {
			return;
		}

		try {
			req.logger.error( err );
		} catch ( error ) {
			console.error( error );
		}

		const ctx = {
			entrypoint: req.getFilesForChunkGroup( entrypoint ),
		};

		res.status( err.status || 500 ).send( renderJsx( '500', ctx ) );
	};

/**
 * Checks if the passed URL has the same origin as the request
 * @param {express.Request} req Request
 * @param {string} url URL
 * @returns {boolean} True if origins are the same
 */
function validateRedirect( req, url ) {
	if ( ! url ) {
		return false;
	}

	try {
		const serverOrigin = req.protocol + '://' + req.host;
		return new URL( url, serverOrigin ).origin === serverOrigin;
	} catch {
		// if parsing the URL fails, it is not valid
		return false;
	}
}

/**
 * Defines wordpress.com (Calypso blue) routes only
 * @param {express.Application} app Express application
 */
function wpcomPages( app ) {
	// redirect homepage if the Reader is disabled
	app.get( '/', function ( request, response, next ) {
		if ( ! config.isEnabled( 'reader' ) && config.isEnabled( 'stats' ) ) {
			response.redirect( '/stats' );
		} else {
			next();
		}
	} );

	// redirects to handle old newdash formats
	app.use( '/sites/:site/:section', function ( req, res, next ) {
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

	app.get( `/:locale([a-z]{2,3}|[a-z]{2}-[a-z]{2})?/plans`, function ( req, res, next ) {
		const locale = req.params?.locale ?? config( 'i18n_default_locale_slug' );

		if ( ! req.context.isLoggedIn ) {
			const queryFor = req.query?.for;
			const ref = req.query?.ref;
			const coupon = req.query?.coupon;

			if ( queryFor && 'jetpack' === queryFor ) {
				res.redirect(
					'https://wordpress.com/wp-login.php?redirect_to=https%3A%2F%2Fwordpress.com%2Fplans'
				);
			} else {
				const pricingPage = 'https://wordpress.com/pricing/';
				const queryString = stringify( { ref, coupon } );
				const pricingPageUrl = localizeUrl(
					`${ pricingPage }${ queryString ? '?' + queryString : '' }`,
					locale
				);
				res.redirect( pricingPageUrl );
			}
		} else {
			if ( locale && locale !== config( 'i18n_default_locale_slug' ) ) {
				const queryParams = new URLSearchParams( req.query );
				const queryString = queryParams.size ? '?' + queryParams.toString() : '';
				res.redirect( `/plans${ queryString }` );
				return;
			}
			next();
		}
	} );

	// Redirect legacy `/menus` routes to the corresponding Customizer panel
	// TODO: Move to `my-sites/customize` route defs once that section is isomorphic
	app.get( [ '/menus', '/menus/:site?' ], ( req, res ) => {
		const siteSlug = get( req.params, 'site', '' );
		const newRoute = '/customize/menus/' + siteSlug;
		res.redirect( 301, newRoute );
	} );

	app.get( [ '/domains', '/start/domain-first' ], function ( req, res ) {
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
		setupDefaultContext( 'entry-domains-landing', 'domains-landing' ),
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

	app.get( '/browsehappy', ( req, res ) => {
		// We only want to allow a redirect to Calypso routes, so we check that
		// the `from` query param has the same origin.
		const { from } = req.query;
		const redirectLocation = from && validateRedirect( req, from ) ? from : '/';

		req.context.entrypoint = req.getFilesForChunkGroup( 'entry-browsehappy' );
		req.context.from = redirectLocation;

		res.send( renderJsx( 'browsehappy', req.context ) );
	} );

	app.get( '/support-user', function ( req, res ) {
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
		debug( 'Issuing API call to fetch user object' );
		getBootstrappedUser( req )
			.then( ( data ) => {
				const activeFlags = get( data, 'meta.data.flags.active_flags', [] );

				// A8C check
				if ( ! includes( activeFlags, 'calypso_support_user' ) ) {
					return res.send( renderJsx( 'support-user' ) );
				}

				// Passed all checks, prepare support user session
				res.send(
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

				res.send( renderJsx( 'support-user' ) );
			} );
	} );

	app.get( [ '/subscriptions', '/subscriptions/*' ], function ( req, res, next ) {
		if ( ( req.cookies.subkey || calypsoEnv !== 'production' ) && ! req.context.isLoggedIn ) {
			// If the user is not logged in but has a subkey cookie, they are authorized to view old portal
			return next();
		}

		// For users not logged in, redirect to the email login link page.
		if ( ! req.context.isLoggedIn ) {
			return res.redirect( 'https://wordpress.com/email-subscriptions' );
		}

		const basePath = 'https://wordpress.com/reader/subscriptions';

		// If user enters /subscriptions/sites(.*),
		// redirect to /reader/subscriptions.
		if ( req.path.match( '/subscriptions/sites' ) ) {
			return res.redirect( basePath );
		}

		// If user enters /site/*,
		// redirect to /reader/site/subscription/*.
		const siteFragment = req.path.match( /site\/(.*)/i );
		if ( siteFragment && siteFragment[ 1 ] ) {
			return res.redirect( 'https://wordpress.com/reader/site/subscription/' + siteFragment[ 1 ] );
		}

		// If user enters /subscriptions/comments(.*),
		// redirect to /reader/subscriptions/comments.
		if ( req.path.match( '/subscriptions/comments' ) ) {
			return res.redirect( basePath + '/comments' );
		}

		// If user enters /subscriptions/pending(.*),
		// redirect to /reader/subscriptions/pending.
		if ( req.path.match( '/subscriptions/pending' ) ) {
			return res.redirect( basePath + '/pending' );
		}

		// If user enters /subscriptions/settings,
		// redirect to /me/notifications/subscriptions?referrer=management.
		if ( req.path.match( '/subscriptions/settings' ) ) {
			return res.redirect(
				'https://wordpress.com/me/notifications/subscriptions?referrer=management'
			);
		}

		return res.redirect( basePath );
	} );

	// Redirects from the /start/domain-transfer flow to the new /setup/domain-transfer.
	app.get( [ '/start/domain-transfer', '/start/domain-transfer/*' ], function ( req, res ) {
		const redirectUrl = '/setup/domain-transfer';
		res.redirect( 301, redirectUrl );
	} );

	// Redirects from /help/courses to https://wordpress.com/learn/courses.
	app.get( '/help/courses', function ( req, res ) {
		const redirectUrl = 'https://wordpress.com/learn/courses';
		res.redirect( 301, redirectUrl );
	} );
}

export default function pages() {
	const app = express();

	app.set( 'views', __dirname );

	app.use( logSectionResponse );
	app.use( cookieParser() );
	app.use( middlewareAssets() );
	app.use( middlewareCache() );
	app.use( setupLoggedInContext );
	app.use( middlewareUnsupportedBrowser() );

	if ( ! ( isJetpackCloud() || isA8CForAgencies() ) ) {
		wpcomPages( app );
	}

	/**
	 * Given information about a section, register the given path as an express
	 * route and define a basic middleware chain. The chain sets up any request
	 * context and renders the basic DOM structure, ultimately resolving the request.
	 *
	 * For SSR requests -- e.g. the section is compatible with SSR and the request
	 * is logged out -- it skips the rendering portion of the chain, because that
	 * is explicitly handled by the serverRouter. In SSR contexts, this chain is
	 * still responsible for setting up some basic info like the context and the
	 * bootstrapped user, but not for resolving the request.
	 *
	 * This approach allows requests to an SSR section to skip any section-specific
	 * SSR middleware if the request wasn't going to be resolved with SSR anyways.
	 */
	function handleSectionPath( section, sectionPath, entrypoint ) {
		const pathRegex = pathToRegExp( sectionPath );

		app.get(
			pathRegex,
			setupDefaultContext( entrypoint, section.name ),
			setUpSectionContext( section, entrypoint ),
			// Skip the rest of the middleware chain if SSR compatible. Further
			// SSR checks aren't accounted for here, but happen in the SSR pipeline
			// itself (see serverRouter). But if we know at a basic level that SSR
			// won't be used, we can boost performance by rendering the page here.
			( req, res, next ) => {
				if ( ! req.context.isLoggedIn && section.isomorphic ) {
					return next( 'route' );
				}
				debug( `Using non-SSR pipeline for path ${ req.path } with handler ${ pathRegex }` );
				next();
			},
			setUpRoute, // For SSR requests, this will happen in the serverRouter.
			serverRender
		);
	}

	sections
		.filter( ( section ) => ! section.envId || section.envId.indexOf( config( 'env_id' ) ) > -1 )
		.filter( isSectionEnabled )
		.forEach( ( section ) => {
			section.paths.forEach( ( sectionPath ) => handleSectionPath( section, sectionPath ) );

			if ( section.isomorphic ) {
				// section.load() uses require on the server side so we also need to access the
				// default export of it. See build-tools/webpack/sections-loader.js
				// TODO: section initialization is async function since #28301. At the moment when
				// some isomorphic section really starts doing something async, we should start
				// awaiting the result here. Will be solved together with server-side dynamic reducers.
				section.load().default( serverRouter( app, setUpRoute, section ) );
			}
		} );

	// Set up login routing.
	handleSectionPath( LOGIN_SECTION_DEFINITION, '/log-in', 'entry-login' );
	loginRouter( serverRouter( app, setUpRoute, null ) );

	// Set up v2 dashboard routing.
	handleSectionPath( DASHBOARD_SECTION_DEFINITION, '/v2', 'entry-dashboard-dotcom' );

	// Set up v2-a4a dashboard routing.
	handleSectionPath( DASHBOARD_A4A_SECTION_DEFINITION, '/v2-a4a', 'entry-dashboard-a4a' );

	handleSectionPath( STEPPER_SECTION_DEFINITION, '/setup', 'entry-stepper' );
	handleSectionPath( SUBSCRIPTIONS_SECTION_DEFINITION, '/subscriptions', 'entry-subscriptions' );

	// Redirect legacy `/new` routes to the corresponding `/start`
	app.get( [ '/new', '/new/*' ], ( req, res ) => {
		const lastPathSegment = req.path.substr( req.path.lastIndexOf( '/' ) + 1 );
		const languageSlugs = getLanguageSlugs();
		let redirectUrl = '/start';

		if ( languageSlugs.includes( lastPathSegment ) && ! isDefaultLocale( lastPathSegment ) ) {
			redirectUrl += `/${ lastPathSegment }`;
		}

		if ( Object.keys( req.query ) > 0 ) {
			redirectUrl += `?${ stringify( req.query ) }`;
		}

		res.redirect( 301, redirectUrl );
	} );

	// This is used to log to tracks Content Security Policy violation reports sent by browsers
	app.post(
		'/cspreport',
		bodyParser.json( { type: [ 'json', 'application/csp-report' ] } ),
		function ( req, res ) {
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
		function ( err, req, res, next ) {
			res.status( 500 ).send( 'Bad report!' );
		}
	);

	// catchall to render 404 for all routes not explicitly allowed in client/sections
	app.use( render404() );

	// Error handling middleware for displaying the server error 500 page must be the very last middleware defined
	app.use( renderServerError() );

	return app;
}
