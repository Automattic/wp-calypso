/**
 * External dependencies
 */
import { merge, stubFalse, stubTrue } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer, combineReducers, keyedReducer } from 'state/utils';
import { domainWhoisSchema } from './schema';
import {
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_RECEIVE,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_REQUEST,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_REQUEST_FAILURE,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_REQUEST_SUCCESS,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_UPDATE,
	DOMAIN_MANAGEMENT_WHOIS_RECEIVE,
	DOMAIN_MANAGEMENT_WHOIS_REQUEST,
	DOMAIN_MANAGEMENT_WHOIS_REQUEST_FAILURE,
	DOMAIN_MANAGEMENT_WHOIS_REQUEST_SUCCESS,
	DOMAIN_MANAGEMENT_WHOIS_SAVE,
	DOMAIN_MANAGEMENT_WHOIS_SAVE_FAILURE,
	DOMAIN_MANAGEMENT_WHOIS_SAVE_SUCCESS,
	DOMAIN_MANAGEMENT_WHOIS_UPDATE
} from 'state/action-types';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps domain to whether a request is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const isRequestingContactDetailsCache = createReducer( false, {
	[ DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_REQUEST ]: stubTrue,
	[ DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_REQUEST_SUCCESS ]: stubFalse,
	[ DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_REQUEST_FAILURE ]: stubFalse,
} );

export const isRequestingWhois = keyedReducer( 'domain', createReducer( false, {
	[ DOMAIN_MANAGEMENT_WHOIS_REQUEST ]: stubTrue,
	[ DOMAIN_MANAGEMENT_WHOIS_REQUEST_SUCCESS ]: stubFalse,
	[ DOMAIN_MANAGEMENT_WHOIS_REQUEST_FAILURE ]: stubFalse,
} ) );

/**
 * Returns the save request status after an action has been dispatched. The
 * state maps domain to the request status
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const isSaving = createReducer( {}, {
	[ DOMAIN_MANAGEMENT_WHOIS_SAVE ]: ( state, { domain } ) => ( {
		...state,
		[ domain ]: { saving: true, status: 'pending', error: false }
	} ),
	[ DOMAIN_MANAGEMENT_WHOIS_SAVE_SUCCESS ]: ( state, { domain } ) => ( {
		...state,
		[ domain ]: { saving: false, status: 'success', error: false }
	} ),
	[ DOMAIN_MANAGEMENT_WHOIS_SAVE_FAILURE ]: ( state, { domain, error } ) => ( {
		...state,
		[ domain ]: { saving: false, status: 'error', error }
	} )
} );

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps domain to the domain's whoisData object.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const items = createReducer( {}, {
	[ DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_RECEIVE ]: ( state, { data } ) => ( { ...state, _contactDetailsCache: data } ),
	[ DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_UPDATE ]: ( state, { data } ) => {
		return merge( {}, state, { _contactDetailsCache: data } );
	},
	[ DOMAIN_MANAGEMENT_WHOIS_RECEIVE ]: ( state, { domain, whoisData } ) => ( { ...state, [ domain ]: whoisData } ),
	[ DOMAIN_MANAGEMENT_WHOIS_UPDATE ]: ( state, { domain, whoisData } ) => {
		return merge( {}, state, { [ domain ]: { ...state[ domain ], ...whoisData } } );
	},
}, domainWhoisSchema );

export default combineReducers( {
	items,
	isRequestingContactDetailsCache,
	isRequestingWhois,
	isSaving
} );
