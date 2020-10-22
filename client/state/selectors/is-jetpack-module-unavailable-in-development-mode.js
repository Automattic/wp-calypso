/**
 * External dependencies
 */

import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'calypso/lib/create-selector';
import getJetpackModulesRequiringConnection from './get-jetpack-modules-requiring-connection';

/**
 * Returns true if the module is unavailable in development mode. False if not.
 * Returns null if the site modules are not known yet.
 *
 * @param  {object}  state       Global state tree
 * @param  {number}  siteId      The ID of the site we're querying
 * @param  {string}  moduleSlug  Module slug
 * @returns {?boolean}            Whether the module is unavailable in dev mode.
 */
const isJetpackModuleUnavailableInDevelopmentMode = createSelector(
	( state, siteId, moduleSlug ) => {
		const modulesRequiringConnection = getJetpackModulesRequiringConnection( state, siteId );
		if ( ! modulesRequiringConnection ) {
			return null;
		}

		return includes( modulesRequiringConnection, moduleSlug );
	},
	getJetpackModulesRequiringConnection
);

export default isJetpackModuleUnavailableInDevelopmentMode;
