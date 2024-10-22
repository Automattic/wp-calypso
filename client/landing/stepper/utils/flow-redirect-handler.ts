import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

// Flows to redirect
const redirectRoutes = [
	{ flow: '/setup/blog/', to: '/start:lang?' },
	{ flow: '/setup/free/', to: '/start/free:lang?' },
	{ flow: '/setup/link-in-bio/', to: '/start:lang?' },
	{ flow: '/setup/videopress/', to: '/start:lang?' },
	{ flow: '/setup/sensei/', to: ':lang?/plugins/sensei-pro/' },
];

// Sub-flow parts to match
const subFlows = [
	'freeSetup',
	'processing',
	'create-site',
	'launchpad',
	'designSetup',
	'pattern-assembler',
	'error',
];

// Build the regex pattern to match
const routePaths = redirectRoutes.map( ( route ) => route.flow.replace( /\/$/, '' ) ); // Removing trailing slash

// Join the subFlows with '|' to create an "OR" regex pattern, making it optional
const flowsPattern = `(?:/(${ subFlows.join( '|' ) }))?`;

// Regex pattern for the optional language code in the format xx or xx-yy
const langPattern = '(?:/([a-z]{2}(?:-[a-z]{2})?))?';

// Build the complete regex to match the routes
const regex = new RegExp( `^(${ routePaths.join( '|' ) })${ flowsPattern }${ langPattern }/?$` );

// Test against a location pathname and build a redirect URL
const redirectPathIfNecessary = ( pathname: string, search: string ) => {
	// Find the matching redirect route
	const match = pathname.match( regex );
	if ( match ) {
		const [ , baseRoute, , lang ] = match;

		// Find the corresponding redirect rule
		const route = redirectRoutes.find( ( route ) => route.flow === `${ baseRoute }/` );
		if ( route ) {
			// Replace the ":lang?" placeholder in the "to" field with the matched language or empty string if not present
			const redirectUrl = route.to.replace( ':lang?', lang ? `/${ lang }` : '' );

			// Construct the final URL with search parameters if present
			const finalUrl = `${ redirectUrl }${ search }`;

			// Track the redirect event
			recordTracksEvent( 'calypso_tailored_flows_redirect', {
				redirectFromUrl: location.pathname + location.search,
				redirectTo: finalUrl,
				referrer: document.referrer,
			} );

			// Perform the actual redirection
			window.location.href = finalUrl;

			return true;
		}
	}
	return false;
};

export default redirectPathIfNecessary;
