/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE as UPDATE,
} from 'state/action-types';

export const eligibilityHolds = ( state = [], action ) =>
	UPDATE === action.type
		? action.eligibilityHolds
		: state;

export const eligibilityWarnings = ( state = [], action ) =>
	UPDATE === action.type
		? action.eligibilityWarnings
		: state;

export const lastUpdate = ( state = 0, action ) =>
	UPDATE === action.type
		? action.lastUpdate
		: state;

export default combineReducers( {
	eligibilityHolds,
	eligibilityWarnings,
	lastUpdate,
} );
