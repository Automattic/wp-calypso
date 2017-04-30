/**
 * External dependencies
 */
import {
	filter,
	get
} from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

export default createSelector(
	( state, siteId, postId ) => filter(
		get( state, [ 'discussions', 'items', siteId ], null ),
		{ post: { ID: postId }, parent: false }
	),
	state => [ get( state, 'discussions.items', null ) ]
);
