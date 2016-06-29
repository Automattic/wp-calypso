/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import union from 'lodash/union';
import find from 'lodash/find';
import filter from 'lodash/filter';

/**
 * Internal dependencies
 */
import {
	READER_START_GRADUATE_REQUEST,
	READER_START_GRADUATED,
	READER_START_GRADUATE_REQUEST_SUCCESS,
	READER_START_GRADUATE_REQUEST_FAILURE,
	READER_START_RECOMMENDATIONS_RECEIVE,
	READER_START_RECOMMENDATIONS_REQUEST,
	READER_START_RECOMMENDATIONS_REQUEST_SUCCESS,
	READER_START_RECOMMENDATIONS_REQUEST_FAILURE,
	READER_START_RECOMMENDATION_INTERACTION,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';

/**
 * Tracks all known list objects, indexed by list ID.
 *
 * @param  {Array} state  Current state
 * @param  {Object} action Action payload
 * @return {Array}        Updated state
 */
export function items( state = [], action ) {
	switch ( action.type ) {
		case READER_START_RECOMMENDATIONS_RECEIVE:
			// Filter out any recommendations we already have
			const newRecommendations = filter( action.recommendations, ( incomingRecommendation ) => {
				return ! find( state, { ID: incomingRecommendation.ID } );
			} );

			// No new recommendations? Just return the existing ones.
			if ( newRecommendations.length < 1 ) {
				return state;
			}

			return state.concat( newRecommendations );

		// Always return default state - we don't want to serialize recommendations
		case SERIALIZE:
		case DESERIALIZE:
			return [];
	}

	return state;
}

/**
 * Returns the updated "graduation" from cold start request state after an
 * action has been dispatched.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function isRequestingGraduation( state = false, action ) {
	switch ( action.type ) {
		case READER_START_GRADUATE_REQUEST:
		case READER_START_GRADUATE_REQUEST_SUCCESS:
		case READER_START_GRADUATE_REQUEST_FAILURE:
			return READER_START_GRADUATE_REQUEST === action.type;

		case SERIALIZE:
		case DESERIALIZE:
			return false;
	}

	return state;
}

/**
 * Returns the updated requests state after an action has been dispatched.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function isRequestingRecommendations( state = false, action ) {
	switch ( action.type ) {
		case READER_START_RECOMMENDATIONS_REQUEST:
		case READER_START_RECOMMENDATIONS_REQUEST_SUCCESS:
		case READER_START_RECOMMENDATIONS_REQUEST_FAILURE:
			return READER_START_RECOMMENDATIONS_REQUEST === action.type;

		case SERIALIZE:
		case DESERIALIZE:
			return false;
	}

	return state;
}

/**
 * Returns the updated requests state after an action has been dispatched.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function recommendationsInteractedWith( state = [], action ) {
	switch ( action.type ) {
		case READER_START_RECOMMENDATION_INTERACTION:
			return union( state, [ action.recommendationId ] );

		case SERIALIZE:
		case DESERIALIZE:
			return [];
	}

	return state;
}

/**
 * Returns the state of the user's Reader recommendations. New users are shown
 * the cold start recommendations, while regular / graduated users are shown
 * the normal recs.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function hasGraduated( state = null, action ) {
	switch ( action.type ) {
		case READER_START_GRADUATED:
			return true;

		case SERIALIZE:
		case DESERIALIZE:
			return null;
	}

	return state;
}

export default combineReducers( {
	hasGraduated,
	items,
	isRequestingGraduation,
	isRequestingRecommendations,
	recommendationsInteractedWith
} );
