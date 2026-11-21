// The Jetpack iOS app claims these paths on *.wordpress.com as universal links, so iOS opens a
// scripted navigation to one in the app instead of the browser the user logged in from. The
// wordpress.com apple-app-site-association file excludes any URL that carries `open_in_browser`.
const UNIVERSAL_LINK_PATH = /^\/(?:19|20)\d{2}\/\d{2}\/\d{2}\//;

export function keepRedirectInBrowser( url: string ): string {
	let parsedUrl: URL;
	try {
		parsedUrl = new URL( url );
	} catch {
		return url;
	}

	if (
		parsedUrl.protocol !== 'https:' ||
		! parsedUrl.hostname.endsWith( '.wordpress.com' ) ||
		! UNIVERSAL_LINK_PATH.test( parsedUrl.pathname )
	) {
		return url;
	}

	parsedUrl.searchParams.set( 'open_in_browser', '1' );
	return parsedUrl.toString();
}
