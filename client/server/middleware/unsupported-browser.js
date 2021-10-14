import config from '@automattic/calypso-config';
import { matchesUA } from 'browserslist-useragent';
import { addQueryArgs } from 'calypso/lib/url';
import analytics from 'calypso/server/lib/analytics';

function isSupportedBrowser( req ) {
	// The desktop app sends a UserAgent including WordPress, Electron and Chrome.
	// We need to check if the chrome portion is supported, but the UA library
	// will select WordPress and Electron before Chrome, giving a result not
	// based on the chrome version.
	const userAgentString = req.useragent.source;
	const sanitizedUA = userAgentString.replace( / (WordPressDesktop|Electron)\/[.\d]+/g, '' );
	return matchesUA( sanitizedUA, {
		env: 'evergreen',
		ignorePatch: true,
		ignoreMinor: true,
		allowHigherVersions: true,
	} );
}

// We don't want to redirect some of our public landing pages, so we include them here.
function allowPath( path ) {
	const locales = [ 'en', ...config( 'magnificent_non_en_locales' ) ];
	const prefixedLocale = locales.find( ( locale ) => path.startsWith( `/${ locale }/` ) );

	// If the path starts with a locale, replace it (e.g. '/es/log-in' => '/log-in')
	const parsedPath = prefixedLocale
		? path.replace( new RegExp( `^/${ prefixedLocale }` ), '' )
		: path;

	const allowedPaths = [
		'/browsehappy',
		'/log-in',
		'/start',
		'/new',
		'/themes',
		'/theme',
		'/domains',
	];
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
	if ( ! forceRedirect && isSupportedBrowser( req ) ) {
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
