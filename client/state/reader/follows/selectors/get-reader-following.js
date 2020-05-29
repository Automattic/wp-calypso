/**
 * External dependencies
 */
import { values } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import 'state/reader/init';
import { NO_ORG_ID } from 'state/reader/organizations/constants';

/**
 * Get sites by organization id
 */
const getReaderFollowing = createSelector(
	( state ) => {
		// remove subs where the sub has an error
		return values( state.reader.follows.items ).filter(
			( blog ) => blog.organization_id === NO_ORG_ID
		);
	},
	( state ) => [ state.reader.follows.items, state.currentUser.capabilities ]
);

export default getReaderFollowing;
