/**
 * External dependencies
 *
 * @format
 */
import { has } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSelectedComments } from 'state/selectors';

/**
 * Returns the selected state of a comment.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      SiteId to query
 * @return {Boolean}             Selected state
 */
export default createSelector(
	( state, siteId, commentId ) => has( getSelectedComments( state, siteId ), commentId ),
	( state, siteId ) => [ getSelectedComments( state, siteId ) ]
);
