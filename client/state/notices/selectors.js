/**
 * External dependencies
 */
import values from 'lodash/values';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Returns array value of notice item state
 *
 * @param  {Object} state Global state tree
 * @return {Array}        Notice objects as array
 */
export const getNotices = createSelector(
	( state ) => values( state.notices.items ),
	( state ) => state.notices.items
);
