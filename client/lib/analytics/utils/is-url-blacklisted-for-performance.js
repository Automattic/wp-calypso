/**
 * Internal dependencies
 */
import debug from './debug';

// For better load performance, these routes are blacklisted from loading ads.
const blacklistedRoutes = [ '/log-in' ];

/**
 * Are tracking pixels forbidden from the given URL for better performance (except for Google Analytics)?
 *
 * @returns {boolean} true if the current URL is blacklisted.
 */
export default function isUrlBlacklistedForPerformance() {
	const { href } = document.location;
	const match = ( pattern ) => href.indexOf( pattern ) !== -1;
	const result = blacklistedRoutes.some( match );

	debug( `Is URL Blacklisted for Performance: ${ result }` );
	return result;
}
