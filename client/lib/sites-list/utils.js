/** @format */
/**
 * Internal dependencies
 */
import { withoutHttp } from 'lib/url';

/**
 * Marks collisions between .com sites and Jetpack sites that have the same URL
 * Add the hasConflict attribute to .com sites that collide with Jetpack sites.
 *
 * A site collides if it's a non-Jetpack site which
 * shares the same domain with another Jetpack site
 *
 * These occur due to sites _becoming_ Jetpack sites
 * after they started out otherwise, subsuming the
 * domain names assigned to the previous site.
 *
 * Mutates given input list of sites!
 *
 * @api private
 * @see client/state/sites/selectors#getSiteCollisions
 * @param {Object[]} sites mix of site objects
 */
export function markCollisions( sites ) {
	const jetpackDomains = new Set();

	sites.forEach( site => site.jetpack && jetpackDomains.add( withoutHttp( site.URL ) ) );

	// no need to iterate; no Jetpack sites means no collisions
	if ( jetpackDomains.size === 0 ) {
		return;
	}

	sites.forEach( site => {
		if ( ! site.jetpack && jetpackDomains.has( withoutHttp( site.URL ) ) ) {
			site.hasConflict = true;
		}
	} );
}
