/**
 * Internal dependencies
 */

import {
	WORDADS_SITE_APPROVE_REQUEST,
	WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
	WORDADS_SITE_APPROVE_REQUEST_FAILURE,
	WORDADS_SITE_APPROVE_REQUEST_DISMISS_ERROR,
	WORDADS_SITE_APPROVE_REQUEST_DISMISS_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

/**
 * Tracks all WordAds request status, indexed by site ID.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case WORDADS_SITE_APPROVE_REQUEST:
		case WORDADS_SITE_APPROVE_REQUEST_SUCCESS:
		case WORDADS_SITE_APPROVE_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.siteId ]: action.type === WORDADS_SITE_APPROVE_REQUEST,
			} );
	}
	return state;
}

/**
 * Keeps track of all WordAds errors, indexed by siteId
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function requestErrors( state = {}, action ) {
	switch ( action.type ) {
		case WORDADS_SITE_APPROVE_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.siteId ]: action.error,
			} );
		case WORDADS_SITE_APPROVE_REQUEST:
		case WORDADS_SITE_APPROVE_REQUEST_SUCCESS:
		case WORDADS_SITE_APPROVE_REQUEST_DISMISS_ERROR:
			return Object.assign( {}, state, {
				[ action.siteId ]: null,
			} );
	}
	return state;
}

/**
 * Keeps track of all WordAds request successes, indexed by siteId
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function requestSuccess( state = {}, action ) {
	switch ( action.type ) {
		case WORDADS_SITE_APPROVE_REQUEST:
		case WORDADS_SITE_APPROVE_REQUEST_DISMISS_SUCCESS:
		case WORDADS_SITE_APPROVE_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.siteId ]: null,
			} );
		case WORDADS_SITE_APPROVE_REQUEST_SUCCESS:
			return Object.assign( {}, state, {
				[ action.siteId ]: true,
			} );
	}
	return state;
}

export default combineReducers( {
	requesting,
	requestSuccess,
	requestErrors,
} );
