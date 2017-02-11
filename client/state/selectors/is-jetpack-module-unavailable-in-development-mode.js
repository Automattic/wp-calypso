/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getJetpackModulesRequiringConnection } from './';

/**
 * Returns true if the module is unavailable in development mode. False if not.
 * Returns null if the site modules are not known yet.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @param  {String}  moduleSlug  Module slug
 * @return {?Boolean}            Whether the module is unavailable in dev mode.
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
