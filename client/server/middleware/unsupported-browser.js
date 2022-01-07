import config from '@automattic/calypso-config';
import { addQueryArgs } from 'calypso/lib/url';
import analytics from 'calypso/server/lib/analytics';
import isUnsupportedBrowser from 'calypso/server/lib/is-unsupported-browser';

/**
 * These public pages work even in unsupported browsers, so we do not redirect them.
 */
function allowPath( path ) {
	const locales = [ 'en', ...config( 'magnificent_non_en_locales' ) ];
	const prefixedLocale = locales.find( ( locale ) => path.startsWith( `/${ locale }/` ) );

	// If the path starts with a locale, replace it (e.g. '/es/log-in' => '/log-in')
	const parsedPath = prefixedLocale
		? path.replace( new RegExp( `^/${ prefixedLocale }` ), '' )
		: path;

	// '/calypso' is the static assets path, and should never be redirected. (Can
	// cause CDN caching issues if an asset gets cached with a redirect.)
	const allowedPaths = [ '/browsehappy', '/themes', '/theme', '/calypso' ];
	// For example, match either exactly "/themes" or "/themes/*"
	return allowedPaths.some( ( p ) => parsedPath === p || parsedPath.startsWith( p + '/' ) );
}

export default () => ( req, res, next ) => {
	if ( ! config.isEnabled( 'redirect-fallback-browsers' ) ) {
		next();
		return;
	}

	// Permitted paths even if the browser is unsupported.
	if ( allowPath( req.path ) ) {
		next();
		return;
	}

	if ( req.cookies.bypass_target_redirection === 'true' ) {
		next();
		return;
	}

	if ( req.query.bypassTargetRedirection === 'true' ) {
		res.cookie( 'bypass_target_redirection', true, {
			expires: new Date( Date.now() + 24 * 3600 * 1000 ), // bypass redirection for 24 hours
			httpOnly: true,
			secure: true,
		} );
		next();
		return;
	}

	const forceRedirect = config.isEnabled( 'redirect-fallback-browsers/test' );
	if ( ! forceRedirect && ! isUnsupportedBrowser( req ) ) {
		next();
		return;
	}

	// `req.originalUrl` contains the full path. It's tempting to use `req.url`, but that would
	// fail in case of multiple Express.js routers nested with `app.use`, because `req.url` contains
	// only the closest subpath.
	const from = req.originalUrl;

	// The UserAgent is automatically included.
	analytics.tracks.recordEvent(
		'calypso_redirect_unsupported_browser',
		{ original_url: from },
		req
	);
	res.redirect( addQueryArgs( { from }, '/browsehappy' ) );
};
