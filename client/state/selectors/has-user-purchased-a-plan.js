/**
 * External dependencies
 *
 * @format
 */
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { isPlan } from 'lib/products-values';

/**
 * Get the newest site of the current user
 *
 * @param {Object} state  Global state tree
 * @return {Object}       Site object
 */
export default createSelector(
	state => some( state.sites.items, site => isPlan( site.plan ) ),
	state => [ state.sites.items ]
);
