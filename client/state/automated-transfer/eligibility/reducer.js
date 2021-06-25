/**
 * External dependencies
 */

import { property, sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import { AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE } from 'calypso/state/action-types';
import { withPersistence } from 'calypso/state/utils';

const initialState = {
	eligibilityHolds: [],
	eligibilityWarnings: [],
	lastUpdate: 0,
};

// the parent reducer will verify the schema
export default withPersistence( ( state = initialState, action ) => {
	switch ( action.type ) {
		case AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE:
			return {
				eligibilityHolds: sortBy( action.eligibilityHolds ),
				eligibilityWarnings: sortBy( action.eligibilityWarnings, property( 'name' ) ),
				lastUpdate: action.lastUpdate,
			};
	}

	return state;
} );
