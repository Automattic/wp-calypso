/* eslint-disable no-restricted-modules */

/**
 * External dependencies
 */
import { flow } from 'lodash';

/**
 * Internal dependencies
 */
import { receiveSiteUpdates } from 'state/sites/actions';

/**
 * Redux store enhancer which binds to the application-wide sites-list
 * instance, dispatching updates when sites are synced with REST API.
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

	return store;
};
