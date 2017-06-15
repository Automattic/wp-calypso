/**
 * External dependencies
 */
import { get, some } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Returns true if we have site comments
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 */
export const hasSiteComments = createSelector(
	( state, siteId ) => {
		const comments = get( state, 'comments.items', {} );
		return some( Object.keys( comments ), key => parseInt( key.split( '-', 1 ), 10 ) === siteId );
	},
	state => [ state.comments.items ]
);

export default hasSiteComments;
