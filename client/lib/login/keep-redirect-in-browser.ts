// The Jetpack iOS app claims dated post permalinks and tag archives on *.wordpress.com as universal
// links, so iOS opens a scripted navigation to one in the app instead of the browser the user
// logged in from. The wordpress.com apple-app-site-association file excludes any URL that carries
// `open_in_browser`. The other paths it claims are wordpress.com screens that sites don't serve.
const UNIVERSAL_LINK_PATH = /^\/(?:(?:19|20)\d{2}\/\d{2}\/\d{2}|tag)\//;

export function keepRedirectInBrowser( url: string ): string {
	let parsedUrl: URL;
	try {
		parsedUrl = new URL( url );
	} catch {
		return url;
	}

	if (
		// An http URL is upgraded to https with its query intact, so it needs the marker too.
		! [ 'http:', 'https:' ].includes( parsedUrl.protocol ) ||
		! parsedUrl.hostname.endsWith( '.wordpress.com' ) ||
		! UNIVERSAL_LINK_PATH.test( parsedUrl.pathname )
	) {
		return url;
	}

	parsedUrl.searchParams.set( 'open_in_browser', '1' );
	return parsedUrl.toString();
}
