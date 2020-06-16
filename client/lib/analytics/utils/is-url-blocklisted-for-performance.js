/**
 * Internal dependencies
 */
import debug from './debug';

// For better load performance, these routes are blocklisted from loading ads.
const blocklistedRoutes = [ '/log-in' ];

/**
 * Are tracking pixels forbidden from the given URL for better performance (except for Google Analytics)?
 *
 * @returns {boolean} true if the current URL is blocklisted.
 */
export default function isUrlBlocklistedForPerformance() {
	const { href } = document.location;
	const match = ( pattern ) => href.indexOf( pattern ) !== -1;
	const result = blocklistedRoutes.some( match );

	debug( `Is URL Blocklisted for Performance: ${ result }` );
	return result;
}
