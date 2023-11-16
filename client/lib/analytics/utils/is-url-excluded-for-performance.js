import debug from './debug';

// For better load performance, these routes are excluded from loading ads.
const excludedRoutes = [ '/log-in' ];

/**
 * Are tracking pixels forbidden from the given URL for better performance (except for Google Analytics)?
 * @returns {boolean} true if the current URL is excluded.
 */
export default function isUrlExcludedForPerformance() {
	const { href } = document.location;
	const match = ( pattern ) => href.indexOf( pattern ) !== -1;
	const result = excludedRoutes.some( match );

	debug( `Is URL Excluded for Performance: ${ result }` );
	return result;
}
