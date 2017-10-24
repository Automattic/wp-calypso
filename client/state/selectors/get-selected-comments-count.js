/**
 * External dependencies
 *
 * @format
 */
import { size } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSelectedComments } from 'state/selectors';

/**
 * Returns the selected comment count for the specified siteId.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      SiteId to query
 * @return {Number}              Comment count
 */
export default createSelector(
	( state, siteId ) => size( getSelectedComments( state, siteId ) ),
	( state, siteId ) => [ getSelectedComments( state, siteId ) ]
);
