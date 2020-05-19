/**
 * External dependencies
 */
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import getSitesItems from 'state/selectors/get-sites-items';
import { isPlan } from 'lib/products-values';

/**
 * Whether the user currently has any paid plans
 *
 * @param {object} state  Global state tree
 * @returns {object}       Site object
 */
export default createSelector(
	( state ) => some( getSitesItems( state ), ( site ) => isPlan( site.plan ) ),
	( state ) => [ getSitesItems( state ) ]
);
