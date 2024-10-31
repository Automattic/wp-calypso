import { BLOG_FLOW } from '@automattic/onboarding';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

// Flows to redirect
const REMOVED_TAILORED_FLOWS = [
	{ flow: BLOG_FLOW, to: '/start:lang?' },
	{ flow: 'free', to: '/start/free:lang?' },
	{ flow: 'link-in-bio', to: '/start:lang?' },
	{ flow: 'sensei', to: ':lang?/plugins/sensei-pro/' },
	{ flow: 'videopress', to: '/start:lang?' },
	{ flow: 'videopress-tv', to: '/start:lang?' },
	{ flow: 'videopress-tv-purchase', to: '/start:lang?' },
];

export const isRemovedFlow = ( flowToCheck: string ) =>
	!! REMOVED_TAILORED_FLOWS.find( ( { flow } ) => flow === flowToCheck );

// Regex pattern for the optional language code in the format xx or xx-yy
const langPattern = '(?:/([a-z]{2}(?:-[a-z]{2})?))?/?$';

// Test against a location pathname and build a redirect URL
const redirectPathIfNecessary = ( pathname: string, search: string ) => {
	// Add trailing slash to pathname if not present
	pathname = pathname.endsWith( '/' ) ? pathname : pathname + '/';

	// Find the matching redirect route
	const route = REMOVED_TAILORED_FLOWS.find( ( { flow } ) =>
		pathname.startsWith( `/setup/${ flow }/` )
	);

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
