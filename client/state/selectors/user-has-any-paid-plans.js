/** @format */

/**
 * External dependencies
 */
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'client/lib/create-selector';
import { getSitesItems } from 'client/state/selectors';
import { isPlan } from 'client/lib/products-values';

/**
 * Whether the user currently has any paid plans
 *
 * @param {Object} state  Global state tree
 * @return {Object}       Site object
 */
export default createSelector(
	state => some( getSitesItems( state ), site => isPlan( site.plan ) ),
	state => [ getSitesItems( state ) ]
);
