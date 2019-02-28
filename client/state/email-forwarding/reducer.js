/** @format */

/**
 * External dependencies
 */
import { orderBy } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import {
	EMAIL_FORWARDING_REQUEST,
	EMAIL_FORWARDING_REQUEST_SUCCESS,
	EMAIL_FORWARDING_REQUEST_FAILURE,
	EMAIL_FORWARDING_ADD_REQUEST,
	EMAIL_FORWARDING_ADD_REQUEST_SUCCESS,
	EMAIL_FORWARDING_ADD_REQUEST_FAILURE,
	EMAIL_FORWARDING_REMOVE_REQUEST,
	EMAIL_FORWARDING_REMOVE_REQUEST_SUCCESS,
	EMAIL_FORWARDING_REMOVE_REQUEST_FAILURE,
	EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST,
	EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST_SUCCESS,
	EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST_FAILURE,
} from 'state/action-types';
import { forwardsSchema } from './schema';

export const requesting = createReducer( false, {
	[ EMAIL_FORWARDING_REQUEST ]: () => true,
	[ EMAIL_FORWARDING_REQUEST_SUCCESS ]: () => false,
	[ EMAIL_FORWARDING_REQUEST_FAILURE ]: () => false,
} );

const handleCreateRequest = ( forwards, { domainName, mailbox, destination } ) => {
	return orderBy(
		[
			...( forwards || [] ),
			{
				email: `${ mailbox }@${ domainName }`,
				mailbox,
				domain: domainName,
				forward_address: destination,
				active: false,
				temporary: true,
			},
		],
		[ 'mailbox' ],
		[ 'asc' ]
	);
};

const handleCreateRequestSuccess = ( forwards, { mailbox, verified } ) => {
	return ( forwards || [] ).map( forward => {
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
	return ( forwards || [] ).filter(
		forward => forward.mailbox !== mailbox || forward.temporary !== true
	);
};

const handleRemoveRequestSuccess = ( forwards, { mailbox } ) => {
	return ( forwards || [] ).filter( forward => mailbox !== forward.mailbox );
};

const changeMailBoxTemporary = temporary => ( forwards, { mailbox } ) => {
	return ( forwards || [] ).map( forward => {
		if ( mailbox === forward.mailbox ) {
			return {
				...forward,
				temporary,
			};
		}
		return forward;
	} );
};

export const forwards = createReducer(
	null,
	{
		[ EMAIL_FORWARDING_REQUEST ]: () => null,
		[ EMAIL_FORWARDING_REQUEST_SUCCESS ]: ( state, { forwards: newForwards } ) => newForwards,
		[ EMAIL_FORWARDING_ADD_REQUEST ]: handleCreateRequest,
		[ EMAIL_FORWARDING_ADD_REQUEST_SUCCESS ]: handleCreateRequestSuccess,
		[ EMAIL_FORWARDING_ADD_REQUEST_FAILURE ]: handleCreateRequestFailure,
		[ EMAIL_FORWARDING_REMOVE_REQUEST ]: changeMailBoxTemporary( true ),
		[ EMAIL_FORWARDING_REMOVE_REQUEST_SUCCESS ]: handleRemoveRequestSuccess,
		[ EMAIL_FORWARDING_REMOVE_REQUEST_FAILURE ]: changeMailBoxTemporary( false ),
		[ EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST ]: changeMailBoxTemporary( true ),
		[ EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST_SUCCESS ]: changeMailBoxTemporary( false ),
		[ EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST_FAILURE ]: changeMailBoxTemporary( false ),
	},
	forwardsSchema
);

export const requestError = createReducer( false, {
	[ EMAIL_FORWARDING_REQUEST ]: () => false,
	[ EMAIL_FORWARDING_REQUEST_SUCCESS ]: () => false,
	[ EMAIL_FORWARDING_REQUEST_FAILURE ]: () => true,
} );

export default keyedReducer(
	'domainName',
	combineReducers( {
		forwards,
		requesting,
		requestError,
	} )
);
