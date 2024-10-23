import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

// Flows to redirect
const redirectRoutes = [
	{ from: '/setup/blog/', to: '/start:lang?' },
	{ from: '/setup/free/', to: '/start/free:lang?' },
	{ from: '/setup/link-in-bio/', to: '/start:lang?' },
	{ from: '/setup/videopress/', to: '/start:lang?' },
	{ from: '/setup/sensei/', to: ':lang?/plugins/sensei-pro/' },
];

// Regex pattern for the optional language code in the format xx or xx-yy
const langPattern = '(?:/([a-z]{2}(?:-[a-z]{2})?))?/?$';

// Test against a location pathname and build a redirect URL
const redirectPathIfNecessary = ( pathname: string, search: string ) => {
	// Add trailing slash to pathname if not present
	pathname = pathname.endsWith( '/' ) ? pathname : pathname + '/';

	// Find the matching redirect route
	const route = redirectRoutes.find( ( redirect ) => pathname.startsWith( redirect.from ) );

	// If no route is found we don't redirect and return false
	if ( ! route ) {
		return false;
	}

	// Find the language code in the pathname if present
	const [ , lang ] = pathname.match( langPattern ) ?? [];

	// Replace the ":lang?" placeholder in the "to" field with the matched language or empty string if not present
	const redirectUrl = route.to.replace( ':lang?', lang ? `/${ lang }` : '' );

	// Construct the final URL with search parameters if present
	const finalUrl = `${ redirectUrl }${ search }`;

	// Track the redirect event
	recordTracksEvent( 'calypso_tailored_flows_redirect', {
		redirectFromUrl: location.pathname + location.search,
		redirectToUrl: finalUrl,
		referrer: document.referrer,
	} );

	// Perform the actual redirection
	window.location.href = finalUrl;

	return true;
};

export default redirectPathIfNecessary;
