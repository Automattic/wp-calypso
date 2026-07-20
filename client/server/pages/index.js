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
import cookieParser from 'cookie-parser';
import debugFactory from 'debug';
import express from 'express';
import { stringify } from 'qs';
// eslint-disable-next-line no-restricted-imports
import superagent from 'superagent'; // Don't have Node.js fetch lib yet.
import { getDashboardFromHostname, isAllowedDashboardRoute } from 'calypso/dashboard/app/routing';
import { isAllowedA4ADashboardHostname } from 'calypso/dashboard/app-a4a/routing';
import {
	A4A_DASHBOARD_SECTION_DEFINITION,
	A4A_DASHBOARD_SECTION_PATHS,
} from 'calypso/dashboard/app-a4a/section';
import { isAllowedCiabDashboardHostname } from 'calypso/dashboard/app-ciab/routing';
import {
	CIAB_DASHBOARD_SECTION_DEFINITION,
	CIAB_DASHBOARD_SECTION_PATHS,
} from 'calypso/dashboard/app-ciab/section';
import { isAllowedDotcomDashboardHostname } from 'calypso/dashboard/app-dotcom/routing';
import {
	DOTCOM_DASHBOARD_SECTION_DEFINITION,
	DOTCOM_DASHBOARD_SECTION_PATHS,
} from 'calypso/dashboard/app-dotcom/section';
import { A4A_SIGNUP_PATHS } from 'calypso/dashboard/section';
import isDashboardEnv from 'calypso/dashboard/utils/is-dashboard-env';
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
import { loadDashboardLocaleData } from 'calypso/server/dashboard-i18n';
import { serverRouter, getCacheKey } from 'calypso/server/isomorphic-routing';
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
import { registerCspReportRoute } from './csp-report';
const debug = debugFactory( 'calypso:pages' );

const calypsoEnv = config( 'env_id' );
const WOO_MOBILE_LOGIN_FALLBACK_URL = 'https://woocommerce.com/mobilelogin/';
const WOO_MOBILE_LOGIN_LOCAL_FALLBACK_URL = 'https://woocommerce.test/mobilelogin/';
const WOO_MOBILE_LOGIN_AUTH_MISSING_QUERY = 'wpcom_auth';
const WOO_MOBILE_LOGIN_RETURN_TO_QUERY = 'return_to';

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

function isWooCommerceQrLoginRequest( req ) {
	return req.path === '/me/security/qr-login' && req.query?.origin === 'woocommerce';
}

function getAllowedWooMobileLoginHosts() {
	const hosts = [ 'woocommerce.com' ];

	if ( [ 'development', 'test' ].includes( calypsoEnv ) ) {
		hosts.push( 'woocommerce.test' );
	}

	return hosts;
}

function addWooMobileLoginAuthMissingQuery( url ) {
	url.search = '';
	url.searchParams.set( WOO_MOBILE_LOGIN_AUTH_MISSING_QUERY, 'missing' );
	return url.toString();
}

function getDefaultWooMobileLoginFallbackUrl() {
	const fallbackUrl =
		calypsoEnv === 'development'
			? WOO_MOBILE_LOGIN_LOCAL_FALLBACK_URL
			: WOO_MOBILE_LOGIN_FALLBACK_URL;

	return addWooMobileLoginAuthMissingQuery( new URL( fallbackUrl ) );
}

function getWooMobileLoginFallbackUrl( req ) {
	const returnTo = req.query?.[ WOO_MOBILE_LOGIN_RETURN_TO_QUERY ];

	if ( typeof returnTo !== 'string' ) {
		return getDefaultWooMobileLoginFallbackUrl();
	}

	try {
		const url = new URL( returnTo );
		const pathname = url.pathname.endsWith( '/' ) ? url.pathname : `${ url.pathname }/`;

		if (
			url.protocol !== 'https:' ||
			url.port !== '' ||
			pathname !== '/mobilelogin/' ||
			! getAllowedWooMobileLoginHosts().includes( url.hostname )
		) {
			return getDefaultWooMobileLoginFallbackUrl();
		}

		url.pathname = '/mobilelogin/';
		return addWooMobileLoginAuthMissingQuery( url );
	} catch {
		return getDefaultWooMobileLoginFallbackUrl();
	}
}

function maybeRedirectWooMobileLoginFallback( req, res ) {
	if ( ! isWooCommerceQrLoginRequest( req ) ) {
		return false;
	}

	res.redirect( getWooMobileLoginFallbackUrl( req ) );
	return true;
}

function maybeRedirectWooMobileLoginCleanUrl( req, res ) {
	if (
		! isWooCommerceQrLoginRequest( req ) ||
		typeof req.query?.[ WOO_MOBILE_LOGIN_RETURN_TO_QUERY ] !== 'string'
	) {
		return false;
	}

	const cleanQuery = { ...req.query };
	delete cleanQuery[ WOO_MOBILE_LOGIN_RETURN_TO_QUERY ];

	const queryString = stringify( cleanQuery );
	res.redirect( queryString ? `${ req.path }?${ queryString }` : req.path );
	return true;
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
		'dashboard-development',
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
		store: reduxStore,
		target: 'evergreen',
		useTranslationChunks:
			config.isEnabled( 'use-translation-chunks' ) ||
			flags.includes( 'use-translation-chunks' ) ||
			request.query.hasOwnProperty( 'useTranslationChunks' ),
		showGdprBanner,
		showStepContainerV2Loader: isInStepContainerV2FlowContext( request.path, request.query ),
		dashboard: getDashboardFromHostname( request.hostname ),
	} );

	context.app = {
		// use ipv4 address when is ipv4 mapped address
		clientIp: request.ip ? request.ip.replace( '::ffff:', '' ) : request.ip,
		isFirefox: request.useragent.browser === 'Firefox',
		isWpMobileApp: isWpMobileApp( request.useragent.source ),
		isWcMobileApp: isWcMobileApp( request.useragent.source ),
		isDevelopmentEnv: devEnvironments.includes( calypsoEnv ),
		isDebug,
	};

	performanceMark( request.context, 'setup environments', true );
	if ( calypsoEnv === 'wpcalypso' ) {
		context.badge = calypsoEnv;
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

	if ( calypsoEnv === 'dashboard-horizon' ) {
		context.badge = 'dashboard-horizon';
		context.feedbackURL = 'https://github.com/Automattic/wp-calypso/issues/';
	}

	if ( calypsoEnv === 'dashboard-stage' ) {
		context.badge = 'dashboard-staging';
		context.feedbackURL = 'https://github.com/Automattic/wp-calypso/issues/';
	}

	if ( calypsoEnv === 'dashboard-development' ) {
		context.badge = 'dashboard-dev';
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
			if ( maybeRedirectWooMobileLoginFallback( req, res ) ) {
				return;
			}

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
					if ( maybeRedirectWooMobileLoginFallback( req, res ) ) {
						throw error;
					}
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
			if (
				config.isEnabled( 'wpcom-user-bootstrap' ) &&
				maybeRedirectWooMobileLoginCleanUrl( req, res )
			) {
				return;
			}

			performanceMark( req.context, 'finish_logged_in_setup' );
			next();
		} )
		.catch( ( error ) => {
			performanceMark( req.context, 'err_logged_in_setup' );
			next( error );
		} );
}

/**
 * Sets up a Content Security Policy header for all Calypso routes
 *
 * This CSP is currently in REPORT-ONLY mode, which means violations are logged but not blocked.
 * This allows us to identify issues before enforcing the policy.
 *
 * Required for compliance on pages handling credit card information.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next a callback to call when done
 */
function setUpCSP( req, res, next ) {
	// CSP is now applied to all routes for security compliance (previously only /log-in*).
	// This is necessary because Calypso is an SPA - the initial page load's CSP applies
	// to the entire session, so we need CSP protection on all entry points, especially
	// pages that handle credit card information (checkout, payment methods, billing).

	req.context.inlineScriptNonce = crypto.randomBytes( 48 ).toString( 'hex' );

	const policy = {
		'default-src': [ "'self'" ],
		'script-src': [
			"'self'",
			"'report-sample'",
			// Allow eval only in development for webpack's eval-based source maps (devtool: 'eval')
			// which enable fast rebuilds and hot module reloading. Production uses 'hidden-source-map'
			// which doesn't require eval, maintaining strict CSP in production environments.
			...( req.context.app.isDevelopmentEnv ? [ "'unsafe-eval'" ] : [] ),
			`'nonce-${ req.context.inlineScriptNonce }'`,
			'stats.wp.com',
			'https://widgets.wp.com',
			'*.wordpress.com',
			'https://apis.google.com',
			'https://appleid.cdn-apple.com',
			'www.google-analytics.com',
			'use.typekit.net',
			// Payment provider scripts (required for credit card processing)
			'js.stripe.com', // Stripe payment processing
			'js.verygoodvault.com', // VGS for EBANX credit card tokenization
			'www.paypal.com', // PayPal SDK
			'www.paypalobjects.com', // PayPal assets
			'cdn.siftscience.com', // Sift Science fraud detection for checkout
			// User feedback and support tools
			'survey.survicate.com', // Survicate survey tool
			'surveys-static-prd.survicate-cdn.com', // Survicate CDN
			'https://cdn.smooch.io', // Smooch/Sunshine Conversations (Zendesk messaging)
			'https://static.zdassets.com', // Zendesk static assets
			'*.zendesk.com', // Zendesk support scripts (Faye/Bayeux endpoints)
			// Google static content
			'https://www.gstatic.com', // Google Charts and other static content
			// Advertising and analytics tracking scripts
			'https://static.ads-twitter.com', // Twitter/X advertising tag
			'https://connect.facebook.net', // Facebook Pixel
			'https://snap.licdn.com', // LinkedIn analytics
			'www.redditstatic.com', // Reddit tracking pixel
			'https://analytics.tiktok.com', // TikTok tracking pixel
			'https://bzrcdn.openai.com/', // OpenAI tracking pixel
			'https://bzr.openai.com/', // OpenAI tracking pixel
			'https://a.quora.com', // Quora tracking pixel.
			'www.googletagmanager.com',
			'https://accounts.google.com',
			'https://bat.bing.com', // Bing Ads JS
			'https://blackbox-api.wp.com', // Blackbox bot detection
		],
		'base-uri': [ "'none'" ],
		'style-src': [
			"'self'",
			'*.wp.com',
			'https://fonts.googleapis.com',
			'use.typekit.net',
			'surveys-static-prd.survicate-cdn.com', // Survicate survey styles
			'https://cdn.smooch.io', // Smooch/Sunshine Conversations styles
			'https://www.gstatic.com', // Google Charts styles
			// per https://helpx.adobe.com/ca/fonts/using/content-security-policy.html
			"'unsafe-inline'",
		],
		'form-action': [ "'self'" ],
		'object-src': [ "'none'" ],
		'img-src': [
			"'self'",
			'data:', // data: URI scheme (e.g., data:image/svg+xml;base64,...)
			'*.wp.com',
			'*.wp.org',
			'https://wordpress.com', // WordPress.com assets (mu-plugins, etc.)
			'*.wordpress.com',
			'*.files.wordpress.com',
			'*.gravatar.com',
			'https://cdn.bsky.app', // Bluesky avatars + post images (Reader ATmosphere)
			'https://video.bsky.app', // Bluesky video thumbnails (Reader ATmosphere video posters)
			'https://video.cdn.bsky.app', // Bluesky video CDN (thumbnail URLs 302-redirect here)
			'https://t.co', // Twitter image links
			'https://www.google-analytics.com',
			'*.doubleclick.net', // Google DoubleClick tracking pixels (ad.doubleclick.net, *.fls.doubleclick.net, etc.)
			'https://analytics.twitter.com', // Twitter/X analytics tracking pixels
			'https://www.facebook.com', // Facebook Pixel tracking endpoint
			'https://alb.reddit.com', // Reddit tracking pixel
			'https://*.google.com', // Google Ads remarketing pixels (www.google.com and subdomains)
			'https://*.google.com.my',
			'https://*.google.co.uk', // Google Ads remarketing pixels (United Kingdom)
			'https://*.google.de', // Google Ads remarketing pixels (Germany)
			'https://*.google.fr', // Google Ads remarketing pixels (France)
			'https://*.google.es', // Google Ads remarketing pixels (Spain)
			'https://*.google.it', // Google Ads remarketing pixels (Italy)
			'https://*.google.ca', // Google Ads remarketing pixels (Canada)
			'https://*.google.com.au', // Google Ads remarketing pixels (Australia)
			'https://*.google.co.jp', // Google Ads remarketing pixels (Japan)
			'https://*.google.com.br', // Google Ads remarketing pixels (Brazil)
			'https://*.google.com.pk', // Google Ads remarketing pixels (Pakistan)
			'https://*.google.co.in', // Google Ads remarketing pixels (India)
			'https://*.google.com.mx', // Google Ads remarketing pixels (Mexico)
			'https://*.google.nl', // Google Ads remarketing pixels (Netherlands)
			'https://*.google.co.id', // Google Ads remarketing pixels (Indonesia)
			'https://*.google.cd', // Google Ads remarketing pixels (Congo)
			'https://*.google.lu', // Google Ads remarketing pixels (Luxembourg)
			'https://*.google.com.tr', // Google Ads remarketing pixels (Turkey)
			'https://*.google.sm', // Google Ads remarketing pixels (San Marino)
			'https://*.google.com.ng', // Google Ads remarketing pixels (Nigeria)
			'https://*.google.co.ma', // Google Ads remarketing pixels (Morocco)
			'https://gravatar.com', // Gravatar assets (root domain)
			'https://linkmaker.itunes.apple.com', // Apple App Store badges
			'https://cdn.smooch.io', // Smooch/Sunshine Conversations images
			'https://bat.bing.com', // Bing Ads tracking pixel
			'https://amplifypixel.outbrain.com',
			'https://hexagon-analytics.com', // Hexagon analytics tracking pixels
			'https://img.youtube.com',
			'*.ads.linkedin.com',
			'https://ps.w.org', // WordPress.org plugin directory (plugin icons)
			'https://ts.w.org', // WordPress.org theme directory (theme screenshots)
			'https://s.w.org', // WordPress.org static assets (SVG icons, etc.)
			'https://woocommerce.com', // WooCommerce marketplace
			'localhost:8888',
			'p.typekit.net',
			'https://q.quora.com', //Quora tracking pixel image.
		],
		'frame-src': [
			"'self'",
			'https://public-api.wordpress.com',
			'https://accounts.google.com/',
			'https://www.googletagmanager.com', // Google Tag Manager iframes
			'https://jetpack.com',
			'*.doubleclick.net', // Google DoubleClick tracking pixels (ad.doubleclick.net, *.fls.doubleclick.net, etc.)
			'*.wordpress.com', // User WordPress.com sites (site previews, embeds)
			// Payment provider iframes (secure card input elements)
			'js.stripe.com', // Stripe Elements iframes
			'*.stripe.com', // Stripe 3D Secure and other payment flows
			'*.verygoodsecurity.com', // VGS Collect secure iframes
			'www.paypal.com', // PayPal checkout flow
			'*.paypal.com', // PayPal additional flows
			'https://blackbox-api.wp.com', // Blackbox iframe transport
		],
		'font-src': [
			"'self'",
			'*.wp.com',
			'https://fonts.gstatic.com',
			'use.typekit.net',
			'https://woocommerce.com',
			'surveys-static-prd.survicate-cdn.com', // Survicate fonts
			'https://cdn.smooch.io', // Smooch/Sunshine Conversations fonts
			'data:', // should remove 'data:' ASAP
		],
		'media-src': [
			"'self'",
			// hls.js attaches a MediaSource to the <video> element via a
			// runtime-generated blob: URL (the MediaSource object URL).
			// Without `blob:` here, browsers report — and would, once we
			// stop running CSP in Report-Only mode, block — Reader
			// ATmosphere video playback in non-Safari browsers.
			'blob:',
			'https://video.bsky.app', // Bluesky video manifests (Reader ATmosphere thread view, Safari native HLS path)
			'https://video.cdn.bsky.app', // Bluesky video CDN (segment URLs 302-redirect here)
		],
		'connect-src': [
			"'self'",
			'https://*.wordpress.com/',
			'wss://*.wordpress.com', // WebSocket connections (realtime API, notifications)
			'https://*.wp.com',
			'https://wordpress.com',
			'*.doubleclick.net', // Google DoubleClick tracking pixels (ad.doubleclick.net, *.fls.doubleclick.net, etc.)
			'https://api.wordpress.org', // WordPress.org API (plugin/theme info)
			'https://pixel.wp.com', // WordPress.com stats pixel
			'https://*.google.com',
			'www.google-analytics.com',
			'https://region1.google-analytics.com', // Google Analytics 4
			'https://www.googletagmanager.com', // Google Tag Manager
			'https://www.facebook.com', // Facebook Pixel tracking endpoint
			'https://bat.bing.com', // Bing Ads API
			'https://px.ads.linkedin.com', // LinkedIn ads pixel
			'https://survey.survicate.com', // Survicate API
			'*.sentry.io',
			'*.reddit.com',
			'https://video.bsky.app', // Bluesky video manifests (hls.js fetches the HLS playlist for Reader ATmosphere thread view)
			'https://video.cdn.bsky.app', // Bluesky video CDN (segment URLs 302-redirect here)
			'https://analytics.tiktok.com', // TikTok tracking pixel
			'https://a.quora.com', //Quora tracking pixel
			// Payment provider APIs (for tokenization and payment processing)
			'*.stripe.com', // Stripe API calls
			'api.stripe.com', // Stripe API endpoint
			'*.verygoodsecurity.com', // VGS API calls
			'*.paypal.com', // PayPal API calls
			// Support and feedback tools
			'*.zendesk.com', // Zendesk support chat
			'wss://*.zendesk.com', // Zendesk WebSocket connections
			'https://ekr.zdassets.com', // Zendesk composer
			'https://*.config.smooch.io', // Smooch/Sunshine Conversations config
			'https://bzr.openai.com', // OpenAI Ads tracking pixel
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

	if ( ! req.context.isLoggedIn && maybeRedirectWooMobileLoginFallback( req, res ) ) {
		return;
	}

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

const setNotFoundStatus = ( req, res, next ) => {
	res.status( 404 );
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

// Each dashboard variant is an SPA served on its own hosts. A variant declares:
//   definition/entrypoint — the section + webpack entry to render
//   paths                 — section paths the variant renders itself
//   devEnv                — the local dev env (besides the dashboard envs) that
//                           also serves this variant, e.g. under `yarn start`
//   isAllowedHostname     — hostnames the variant owns
//   extraMiddleware       — middleware appended to the render chain
//   redirects             — paths the variant does NOT serve and sends elsewhere
const DASHBOARD_VARIANTS = [
	{
		name: 'dotcom',
		definition: DOTCOM_DASHBOARD_SECTION_DEFINITION,
		paths: DOTCOM_DASHBOARD_SECTION_PATHS,
		entrypoint: 'entry-dashboard-dotcom',
		devEnv: 'development',
		isAllowedHostname: isAllowedDotcomDashboardHostname,
		extraMiddleware: [ loadDashboardLocaleData ],
		// my.wordpress.com has no login page of its own; send /log-in to WordPress.com.
		redirects: [ { path: '/log-in', target: ( req ) => config( 'wpcom_url' ) + req.originalUrl } ],
	},
	{
		name: 'ciab',
		definition: CIAB_DASHBOARD_SECTION_DEFINITION,
		paths: CIAB_DASHBOARD_SECTION_PATHS,
		entrypoint: 'entry-dashboard-ciab',
		devEnv: 'development',
		isAllowedHostname: isAllowedCiabDashboardHostname,
		extraMiddleware: [ loadDashboardLocaleData ],
		redirects: [],
	},
	{
		name: 'a4a',
		definition: A4A_DASHBOARD_SECTION_DEFINITION,
		paths: A4A_DASHBOARD_SECTION_PATHS,
		entrypoint: 'entry-dashboard-a4a',
		devEnv: 'a8c-for-agencies-development',
		isAllowedHostname: isAllowedA4ADashboardHostname,
		extraMiddleware: [],
		redirects: [],
	},
];

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
		if ( config.isEnabled( 'stats' ) ) {
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
		const siteSlug = req.params?.site ?? '';
		const newRoute = '/customize/menus/' + siteSlug;
		res.redirect( 301, newRoute );
	} );

	app.get( [ '/start/domain-first' ], function ( req, res ) {
		let redirectUrl = '/start/domain';
		const domain = req?.query?.new ?? false;
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
				action: req?.params?.action ?? 'unknown-action',
				query: req?.query ?? {},
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
				const activeFlags = data?.meta?.data?.flags?.active_flags ?? [];

				// A8C check
				if (
					! ( Array.isArray( activeFlags ) && activeFlags.includes( 'calypso_support_user' ) )
				) {
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

// A thin, intent-revealing layer over the Express app. Section rendering,
// host-scoped redirects, and the 404 shell all go through here so the SSR
// middleware chain and the env/host gating are written once, not copied per
// route. `table()` registers a declarative list of routes in match order.
function createRouteRegistry( app ) {
	const asRegExp = ( route ) => ( route instanceof RegExp ? route : pathToRegExp( route ) );

	// Render `sectionDef` for each path. `isAllowedHost` (req => bool) scopes the route to
	// matching hostnames; other hosts fall through (next('route')). `notFound`
	// serves the shell with a 404 status so the client renders its own page.
	const section = (
		sectionDef,
		paths,
		{ entrypoint, isAllowedHost, middleware = [], notFound = false } = {}
	) => {
		const extra = notFound
			? [ setNotFoundStatus, ...[].concat( middleware ) ]
			: [].concat( middleware );
		[].concat( paths ).forEach( ( route ) => {
			const pathRegex = asRegExp( route );
			app.get(
				pathRegex,
				( req, res, next ) =>
					! isAllowedHost || isAllowedHost( req ) ? next() : next( 'route' ),
				setupDefaultContext( entrypoint, sectionDef.name ),
				setUpSectionContext( sectionDef, entrypoint ),
				// Skip the rest of the chain for logged-out isomorphic sections; the
				// serverRouter (SSR pipeline) resolves those. See serverRouter for details.
				( req, res, next ) => {
					if ( ! req.context.isLoggedIn && sectionDef.isomorphic ) {
						return next( 'route' );
					}
					debug( `Using non-SSR pipeline for path ${ req.path } with handler ${ pathRegex }` );
					next();
				},
				setUpRoute, // For SSR requests, this will happen in the serverRouter.
				...extra,
				serverRender
			);
		} );
	};

	// Redirect each path to `target(req)`. `isAllowedHost` scopes it; other hosts fall through.
	const redirect = ( paths, target, { isAllowedHost, status } = {} ) => {
		[].concat( paths ).forEach( ( route ) => {
			app.get( asRegExp( route ), ( req, res, next ) => {
				if ( isAllowedHost && ! isAllowedHost( req ) ) {
					return next( 'route' );
				}
				return status ? res.redirect( status, target( req ) ) : res.redirect( target( req ) );
			} );
		} );
	};

	// Register a declarative table of routes in Express match order. Each row states
	// who handles a path:
	//   when          – env predicate; the row is skipped entirely when it returns false
	//   isAllowedHost – request-time host predicate; non-matching hosts fall through
	//   render        – section definition to render ( with entry / middleware / notFound )
	//   redirect      – target(req) to redirect to ( with optional status )
	const table = ( rows ) =>
		rows.forEach( ( row ) => {
			if ( row.when && ! row.when() ) {
				return;
			}
			if ( row.redirect ) {
				redirect( row.path, row.redirect, {
					isAllowedHost: row.isAllowedHost,
					status: row.status,
				} );
			} else {
				section( row.render, row.path, {
					entrypoint: row.entry,
					isAllowedHost: row.isAllowedHost,
					middleware: row.middleware,
					notFound: row.notFound,
				} );
			}
		} );

	return { section, redirect, table };
}

// Environment predicates — does THIS server register the route at all?
const inDashboardOrDevEnv = ( devEnv ) => isDashboardEnv() || calypsoEnv === devEnv;
const dashboardVariantEnabled = ( variant ) => inDashboardOrDevEnv( variant.devEnv );

// Host predicates — at request time, does this hostname belong to the route?
const isA4ADashboardHost = ( req ) => isAllowedA4ADashboardHostname( req.hostname );
const isAllowedDashboardRequest = ( req ) =>
	isAllowedDashboardRoute( { hostname: req.hostname, path: req.path } );

export default function pages() {
	const app = express();

	app.set( 'views', __dirname );

	app.use( logSectionResponse );
	app.use( cookieParser() );
	app.use( middlewareAssets() );
	app.use( middlewareCache() );
	app.use( setupLoggedInContext );
	app.use( middlewareUnsupportedBrowser() );

	if ( ! ( isJetpackCloud() || isA8CForAgencies() || isDashboardEnv() ) ) {
		wpcomPages( app );
	}

	const routes = createRouteRegistry( app );

	// ── Dashboard host routing ─────────────────────────────────────────────────
	// The dashboard is served on dedicated hosts (dotcom → my.wordpress.com, plus
	// ciab and a4a) as SPA variants (see DASHBOARD_VARIANTS). The table below is the
	// full render/redirect policy for those hosts. Read each row as: which env
	// registers it (when), which hostname it serves (isAllowedHost), and what it does —
	// render a section, or redirect a path the host has no page for. Rows are
	// registered before the shared Calypso sections and login section that follow,
	// so a host-scoped row wins the match; non-matching hosts fall through. The
	// not-found catch-all is registered separately, after the login section.
	const signupSection = sections.find( ( s ) => s.name === 'signup' );
	const checkoutSection = sections.find( ( s ) => s.name === 'checkout' );
	const a4aSignupSection = sections.find( ( s ) => s.name === 'a8c-for-agencies-signup' );
	const inDotcomEnv = () => inDashboardOrDevEnv( 'development' );
	const inA4AEnv = () => inDashboardOrDevEnv( 'a8c-for-agencies-development' );

	routes.table( [
		// Classic Calypso sections that are also exposed on dashboard hosts.
		{
			path: '/start',
			when: inDotcomEnv,
			isAllowedHost: isAllowedDashboardRequest,
			render: signupSection,
		},
		{
			path: '/checkout',
			when: inDotcomEnv,
			isAllowedHost: isAllowedDashboardRequest,
			render: checkoutSection,
		},
		{
			path: '/setup',
			when: inDotcomEnv,
			isAllowedHost: isAllowedDashboardRequest,
			render: STEPPER_SECTION_DEFINITION,
			entry: 'entry-stepper',
		},
		{
			path: A4A_SIGNUP_PATHS,
			when: inA4AEnv,
			isAllowedHost: isA4ADashboardHost,
			render: a4aSignupSection,
		},
		// Each dashboard variant renders its own SPA section paths...
		...DASHBOARD_VARIANTS.map( ( variant ) => ( {
			path: variant.paths,
			when: () => dashboardVariantEnabled( variant ),
			isAllowedHost: ( req ) => variant.isAllowedHostname( req.hostname ),
			render: variant.definition,
			entry: variant.entrypoint,
			middleware: variant.extraMiddleware,
		} ) ),
		// ...and redirects any path it has no page for (e.g. dotcom has no /log-in).
		...DASHBOARD_VARIANTS.flatMap( ( variant ) =>
			variant.redirects.map( ( r ) => ( {
				path: r.path,
				when: () => dashboardVariantEnabled( variant ),
				isAllowedHost: ( req ) => variant.isAllowedHostname( req.hostname ),
				redirect: r.target,
			} ) )
		),
	] );

	sections
		.filter( ( section ) => ! section.envId || section.envId.indexOf( config( 'env_id' ) ) > -1 )
		.filter( isSectionEnabled )
		.forEach( ( section ) => {
			routes.section( section, section.paths );

			if ( section.isomorphic ) {
				// section.load() uses require on the server side so we also need to access the
				// default export of it. See build-tools/webpack/sections-loader.js
				// TODO: section initialization is async function since #28301. At the moment when
				// some isomorphic section really starts doing something async, we should start
				// awaiting the result here. Will be solved together with server-side dynamic reducers.
				section.load().default( serverRouter( app, setUpRoute, section ) );
			}
		} );

	// Login is served on every host. The dashboard table above already intercepts
	// /log-in on hosts that redirect it (dotcom); other hosts fall through to here.
	routes.section( LOGIN_SECTION_DEFINITION, '/log-in', { entrypoint: 'entry-login' } );
	loginRouter( serverRouter( app, setUpRoute, null ) );

	// Register CSP report route
	registerCspReportRoute( app );

	// The dashboard server is self-contained: any otherwise-unmatched path on a
	// dashboard host serves the SPA shell with a 404 status (so the client renders
	// its own not-found page), then returns without the classic Calypso routes.
	if ( isDashboardEnv() ) {
		routes.table(
			DASHBOARD_VARIANTS.map( ( variant ) => ( {
				path: /.*/,
				isAllowedHost: ( req ) => variant.isAllowedHostname( req.hostname ),
				render: variant.definition,
				entry: variant.entrypoint,
				middleware: variant.extraMiddleware,
				notFound: true,
			} ) )
		);

		return app;
	}

	routes.section( STEPPER_SECTION_DEFINITION, '/setup', { entrypoint: 'entry-stepper' } );
	routes.section( SUBSCRIPTIONS_SECTION_DEFINITION, '/subscriptions', {
		entrypoint: 'entry-subscriptions',
	} );

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

	// Redirect legacy `/help` routes to `sites?help-center=home` if logged in, otherwise `/support`
	// Note: isLoggedIn will only work under *.wordpress.com domains (wpcalypso, horizon, and prod)
	app.get( [ '/me/chat', '/help', '/help/*' ], ( req, res ) => {
		if ( req.context.isLoggedIn ) {
			return res.redirect( 301, '/sites?help-center=home' );
		}
		const redirectUrl = localizeUrl( `https://wordpress.com/support`, req.context.locale );
		return res.redirect( 301, redirectUrl );
	} );
	// catchall to render 404 for all routes not explicitly allowed in client/sections
	app.use( render404() );

	// Error handling middleware for displaying the server error 500 page must be the very last middleware defined
	app.use( renderServerError() );

	return app;
}
