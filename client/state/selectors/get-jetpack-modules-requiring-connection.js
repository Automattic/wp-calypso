/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Returns an array of modules that require connection in order to work.
 * Returns null if the site is not known.
 *
 * @param  {object}  state       Global state tree
 * @param  {number}  siteId      The ID of the site we're querying
 * @returns {?Array}              Slugs of modules that require connection to work.
 */
const getJetpackModulesRequiringConnection = createSelector(
	( state, siteId ) => {
		const modules = get( state.jetpack.modules.items, [ siteId ], null );
		if ( ! modules ) {
			return null;
		}

		return Object.keys( modules ).filter(
			( module_slug ) => modules[ module_slug ].requires_connection
		);
	},
	( state ) => [ state.jetpack.modules.items ]
);

export default getJetpackModulesRequiringConnection;
