/**
 * External dependencies
 */

import { property, sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import { AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE as UPDATE } from 'calypso/state/action-types';

const initialState = {
	eligibilityHolds: [],
	eligibilityWarnings: [],
	lastUpdate: 0,
};

const eligibilityReducer = ( state = initialState, action ) => {
	switch ( action.type ) {
		case UPDATE:
			return {
				eligibilityHolds: sortBy( action.eligibilityHolds ),
				eligibilityWarnings: sortBy( action.eligibilityWarnings, property( 'name' ) ),
				lastUpdate: action.lastUpdate,
			};
	}

	return state;
};
eligibilityReducer.hasCustomPersistence = true; // the parent reducer will verify the schema

export default eligibilityReducer;
