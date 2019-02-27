/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import {
	EMAIL_FORWARDING_REQUEST,
	EMAIL_FORWARDING_REQUEST_SUCCESS,
	EMAIL_FORWARDING_REQUEST_FAILURE,
	EMAIL_FORWARDING_CREATE_REQUEST,
	EMAIL_FORWARDING_CREATE_REQUEST_SUCCESS,
	EMAIL_FORWARDING_CREATE_REQUEST_FAILURE,
	EMAIL_FORWARDING_REMOVE_REQUEST,
	EMAIL_FORWARDING_REMOVE_REQUEST_SUCCESS,
	EMAIL_FORWARDING_REMOVE_REQUEST_FAILURE,
} from 'state/action-types';
import { forwardsSchema } from './schema';

export const isRequesting = createReducer( false, {
	[ EMAIL_FORWARDING_REQUEST ]: () => true,
	[ EMAIL_FORWARDING_REQUEST_SUCCESS ]: () => false,
	[ EMAIL_FORWARDING_REQUEST_FAILURE ]: () => false,
} );

export const isCreateRequesting = createReducer( false, {
	[ EMAIL_FORWARDING_CREATE_REQUEST ]: () => true,
	[ EMAIL_FORWARDING_CREATE_REQUEST_SUCCESS ]: () => false,
	[ EMAIL_FORWARDING_CREATE_REQUEST_FAILURE ]: () => false,
} );

export const isRemoveRequesting = createReducer( false, {
	[ EMAIL_FORWARDING_REMOVE_REQUEST ]: () => true,
	[ EMAIL_FORWARDING_REMOVE_REQUEST_SUCCESS ]: () => false,
	[ EMAIL_FORWARDING_REMOVE_REQUEST_FAILURE ]: () => false,
} );

const handleCreateRequest = ( forwards, { domainName, mailbox, destination } ) => {
	return [
		...forwards,
		{
			email: `${ mailbox }@${ domainName }`,
			mailbox,
			domain: domainName,
			forward_address: destination,
			active: false,
			temporary: true,
		},
	];
};

const handleCreateRequestSuccess = ( forwards, { mailbox, verified } ) => {
	return forwards.map( forward => {
		if ( forward.mailbox === mailbox ) {
			return {
				...forward,
				active: verified,
				temporary: false,
			};
		}
		return forward;
	} );
};

const handleCreateRequestFailure = ( forwards, { mailbox } ) => {
	return forwards.filter( forward => forward.mailbox !== mailbox || forward.temporary !== true );
};

const handleRemoveRequest = ( forwards, { mailbox } ) => {
	return forwards.map( forward => {
		if ( mailbox === forward.mailbox ) {
			return {
				...forward,
				temporary: true,
			};
		}
		return forward;
	} );
};

const handleRemoveRequestSuccess = ( forwards, { mailbox } ) => {
	return forwards.filter( forward => mailbox !== forward.mailbox );
};

const handleRemoveRequestFailure = ( forwards, { mailbox } ) => {
	return forwards.map( forward => {
		if ( mailbox === forward.mailbox ) {
			return {
				...forward,
				temporary: false,
			};
		}
		return forward;
	} );
};

export const forwards = createReducer(
	null,
	{
		[ EMAIL_FORWARDING_REQUEST ]: () => null,
		[ EMAIL_FORWARDING_REQUEST_SUCCESS ]: ( state, { data } ) => data.forwards,
		[ EMAIL_FORWARDING_CREATE_REQUEST ]: handleCreateRequest,
		[ EMAIL_FORWARDING_CREATE_REQUEST_SUCCESS ]: handleCreateRequestSuccess,
		[ EMAIL_FORWARDING_CREATE_REQUEST_FAILURE ]: handleCreateRequestFailure,
		[ EMAIL_FORWARDING_REMOVE_REQUEST ]: handleRemoveRequest,
		[ EMAIL_FORWARDING_REMOVE_REQUEST_SUCCESS ]: handleRemoveRequestSuccess,
		[ EMAIL_FORWARDING_REMOVE_REQUEST_FAILURE ]: handleRemoveRequestFailure,
	},
	forwardsSchema
);

export const getErrors = createReducer( null, {
	[ EMAIL_FORWARDING_REQUEST_SUCCESS ]: () => null,
	[ EMAIL_FORWARDING_REQUEST_FAILURE ]: ( state, { error } ) => error,
} );

export const createErrors = createReducer( null, {
	[ EMAIL_FORWARDING_CREATE_REQUEST_SUCCESS ]: () => null,
	[ EMAIL_FORWARDING_CREATE_REQUEST_FAILURE ]: ( state, { error } ) => error,
} );

export const removeErrors = createReducer( null, {
	[ EMAIL_FORWARDING_REMOVE_REQUEST_SUCCESS ]: () => null,
	[ EMAIL_FORWARDING_REMOVE_REQUEST_FAILURE ]: ( state, { error } ) => error,
} );

export default keyedReducer(
	'domainName',
	combineReducers( {
		forwards,
		requesting: combineReducers( {
			get: isRequesting,
			create: isCreateRequesting,
			remove: isRemoveRequesting,
		} ),
		errors: combineReducers( {
			get: getErrors,
			create: createErrors,
			remove: removeErrors,
		} ),
	} )
);
