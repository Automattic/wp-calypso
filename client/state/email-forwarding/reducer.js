/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import {
	EMAIL_FORWARDING_REQUEST,
	EMAIL_FORWARDING_RECEIVE,
	EMAIL_FORWARDING_FAILURE,
} from 'state/action-types';

const forwards = createReducer( null, {
	[ EMAIL_FORWARDING_FAILURE ]: () => null,
	[ EMAIL_FORWARDING_RECEIVE ]: ( state, { data } ) => data.forwards,
	[ EMAIL_FORWARDING_REQUEST ]: () => null,
} );

const isRequesting = createReducer( false, {
	[ EMAIL_FORWARDING_FAILURE ]: () => false,
	[ EMAIL_FORWARDING_RECEIVE ]: () => false,
	[ EMAIL_FORWARDING_REQUEST ]: () => true,
} );

const forwardsError = createReducer( null, {
	[ EMAIL_FORWARDING_FAILURE ]: ( state, { error } ) => error,
	[ EMAIL_FORWARDING_RECEIVE ]: () => null,
	[ EMAIL_FORWARDING_REQUEST ]: () => null,
} );

export default keyedReducer(
	'domainName',
	combineReducers( {
		forwards,
		isRequesting,
		forwardsError,
	} )
);

// const initialDomainState = {
// 	hasLoadedFromServer: false,
// 	isFetching: false,
// 	list: null,
// 	needsUpdate: true,
// };

// /**
//  * @desc Updates email forwarding entry for given domain.
//  *
//  * @param {Object} [state] Current state.
//  * @param {string} [domainName] Domain name.
//  * @param {Object} [data] Domain email forwarding data.
//  * @return {Object} New state.
//  */
// function updateDomainState( state, domainName, data ) {
// 	const command = {
// 		[ domainName ]: {
// 			$set: Object.assign( {}, state[ domainName ] || initialDomainState, data ),
// 		},
// 	};

// 	return update( state, command );
// }

// /**
//  * @desc Removes mailbox entry until we update from the server.
//  *
//  * @param {Object} [state] Current state.
//  * @param {string} [domainName] Domain name.
//  * @param {String} [mailbox] Mailbox name.
//  * @return {Object} New state
//  */
// function deleteTemporaryMailbox( state, domainName, mailbox ) {
// 	const index = findIndex( state[ domainName ].list, { mailbox } );

// 	if ( index === -1 ) {
// 		return state;
// 	}

// 	const command = {
// 		[ domainName ]: {
// 			list: { $splice: [ [ index, 1 ] ] },
// 			needsUpdate: { $set: true },
// 		},
// 	};

// 	return update( state, command );
// }

// /**
//  * @desc Adds mailbox entry until we update from the server.
//  *
//  * @param {Object} [state] Current state.
//  * @param {string} [domainName] Domain name.
//  * @param {Object} [mailboxData] New mailbox data.
//  * @return {Object} New state
//  */
// function addTemporaryMailbox( state, domainName, mailboxData ) {
// 	const command = {
// 		[ domainName ]: {
// 			list: {
// 				$apply: oldList => sortBy( oldList.concat( [ mailboxData ] ), 'mailbox' ),
// 			},
// 			needsUpdate: { $set: true },
// 		},
// 	};

// 	return update( state, command );
// }

// function reducer( state, payload ) {
// 	const { action } = payload;

// 	switch ( action.type ) {
// 		case EMAIL_FORWARDING_REQUEST:
// 			state = updateDomainState( state, action.domainName, {
// 				isFetching: true,
// 				needsUpdate: false,
// 			} );
// 			break;
// 		case EMAIL_FORWARDING_FAILURE:
// 			state = updateDomainState( state, action.domainName, {
// 				isFetching: false,
// 				needsUpdate: true,
// 			} );
// 			break;
// 		case EMAIL_FORWARDING_RECEIVE:
// 			state = updateDomainState( state, action.domainName, {
// 				hasLoadedFromServer: true,
// 				isFetching: false,
// 				list: action.forwards || [],
// 				needsUpdate: false,
// 			} );
// 			break;
// 		case EMAIL_FORWARDING_ADD_COMPLETED:
// 			state = addTemporaryMailbox( state, action.domainName, {
// 				active: true,
// 				domain: action.domainName,
// 				email: `${ action.mailbox }@${ action.domainName }`,
// 				mailbox: action.mailbox,
// 				forward_address: action.destination,
// 				temporary: true,
// 			} );
// 			break;
// 		case EMAIL_FORWARDING_DELETE_COMPLETED:
// 			state = deleteTemporaryMailbox( state, action.domainName, action.mailbox );
// 			break;
// 	}

// 	return state;
// }

// export { initialDomainState, reducer };
