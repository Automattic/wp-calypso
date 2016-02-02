var express = require( 'express' ),
	fs = require( 'fs' ),
	crypto = require( 'crypto' ),
	qs = require( 'qs' ),
	execSync = require( 'child_process' ).execSync,
	cookieParser = require( 'cookie-parser' ),
	i18nUtils = require( 'lib/i18n-utils' ),
	debug = require( 'debug' )( 'calypso:pages' ),
	superagent = require( 'superagent' ),
	includes = require( 'lodash/collection/includes' ),
	React = require( 'react' ),
	ReactDomServer = require( 'react-dom/server' ),
	Helmet = require( 'react-helmet' );

var config = require( 'config' ),
	sanitize = require( 'sanitize' ),
	utils = require( 'bundler/utils' ),
	sections = require( '../../client/sections' ),
	LayoutLoggedOutDesign = require( 'layout/logged-out-design' );

var LayoutLoggedOutDesignFactory = React.createFactory( LayoutLoggedOutDesign );
var cachedDesignMarkup = {};

var HASH_LENGTH = 10,
	URL_BASE_PATH = '/calypso',
	SERVER_BASE_PATH = '/public',
	CALYPSO_ENV = process.env.CALYPSO_ENV || process.env.NODE_ENV || 'development';

var staticFiles = [
	{ path: 'style.css' },
	{ path: 'editor.css' },
	{ path: 'tinymce/skins/wordpress/wp-content.css' },
	{ path: 'style-debug.css' },
	{ path: 'style-rtl.css' }
];

var chunksByPath = {};

sections.forEach( function( section ) {
	section.paths.forEach( function( path ) {
		chunksByPath[ path ] = section.name;
	} );
} );

/**
 * Generates a hash of a files contents to be used as a version parameter on asset requests.
 * @param {String} path Path to file we want to hash
 * @returns {String} A shortened md5 hash of the contents of the file file or a timestamp in the case of failure.
 **/
function hashFile( path ) {
	var data, hash,
		md5 = crypto.createHash( 'md5' );

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
	var urls = {}, assets;

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

	assets = request.app.get( 'assets' );

	assets.forEach( function( asset ) {
		urls[ asset.name ] = asset.url;
		if ( config( 'env' ) !== 'development' ) {
			urls[ asset.name + '-min' ] = asset.url.replace( '.js', '.min.js' );
		}
	} );

	return urls;
}

function getChunk( path ) {
	var regex, chunkPath;

	for ( chunkPath in chunksByPath ) {
		if ( chunkPath === path ) {
			return chunksByPath[ chunkPath ];
		}

		if ( chunkPath === '/' ) {
			continue;
		}

		regex = utils.pathToRegExp( chunkPath );

		if ( regex.test( path ) ) {
			return chunksByPath[ chunkPath ];
		}
	}
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
	var context, chunk;

	context = {
		compileDebug: config( 'env' ) === 'development' ? true : false,
		urls: generateStaticUrls( request ),
		user: false,
		env: CALYPSO_ENV,
		sanitize: sanitize,
		isRTL: config( 'rtl' ),
		isDebug: request.query.debug !== undefined ? true : false,
		badge: false,
		lang: config( 'i18n_default_locale_slug' ),
		jsFile: 'build',
		faviconURL: '//s1.wp.com/i/favicon.ico',
		isFluidWidth: !! config.isEnabled( 'fluid-width' ),
		devDocsURL: '/devdocs'
	};

	context.app = {
		// use ipv4 address when is ipv4 mapped address
		clientIp: request.ip ? request.ip.replace( '::ffff:', '' ) : request.ip,
		isDebug: context.env === 'development' || context.isDebug,
		tinymceWpSkin: context.urls[ 'tinymce/skins/wordpress/wp-content.css' ],
		tinymceEditorCss: context.urls[ 'editor.css' ]
	};

	if ( CALYPSO_ENV === 'wpcalypso' ) {
		context.badge = CALYPSO_ENV;
		context.devDocs = true;
		context.feedbackURL = 'https://github.com/Automattic/wp-calypso/issues/';
		context.faviconURL = '/calypso/images/favicons/favicon-wpcalypso.ico';
	}

	if ( CALYPSO_ENV === 'horizon' ) {
		context.badge = 'feedback';
		context.feedbackURL = 'https://horizonfeedback.wordpress.com/';
		context.faviconURL = '/calypso/images/favicons/favicon-horizon.ico';
	}

	if ( CALYPSO_ENV === 'stage' ) {
		context.badge = 'staging';
		context.feedbackURL = 'https://github.com/Automattic/wp-calypso/issues/';
		context.faviconURL = '/calypso/images/favicons/favicon-staging.ico';
	}

	if ( CALYPSO_ENV === 'development' ) {
		context.badge = 'dev';
		context.devDocs = true;
		context.feedbackURL = 'https://github.com/Automattic/wp-calypso/issues/';
		context.faviconURL = '/calypso/images/favicons/favicon-development.ico';
		context.branchName = getCurrentBranchName();
		context.commitChecksum = getCurrentCommitShortChecksum();
	}

	if ( config.isEnabled( 'code-splitting' ) ) {
		chunk = getChunk( request.path );

		if ( chunk ) {
			context.chunk = chunk;
		}
	}

	return context;
}

function renderLoggedOutRoute( req, res ) {
	var context = getDefaultContext( req ),
		language;

	res.set( {
		'X-Frame-Options': 'SAMEORIGIN'
	} );

	// Set up the locale in case it has ended up in the flow param
	req.params = i18nUtils.setUpLocale( req.params );

	language = i18nUtils.getLanguage( req.params.lang );
	if ( language ) {
		context.lang = req.params.lang;
		if ( language.rtl ) {
			context.isRTL = true;
		}
	}

	if ( context.lang !== config( 'i18n_default_locale_slug' ) ) {
		context.i18nLocaleScript = '//widgets.wp.com/languages/calypso/' + context.lang + '.js';
	}

	res.render( 'index.jade', context );
}

function renderLoggedInRoute( req, res ) {
	var redirectUrl, protocol, start, context;

	res.set( {
		'X-Frame-Options': 'SAMEORIGIN'
	} );

	context = getDefaultContext( req );

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
			var end, searchParam, errorMessage;

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

			end = ( new Date().getTime() ) - start;

			debug( 'Rendering with bootstrapped user object. Fetched in %d ms', end );
			context.user = data;
			context.isRTL = data.isRTL ? true : false;

			if ( data.localeSlug ) {
				context.lang = data.localeSlug;
			}

			if ( context.lang !== config( 'i18n_default_locale_slug' ) ) {
				context.i18nLocaleScript = '//widgets.wp.com/languages/calypso/' + context.lang + '.js';
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

			res.render( 'index.jade', context );
		} );
	} else if ( config.isEnabled( 'desktop' ) ) {
		res.render( 'desktop.jade', context );
	} else {
		res.render( 'index.jade', context );
	}
}

function bumpStat( group, name ) {
	const url = `http://pixel.wp.com/g.gif?v=wpcom-no-pv&x_${ group }=${ name }&t=${ Math.random() }`;

	if ( config( 'env' ) === 'production' ) {
		superagent.get( url ).end();
	}
}

module.exports = function() {
	var app = express();

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
		var redirectUrl;
		sections = [ 'posts', 'pages', 'sharing', 'upgrade', 'checkout', 'change-theme' ];

		if ( -1 === sections.indexOf( req.params.section ) ) {
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

	app.get( '/calypso/?*', function( request, response ) {
		response.status( 404 ).render( '404.jade', {
			urls: generateStaticUrls( request )
		} );
	} );

	if ( config.isEnabled( 'login' ) ) {
		app.get( '/log-in/:lang?', function( req, res ) {
			renderLoggedOutRoute( req, res );
		} );
	}

	app.get( '/start/:flowName?/:stepName?/:stepSectionName?/:lang?', function( req, res ) {
		if ( req.cookies.wordpress_logged_in ) {
			// the user is probably logged in
			renderLoggedInRoute( req, res );
		} else {
			renderLoggedOutRoute( req, res );
		}
	} );

	app.get( '/design(/type/:themeTier)?', function( req, res ) {
		if ( req.cookies.wordpress_logged_in || ! config.isEnabled( 'manage/themes/logged-out' ) ) {
			// the user is probably logged in
			renderLoggedInRoute( req, res );
		} else {
			const context = getDefaultContext( req );
			const tier = includes( [ 'all', 'free', 'premium' ], req.params.themeTier )
				? req.params.themeTier
				: 'all';

			if ( config.isEnabled( 'server-side-rendering' ) ) {
				try {
					if ( ! cachedDesignMarkup[ tier ] ) {
						const cached = cachedDesignMarkup[ tier ] = {};
						let startTime = Date.now();
						cached.layout = ReactDomServer.renderToString(
								LayoutLoggedOutDesignFactory( { tier } ) );
						let rtsTimeMs = Date.now() - startTime;

						cached.helmetData = Helmet.rewind();

						if ( rtsTimeMs > 15 ) {
							// We think that renderToString should generally
							// never take more than 15ms. We're probably wrong.
							bumpStat( 'calypso-ssr', 'loggedout-design-over-15ms-rendertostring' );
						}
						bumpStat( 'calypso-ssr', 'loggedout-design-cache-miss' );
					}

					const { layout, helmetData } = cachedDesignMarkup[ tier ];

					Object.assign( context, {
						layout,
						helmetTitle: helmetData.title,
						helmetMeta: helmetData.meta,
						helmetLink: helmetData.link,
					} );
				} catch ( ex ) {
					if ( config( 'env' ) === 'development' ) {
						throw ex;
					}
				}
			}

			res.render( 'index.jade', context );
		}
	} );

	app.get( '/accept-invite/:site_id?/:invitation_key?/:activation_key?/:auth_key?/:locale?', function( req, res ) {
		if ( req.cookies.wordpress_logged_in ) {
			// the user is probably logged in
			renderLoggedInRoute( req, res );
		} else {
			renderLoggedOutRoute( req, res );
		}
	} );

	if ( config.isEnabled( 'phone_signup' ) ) {
		app.get( '/phone/:lang?', function( req, res ) {
			renderLoggedOutRoute( req, res );
		} );
	}

	if ( config.isEnabled( 'mailing-lists/unsubscribe' ) ) {
		app.get( '/mailing-lists/unsubscribe', function( req, res ) {
			if ( req.cookies.wordpress_logged_in ) {
				// the user is probably logged in
				renderLoggedInRoute( req, res );
			} else {
				renderLoggedOutRoute( req, res );
			}
		} );
	}

	if ( config.isEnabled( 'reader/discover' ) && config( 'env' ) !== 'development' ) {
		app.get( '/discover', function( req, res ) {
			if ( req.cookies.wordpress_logged_in ) {
				renderLoggedInRoute( req, res );
			} else {
				res.redirect( 'https://discover.wordpress.com' );
			}
		} );
	}

	// catchall path to serve shell for all non-static-file requests (other than auth routes)
	app.get( '*', renderLoggedInRoute );

	return app;
};
