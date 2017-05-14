/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { items as domainContactDetailsSchemas } from './schema';
import {
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_RECEIVE,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_REQUEST,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_REQUEST_FAILURE,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_REQUEST_SUCCESS,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_SAVE,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_SAVE_FAILURE,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_SAVE_SUCCESS,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_UPDATE
} from 'state/action-types';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps domain to whether a request is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const requesting = createReducer( {}, {
	[ DOMAIN_MANAGEMENT_CONTACT_DETAILS_REQUEST ]: ( state, { domain } ) => ( { ...state, [ domain ]: true } ),
	[ DOMAIN_MANAGEMENT_CONTACT_DETAILS_REQUEST_SUCCESS ]: ( state, { domain } ) => ( { ...state, [ domain ]: false } ),
	[ DOMAIN_MANAGEMENT_CONTACT_DETAILS_REQUEST_FAILURE ]: ( state, { domain } ) => ( { ...state, [ domain ]: false } )
} );

/**
 * Returns the save request status after an action has been dispatched. The
 * state maps domain to the request status
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const saveRequests = createReducer( {}, {
	[ DOMAIN_MANAGEMENT_CONTACT_DETAILS_SAVE ]: ( state, { domain } ) => ( { ...state, [ domain ]: { saving: true, status: 'pending', error: false } } ),
	[ DOMAIN_MANAGEMENT_CONTACT_DETAILS_SAVE_SUCCESS ]: ( state, { domain } ) => ( {
		...state,
		[ domain ]: { saving: false, status: 'success', error: false }
	} ),
	[ DOMAIN_MANAGEMENT_CONTACT_DETAILS_SAVE_FAILURE ]: ( state, { domain, error } ) => ( { ...state, [ domain ]: { saving: false, status: 'error', error } } )
} );

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps domain to the domain's contactDetails object.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const items = createReducer( {}, {
	[ DOMAIN_MANAGEMENT_CONTACT_DETAILS_RECEIVE ]: ( state, { domain, contactDetails } ) => ( { ...state, [ domain ]: contactDetails } ),
	[ DOMAIN_MANAGEMENT_CONTACT_DETAILS_UPDATE ]: ( state, { domain, contactDetails } ) => ( {
		...state,
		[ domain ]: {
			...state[ domain ],
			...contactDetails
		}
	} )
}, domainContactDetailsSchema );

export default combineReducers( {
	items,
	requesting,
	saveRequests
} );
