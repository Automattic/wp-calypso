/* eslint-disable no-restricted-modules */

/**
 * External dependencies
 */
import { flow } from 'lodash';

/**
 * Internal dependencies
 */
import { receiveSiteUpdates, receiveSite } from 'state/sites/actions';
import { getSite } from 'state/sites/selectors';

/**
 * Redux store enhancer which binds to the application-wide sites-list
 * instance, dispatching updates when sites are synced with REST API or
 * individual sites are changed in the application.
 *
 * @param  {Function} createStore Original store creator
 * @return {Function}             Modified store creator
 */
export default ( createStore ) => ( ...args ) => {
	const store = createStore( ...args );

	// Ugly hack by which we hook into the sites sync mechanism, since a change
	// event may or may not occur as a result of fresh data being received.
	const sites = require( 'lib/sites-list' )();
	sites.sync = flow(
		sites.sync.bind( sites ),
		() => store.dispatch( receiveSiteUpdates( sites.get() ) )
	);

	// To sync changes made to an individual site in sites-list, override the
	// prototype of Site's `set` method, used in updating a set of attributes.
	const Site = require( 'lib/site' );
	const originalSet = Site.prototype.set;
	Site.prototype.set = function() {
		// Preserve original behavior
		const hasChanged = originalSet.apply( this, arguments );
		if ( ! hasChanged ) {
			return false;
		}

		// If we're tracking the site in state, apply attributes atop what we
		// know to be the site and receive to treat as latest
		const storeSite = getSite( store.getState(), this.ID );
		if ( storeSite ) {
			store.dispatch( receiveSite( this ) );
		}

		return true;
	};

	return store;
};
