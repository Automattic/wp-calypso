/** @format */
/**
 * External dependencies
 */
import express from 'express';
import fs from 'fs';
import path from 'path';
import qs from 'qs';
import { execSync } from 'child_process';
import cookieParser from 'cookie-parser';
import debugFactory from 'debug';
import { get, forEach, intersection } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import sanitize from 'sanitize';
import utils from 'bundler/utils';
import sectionsModule from '../../client/sections';
import { serverRouter } from 'isomorphic-routing';
import { serverRender, serverRenderError } from 'render';
import { createReduxStore } from 'state';
import { LOCALE_SET } from 'state/action-types';
import { login } from 'lib/paths';
import { logSectionResponseTime } from './analytics';

const debug = debugFactory( 'calypso:pages' );

const SERVER_BASE_PATH = '/public';
const calypsoEnv = config( 'env_id' );

const staticFiles = [
	{ path: 'style.css' },
	{ path: 'editor.css' },
	{ path: 'tinymce/skins/wordpress/wp-content.css' },
	{ path: 'style-debug.css' },
	{ path: 'style-rtl.css' },
	{ path: 'style-debug-rtl.css' },
];

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

const sections = sectionsModule.get();

const ASSETS_PATH = path.join( __dirname, '../', 'bundler', 'assets.json' );
const getAssets = ( () => {
	let assets;
	return () => {
		if ( ! assets ) {
			assets = JSON.parse( fs.readFileSync( ASSETS_PATH, 'utf8' ) );
		}
		return assets;
	};
} )();

/**
 * Generate an object that maps asset names name to a server-relative urls.
 * Assets in request and static files are included.
 *
 * @returns {Object} Map of asset names to urls
 **/
function generateStaticUrls() {
	const urls = { ...staticFilesUrls };
	const assets = getAssets();

	forEach( assets, ( asset, name ) => {
		urls[ name ] = asset.js;
	} );

	return urls;
}

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
 * @return {Array} An array of language codes in the header, all in lowercase.
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

function getDefaultContext( request ) {
	const bodyClasses = [];
	const geoLocation = ( request.headers[ 'x-geoip-country-code' ] || '' ).toLowerCase();
	const isDebug = calypsoEnv === 'development' || request.query.debug !== undefined;
	let sectionCss;

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

	if ( request.context && request.context.sectionCss ) {
		sectionCss = {
			id: request.context.sectionCss,
			urls: utils.getCssUrls( request.context.sectionCss ),
		};
	}

	const shouldUseSingleCDN =
		config.isEnabled( 'try/single-cdn' ) && !! request.query.enableSingleCDN;

	const context = Object.assign( {}, request.context, {
		compileDebug: config( 'env' ) === 'development' ? true : false,
		urls: generateStaticUrls(),
		user: false,
		env: calypsoEnv,
		sanitize: sanitize,
		isRTL: config( 'rtl' ),
		isDebug,
		badge: false,
		lang: config( 'i18n_default_locale_slug' ),
		jsFile: 'build',
		faviconURL: shouldUseSingleCDN ? '//s0.wp.com/i/favicon.ico' : '//s1.wp.com/i/favicon.ico',
		isFluidWidth: !! config.isEnabled( 'fluid-width' ),
		abTestHelper: !! config.isEnabled( 'dev/test-helper' ),
		devDocsURL: '/devdocs',
		store: createReduxStore( {} ),
		shouldUsePreconnect: config.isEnabled( 'try/preconnect' ) && !! request.query.enablePreconnect,
		shouldUsePreconnectGoogle:
			config.isEnabled( 'try/preconnect' ) && !! request.query.enablePreconnectGoogle,
		shouldUseScriptPreload:
			config.isEnabled( 'try/preload' ) && !! request.query.enableScriptPreload,
		shouldUseStylePreloadCommon:
			config.isEnabled( 'try/preload' ) && !! request.query.enableStylePreloadCommon,
		shouldUseStylePreloadExternal:
			config.isEnabled( 'try/preload' ) && !! request.query.enableStylePreloadExternal,
		shouldUseStylePreloadSection:
			config.isEnabled( 'try/preload' ) && !! request.query.enableStylePreloadSection,
		shouldUseSingleCDN,
		bodyClasses,
		sectionCss,
	} );

	context.app = {
		// use ipv4 address when is ipv4 mapped address
		clientIp: request.ip ? request.ip.replace( '::ffff:', '' ) : request.ip,
		isDebug: context.env === 'development' || context.isDebug,
		staticUrls: staticFilesUrls,
	};

	if ( calypsoEnv === 'wpcalypso' ) {
		context.badge = calypsoEnv;
		context.devDocs = true;
		context.feedbackURL = 'https://github.com/Automattic/wp-calypso/issues/';
		context.faviconURL = '/calypso/images/favicons/favicon-wpcalypso.ico';
	}

	if ( calypsoEnv === 'horizon' ) {
		context.badge = 'feedback';
		context.feedbackURL = 'https://horizonfeedback.wordpress.com/';
		context.faviconURL = '/calypso/images/favicons/favicon-horizon.ico';
	}

	if ( calypsoEnv === 'stage' ) {
		context.badge = 'staging';
		context.feedbackURL = 'https://github.com/Automattic/wp-calypso/issues/';
		context.faviconURL = '/calypso/images/favicons/favicon-staging.ico';
	}

	if ( calypsoEnv === 'development' ) {
		context.badge = 'dev';
		context.devDocs = true;
		context.feedbackURL = 'https://github.com/Automattic/wp-calypso/issues/';
		context.faviconURL = '/calypso/images/favicons/favicon-development.ico';
		context.branchName = getCurrentBranchName();
		context.commitChecksum = getCurrentCommitShortChecksum();
	}

	return context;
}

function setUpLoggedOutRoute( req, res, next ) {
	req.context = getDefaultContext( req );
	res.set( {
		'X-Frame-Options': 'SAMEORIGIN',
	} );

	next();
}

function setUpLoggedInRoute( req, res, next ) {
	let redirectUrl, protocol, start;

	res.set( {
		'X-Frame-Options': 'SAMEORIGIN',
	} );

	const context = getDefaultContext( req );

	if ( config.isEnabled( 'wpcom-user-bootstrap' ) ) {
		const user = require( 'user-bootstrap' );

		protocol = req.get( 'X-Forwarded-Proto' ) === 'https' ? 'https' : 'http';

		redirectUrl = login( {
			isNative: config.isEnabled( 'login/native-login-links' ),
			redirectTo: protocol + '://' + config( 'hostname' ) + req.originalUrl,
		} );

		// if we don't have a wordpress cookie, we know the user needs to
		// authenticate
		if ( ! req.cookies.wordpress_logged_in ) {
			debug( 'User not logged in. Redirecting to %s', redirectUrl );
			res.redirect( redirectUrl );
			return;
		}
		start = new Date().getTime();

		debug( 'Issuing API call to fetch user object' );
		user( req.cookies.wordpress_logged_in, function( error, data ) {
			let searchParam, errorMessage;

			if ( error ) {
				if ( error.error === 'authorization_required' ) {
					debug( 'User public API authorization required. Redirecting to %s', redirectUrl );
					res.clearCookie( 'wordpress_logged_in', {
						path: '/',
						httpOnly: true,
						domain: '.wordpress.com',
					} );
					res.redirect( redirectUrl );
				} else {
					if ( error.error ) {
						errorMessage = error.error + ' ' + error.message;
					} else {
						errorMessage = error.message;
					}

					console.log( 'API Error: ' + errorMessage );

					next( error );
				}

				return;
			}

			const end = new Date().getTime() - start;

			debug( 'Rendering with bootstrapped user object. Fetched in %d ms', end );
			context.user = data;

			if ( data.localeSlug ) {
				context.lang = data.localeSlug;
				context.store.dispatch( {
					type: LOCALE_SET,
					localeSlug: data.localeSlug,
				} );
			}

			if ( req.path === '/' && req.query ) {
				searchParam = req.query.s || req.query.q;
				if ( searchParam ) {
					res.redirect(
						'https://' +
							context.lang +
							'.search.wordpress.com/?q=' +
							encodeURIComponent( searchParam )
					);
					return;
				}

				if ( req.query.newuseremail ) {
					debug( 'Detected legacy email verification action. Redirecting...' );
					res.redirect( 'https://wordpress.com/verify-email/?' + qs.stringify( req.query ) );
					return;
				}

				if ( req.query.action === 'wpcom-invite-users' ) {
					debug( 'Detected legacy invite acceptance action. Redirecting...' );
					res.redirect( 'https://wordpress.com/accept-invite/?' + qs.stringify( req.query ) );
					return;
				}
			}

			req.context = context;

			next();
		} );
	} else {
		req.context = context;
		next();
	}
}

function setUpRoute( req, res, next ) {
	if ( req.cookies.wordpress_logged_in ) {
		// the user is probably logged in
		setUpLoggedInRoute( req, res, next );
	} else {
		setUpLoggedOutRoute( req, res, next );
	}
}

function render404( request, response ) {
	response.status( 404 ).render( '404', {
		urls: generateStaticUrls(),
	} );
}

module.exports = function() {
	const app = express();

	app.set( 'views', __dirname );

	app.use( logSectionResponseTime );
	app.use( cookieParser() );

	// redirect homepage if the Reader is disabled
	app.get( '/', function( request, response, next ) {
		if ( ! config.isEnabled( 'reader' ) ) {
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
			redirectUrl = req.originalUrl.replace(
				/^\/sites\/[0-9a-zA-Z\-\.]+\/change\-theme/,
				'/themes'
			);
		} else {
			redirectUrl = req.originalUrl.replace(
				/^\/sites\/[0-9a-zA-Z\-\.]+\/\w+/,
				'/' + req.params.section + '/' + req.params.site
			);
		}
		res.redirect( redirectUrl );
	} );

	if ( config( 'env' ) !== 'development' ) {
		app.get( '/discover', function( req, res, next ) {
			if ( ! req.cookies.wordpress_logged_in ) {
				res.redirect( config( 'discover_logged_out_redirect_url' ) );
			} else {
				next();
			}
		} );

		// redirect logged-out tag pages to en.wordpress.com
		app.get( '/tag/:tag_slug', function( req, res, next ) {
			if ( ! req.cookies.wordpress_logged_in ) {
				res.redirect( 'https://en.wordpress.com/tag/' + encodeURIComponent( req.params.tag_slug ) );
			} else {
				next();
			}
		} );

		// redirect logged-out searches to en.search.wordpress.com
		app.get( '/read/search', function( req, res, next ) {
			if ( ! req.cookies.wordpress_logged_in ) {
				res.redirect( 'https://en.search.wordpress.com/?q=' + encodeURIComponent( req.query.q ) );
			} else {
				next();
			}
		} );

		app.get( '/plans', function( req, res, next ) {
			if ( ! req.cookies.wordpress_logged_in ) {
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

	sections
		.filter( section => ! section.envId || section.envId.indexOf( config( 'env_id' ) ) > -1 )
		.forEach( section => {
			section.paths.forEach( sectionPath => {
				const pathRegex = utils.pathToRegExp( sectionPath );

				app.get( pathRegex, function( req, res, next ) {
					req.context = Object.assign( {}, req.context, { sectionName: section.name } );

					if ( config.isEnabled( 'code-splitting' ) ) {
						req.context.chunk = section.name;
					}

					if ( section.secondary && req.context ) {
						req.context.hasSecondary = true;
					}

					if ( section.group && req.context ) {
						req.context.sectionGroup = section.group;
					}

					if ( section.css && req.context ) {
						req.context.sectionCss = section.css;
					}

					next();
				} );

				if ( ! section.isomorphic ) {
					app.get(
						pathRegex,
						section.enableLoggedOut ? setUpRoute : setUpLoggedInRoute,
						serverRender
					);
				}
			} );

			if ( section.isomorphic ) {
				sectionsModule.require( section.module )( serverRouter( app, setUpRoute, section ) );
			}
		} );

	app.get( '/browsehappy', setUpRoute, function( req, res ) {
		const wpcomRe = /^https?:\/\/[A-z0-9_-]+\.wordpress\.com$/;
		const primaryBlogUrl = get( req, 'context.user.primary_blog_url', '' );
		const isWpcom = wpcomRe.test( primaryBlogUrl );
		const dashboardUrl = isWpcom
			? primaryBlogUrl + '/wp-admin'
			: 'https://dashboard.wordpress.com/wp-admin/';

		res.render( 'browsehappy', {
			...req.context,
			dashboardUrl,
		} );
	} );

	// catchall to render 404 for all routes not whitelisted in client/sections
	app.use( render404 );

	// Error handling middleware for displaying the server error 500 page must be the very last middleware defined
	app.use( serverRenderError );

	return app;
};
