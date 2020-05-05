/**
 * External dependencies
 */
import { orderBy } from 'lodash';

/**
 * Internal dependencies
 */
import {
	combineReducers,
	keyedReducer,
	withSchemaValidation,
	withoutPersistence,
} from 'state/utils';
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
import { forwardsSchema, mxSchema, typeSchema } from './schema';

export const requestingReducer = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case EMAIL_FORWARDING_REQUEST:
			return true;
		case EMAIL_FORWARDING_REQUEST_SUCCESS:
			return false;
		case EMAIL_FORWARDING_REQUEST_FAILURE:
			return false;
	}

	return state;
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
	return ( forwards || [] ).map( ( forward ) => {
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
		( forward ) => forward.mailbox !== mailbox || forward.temporary !== true
	);
};

const handleRemoveRequestSuccess = ( forwards, { mailbox } ) => {
	return ( forwards || [] ).filter( ( forward ) => mailbox !== forward.mailbox );
};

const changeMailBoxTemporary = ( temporary ) => ( forwards, { mailbox } ) => {
	return ( forwards || [] ).map( ( forward ) => {
		if ( mailbox === forward.mailbox ) {
			return {
				...forward,
				temporary,
			};
		}
		return forward;
	} );
};

export const typeReducer = withSchemaValidation( typeSchema, ( state = null, action ) => {
	switch ( action.type ) {
		case EMAIL_FORWARDING_REQUEST:
			return null;
		case EMAIL_FORWARDING_REQUEST_FAILURE:
			return null;
		case EMAIL_FORWARDING_REQUEST_SUCCESS: {
			const {
				response: { type },
			} = action;
			return type || null;
		}
	}

	return state;
} );

export const mxServersReducer = withSchemaValidation( mxSchema, ( state = null, action ) => {
	switch ( action.type ) {
		case EMAIL_FORWARDING_REQUEST:
			return null;
		case EMAIL_FORWARDING_REQUEST_FAILURE:
			return null;
		case EMAIL_FORWARDING_REQUEST_SUCCESS: {
			const {
				response: { mx_servers },
			} = action;
			return mx_servers || [];
		}
	}

	return state;
} );

export const forwardsReducer = withSchemaValidation( forwardsSchema, ( state = null, action ) => {
	switch ( action.type ) {
		case EMAIL_FORWARDING_REQUEST:
			return null;
		case EMAIL_FORWARDING_REQUEST_FAILURE:
			return null;
		case EMAIL_FORWARDING_REQUEST_SUCCESS: {
			const {
				response: { forwards },
			} = action;
			return forwards || [];
		}
		case EMAIL_FORWARDING_ADD_REQUEST:
			return handleCreateRequest( state, action );
		case EMAIL_FORWARDING_ADD_REQUEST_SUCCESS:
			return handleCreateRequestSuccess( state, action );
		case EMAIL_FORWARDING_ADD_REQUEST_FAILURE:
			return handleCreateRequestFailure( state, action );
		case EMAIL_FORWARDING_REMOVE_REQUEST:
			return changeMailBoxTemporary( true )( state, action );
		case EMAIL_FORWARDING_REMOVE_REQUEST_SUCCESS:
			return handleRemoveRequestSuccess( state, action );
		case EMAIL_FORWARDING_REMOVE_REQUEST_FAILURE:
			return changeMailBoxTemporary( false )( state, action );
		case EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST:
			return changeMailBoxTemporary( true )( state, action );
		case EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST_SUCCESS:
			return changeMailBoxTemporary( false )( state, action );
		case EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST_FAILURE:
			return changeMailBoxTemporary( false )( state, action );
	}

	return state;
} );

export const requestErrorReducer = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case EMAIL_FORWARDING_REQUEST:
			return false;
		case EMAIL_FORWARDING_REQUEST_SUCCESS:
			return false;
		case EMAIL_FORWARDING_REQUEST_FAILURE: {
			const {
				error: { message },
			} = action;
			return message || true;
		}
	}

	return state;
} );

export default keyedReducer(
	'domainName',
	combineReducers( {
		forwards: forwardsReducer,
		mxServers: mxServersReducer,
		requesting: requestingReducer,
		requestError: requestErrorReducer,
		type: typeReducer,
	} )
);
