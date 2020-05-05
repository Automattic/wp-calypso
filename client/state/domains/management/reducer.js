/**
 * External dependencies
 */
import { get, isArray, merge, omit, stubFalse, stubTrue } from 'lodash';

/**
 * Internal dependencies
 */
import {
	combineReducers,
	keyedReducer,
	withSchemaValidation,
	withoutPersistence,
} from 'state/utils';
import { validationSchemas } from './validation-schemas/reducer';
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
	DOMAIN_MANAGEMENT_WHOIS_UPDATE,
} from 'state/action-types';
import { whoisType } from '../../../lib/domains/whois/constants';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps domain to whether a request is in progress.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const isRequestingContactDetailsCache = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_REQUEST:
			return stubTrue( state, action );
		case DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_REQUEST_SUCCESS:
			return stubFalse( state, action );
		case DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_REQUEST_FAILURE:
			return stubFalse( state, action );
	}

	return state;
} );

export const isRequestingWhois = keyedReducer(
	'domain',
	withoutPersistence( ( state = false, action ) => {
		switch ( action.type ) {
			case DOMAIN_MANAGEMENT_WHOIS_REQUEST:
				return stubTrue( state, action );
			case DOMAIN_MANAGEMENT_WHOIS_REQUEST_SUCCESS:
				return stubFalse( state, action );
			case DOMAIN_MANAGEMENT_WHOIS_REQUEST_FAILURE:
				return stubFalse( state, action );
		}

		return state;
	} )
);

/**
 * Returns the save request status after an action has been dispatched. The
 * state maps domain to the request status
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const isSaving = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case DOMAIN_MANAGEMENT_WHOIS_SAVE: {
			const { domain } = action;

			return {
				...state,
				[ domain ]: { saving: true, status: 'pending', error: false },
			};
		}
		case DOMAIN_MANAGEMENT_WHOIS_SAVE_SUCCESS: {
			const { domain } = action;

			return {
				...state,
				[ domain ]: { saving: false, status: 'success', error: false },
			};
		}
		case DOMAIN_MANAGEMENT_WHOIS_SAVE_FAILURE: {
			const { domain, error } = action;

			return {
				...state,
				[ domain ]: { saving: false, status: 'error', error },
			};
		}
	}

	return state;
} );

function mergeDomainRegistrantContactDetails( domainState, registrantContactDetails ) {
	return isArray( domainState )
		? domainState.map( ( item ) => {
				if ( item.type === whoisType.REGISTRANT ) {
					return {
						...item,
						...registrantContactDetails,
					};
				}
				return item;
		  } )
		: [
				{
					...registrantContactDetails,
					type: whoisType.REGISTRANT,
				},
		  ];
}

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps domain to the domain's whoisData object.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const items = withSchemaValidation( domainWhoisSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_RECEIVE: {
			const { data } = action;

			return {
				...state,
				_contactDetailsCache: sanitizeExtra( data ),
			};
		}
		case DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_UPDATE: {
			const { data } = action;
			return merge( {}, sanitizeExtra( state ), { _contactDetailsCache: sanitizeExtra( data ) } );
		}
		case DOMAIN_MANAGEMENT_WHOIS_RECEIVE: {
			const { domain, whoisData } = action;

			return {
				...state,
				[ domain ]: whoisData,
			};
		}
		case DOMAIN_MANAGEMENT_WHOIS_UPDATE: {
			const { domain, whoisData } = action;
			const domainState = state[ domain ];
			return merge( {}, state, {
				[ domain ]: mergeDomainRegistrantContactDetails(
					domainState !== undefined ? domainState : {},
					whoisData
				),
			} );
		}
	}

	return state;
} );

export default combineReducers( {
	items,
	isRequestingContactDetailsCache,
	isRequestingWhois,
	isSaving,
	validationSchemas,
} );

/**
 * Drop data.extra if it's an array
 *
 * Assigning extra as an array (due to a bug in the server) leads to a
 * a really weird state that effectively disables the extra form for the user
 * permanently.
 *
 * These values will be persisted locally, so we need to handle them here
 * even if we catch them all on the backend.
 *
 * In case you're curios, Here's the weirdness:
 *
 *   weird = Object.assign( [1,2,3], { foo:'bar' } )
 *   // [1, 2, 3, foo: "bar"] (wat?)
 *   weird.map( v => v );
 *   // [1, 2, 3] (no foo for you!)
 *
 * @param  {object} data   Potential contact details
 * @returns {object}        Sanitized contact details
 */
function sanitizeExtra( data ) {
	const path = data._contactDetailsCache ? [ '_contactDetailsCache', 'extra' ] : 'extra';
	return data && isArray( get( data, path ) ) ? omit( data, path ) : data;
}
