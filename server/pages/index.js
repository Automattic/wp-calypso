/**
 * External dependencies
 */
import express from 'express';
import fs from 'fs';
import crypto from 'crypto';
import qs from 'qs';
import { execSync } from 'child_process';
import cookieParser from 'cookie-parser';
import debugFactory from 'debug';
import { get, pick } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import sanitize from 'sanitize';
import utils from 'bundler/utils';
import sectionsModule from '../../client/sections';
import { serverRouter } from 'isomorphic-routing';
import { serverRender } from 'render';
import stateCache from 'state-cache';
import { createReduxStore, reducer } from 'state';
import { DESERIALIZE } from 'state/action-types';

const debug = debugFactory( 'calypso:pages' );

const HASH_LENGTH = 10;
const URL_BASE_PATH = '/calypso';
const SERVER_BASE_PATH = '/public';
const calypsoEnv = config( 'env_id' );

const staticFiles = [
	{ path: 'style.css' },
	{ path: 'editor.css' },
	{ path: 'tinymce/skins/wordpress/wp-content.css' },
	{ path: 'style-debug.css' },
	{ path: 'style-rtl.css' }
];

const sections = sectionsModule.get();

function getInitialServerState( serializedServerState ) {
	// Bootstrapped state from a server-render
	const serverState = reducer( serializedServerState, { type: DESERIALIZE } );
	return pick( serverState, Object.keys( serializedServerState ) );
}

/**
 * Generates a hash of a files contents to be used as a version parameter on asset requests.
 * @param {String} path Path to file we want to hash
 * @returns {String} A shortened md5 hash of the contents of the file file or a timestamp in the case of failure.
 **/
function hashFile( path ) {
	const md5 = crypto.createHash( 'md5' );
	let data, hash;

	try {
		data = fs.readFileSync( path );
		md5.update( data );
		hash = md5.digest( 'hex' );
		hash = hash.slice( 0, HASH_LENGTH );
	} catch ( e ) {
		hash = new Date().getTime().toString();
	}

	return hash;
}

/**
 * Generate an object that maps asset names name to a server-relative urls.
 * Assets in request and static files are included.
 * @param {Object} request A request to check for assets
 * @returns {Object} Map of asset names to urls
 **/
function generateStaticUrls( request ) {
	const urls = {};

	function getUrl( filename, hash ) {
		return URL_BASE_PATH + '/' + filename + '?' + qs.stringify( {
			v: hash
		} );
	}

	staticFiles.forEach( function( file ) {
		if ( ! file.hash ) {
			file.hash = hashFile( process.cwd() + SERVER_BASE_PATH + '/' + file.path );
		}
		urls[ file.path ] = getUrl( file.path, file.hash );
	} );

	const assets = request.app.get( 'assets' );

	assets.forEach( function( asset ) {
		const name = asset.name;
		urls[ name ] = asset.url;
		if ( config( 'env' ) !== 'development' ) {
			urls[ name + '-min' ] = asset.url.replace( '.js', '.m.js' );
		}
	} );

	return urls;
}

function getCurrentBranchName() {
	try {
		return execSync( 'git rev-parse --abbrev-ref HEAD' ).toString().replace( /\s/gm, '' );
	} catch ( err ) {
		return undefined;
	}
}

function getCurrentCommitShortChecksum() {
	try {
		return execSync( 'git rev-parse --short HEAD' ).toString().replace( /\s/gm, '' );
	} catch ( err ) {
		return undefined;
	}
}

function getDefaultContext( request ) {
	// context.path is set to req.url, see server/isomorphic-routing#getEnhancedContext()
	const serializeCachedServerState = stateCache.get( request.url ) || {};
	const cachedServerState = reducer( getInitialServerState( serializeCachedServerState ), { type: DESERIALIZE } );

	const context = Object.assign( {}, request.context, {
		compileDebug: config( 'env' ) === 'development' ? true : false,
		urls: generateStaticUrls( request ),
		user: false,
		env: calypsoEnv,
		sanitize: sanitize,
		isRTL: config( 'rtl' ),
		isDebug: request.query.debug !== undefined ? true : false,
		badge: false,
		lang: config( 'i18n_default_locale_slug' ),
		jsFile: 'build',
		faviconURL: '//s1.wp.com/i/favicon.ico',
		isFluidWidth: !! config.isEnabled( 'fluid-width' ),
		abTestHelper: !! config.isEnabled( 'dev/test-helper' ),
		devDocsURL: '/devdocs',
		store: createReduxStore( cachedServerState )
	} );

	context.app = {
		// use ipv4 address when is ipv4 mapped address
		clientIp: request.ip ? request.ip.replace( '::ffff:', '' ) : request.ip,
		isDebug: context.env === 'development' || context.isDebug,
		tinymceWpSkin: context.urls[ 'tinymce/skins/wordpress/wp-content.css' ],
		tinymceEditorCss: context.urls[ 'editor.css' ]
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
		'X-Frame-Options': 'SAMEORIGIN'
	} );

	next();
}

function setUpLoggedInRoute( req, res, next ) {
	let redirectUrl, protocol, start;

	res.set( {
		'X-Frame-Options': 'SAMEORIGIN'
	} );

	const context = getDefaultContext( req );

	if ( config( 'wpcom_user_bootstrap' ) ) {
		const user = require( 'user-bootstrap' );

		protocol = req.get( 'X-Forwarded-Proto' ) === 'https' ? 'https' : 'http';

		redirectUrl = config( 'login_url' ) + '?' + qs.stringify( {
			redirect_to: protocol + '://' + config( 'hostname' ) + req.originalUrl
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
		user( req.get( 'Cookie' ), function( error, data ) {
			let searchParam, errorMessage;

			if ( error ) {
				if ( error.error === 'authorization_required' ) {
					debug( 'User public API authorization required. Redirecting to %s', redirectUrl );
					res.redirect( redirectUrl );
				} else {
					if ( error.error ) {
						errorMessage = error.error + ' ' + error.message;
					} else {
						errorMessage = error.message;
					}

					console.log( 'API Error: ' + errorMessage );

					res.status( 500 ).render( '500.jade', context );
				}

				return;
			}

			const end = ( new Date().getTime() ) - start;

			debug( 'Rendering with bootstrapped user object. Fetched in %d ms', end );
			context.user = data;
			context.isRTL = data.isRTL ? true : false;

			if ( data.localeSlug ) {
				context.lang = data.localeSlug;
			}

			if ( req.path === '/' && req.query ) {
				searchParam = req.query.s || req.query.q;
				if ( searchParam ) {
					res.redirect( 'https://' + context.lang + '.search.wordpress.com/?q=' + encodeURIComponent( searchParam ) );
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
	response.status( 404 ).render( '404.jade', {
		urls: generateStaticUrls( request )
	} );
}

module.exports = function() {
	const app = express();

	app.set( 'views', __dirname );

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
		const redirectedSections = [ 'posts', 'pages', 'sharing', 'upgrade', 'checkout', 'change-theme' ];
		let redirectUrl;

		if ( -1 === redirectedSections.indexOf( req.params.section ) ) {
			next();
			return;
		}
		if ( 'change-theme' === req.params.section ) {
			redirectUrl = req.originalUrl.replace( /^\/sites\/[0-9a-zA-Z\-\.]+\/change\-theme/, '/themes' );
		} else {
			redirectUrl = req.originalUrl.replace( /^\/sites\/[0-9a-zA-Z\-\.]+\/\w+/, '/' + req.params.section + '/' + req.params.site );
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

		app.get( '/plans', function( req, res, next ) {
			if ( ! req.cookies.wordpress_logged_in ) {
				const queryFor = req.query && req.query.for;
				if ( queryFor && 'jetpack' === queryFor ) {
					res.redirect( 'https://wordpress.com/wp-login.php?redirect_to=https%3A%2F%2Fwordpress.com%2Fplans' );
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
	app.get( [ '/menus', '/menus/:site?' ], ( req, res ) => {
		const siteSlug = get( req.params, 'site', '' );
		const newRoute = '/customize/menus/' + siteSlug;
		res.redirect( 301, newRoute );
	} );

	sections
		.filter( section => ! section.envId || section.envId.indexOf( config( 'env_id' ) ) > -1 )
		.forEach( section => {
			section.paths.forEach( path => {
				const pathRegex = utils.pathToRegExp( path );

				app.get( pathRegex, function( req, res, next ) {
					if ( config.isEnabled( 'code-splitting' ) ) {
						req.context = Object.assign( {}, req.context, { chunk: section.name } );
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
					app.get( pathRegex, section.enableLoggedOut ? setUpRoute : setUpLoggedInRoute, serverRender );
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

		res.render( 'browsehappy.jade', {
			...req.context,
			dashboardUrl,
		} );
	} );

	// catchall to render 404 for all routes not whitelisted in client/sections
	app.get( '*', render404 );

	return app;
};
