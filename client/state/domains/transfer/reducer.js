/**
 * Internal dependencies
 */
import initialDomainState from './initial';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { domainTransferSchema } from './schema';
import {
	DOMAIN_TRANSFER_ACCEPT,
	DOMAIN_TRANSFER_ACCEPT_COMPLETED,
	DOMAIN_TRANSFER_CANCEL_REQUEST,
	DOMAIN_TRANSFER_CANCEL_REQUEST_COMPLETED,
	DOMAIN_TRANSFER_CANCEL_REQUEST_FAILED,
	DOMAIN_TRANSFER_CODE_REQUEST,
	DOMAIN_TRANSFER_CODE_REQUEST_COMPLETED,
	DOMAIN_TRANSFER_CODE_REQUEST_FAILED,
	DOMAIN_TRANSFER_DECLINE_COMPLETED,
	DOMAIN_TRANSFER_UPDATE,
	DOMAIN_WAPI_INFO_FETCH,
	DOMAIN_WAPI_INFO_FETCH_FAILURE,
	DOMAIN_WAPI_INFO_FETCH_SUCCESS,
} from 'calypso/state/action-types';

function updateDomainState( state, domain, data ) {
	return Object.assign( {}, state, {
		[ domain ]: {
			...initialDomainState,
			...state[ domain ],
			...data,
		},
	} );
}

/**
 * Returns the updated state after an action has been dispatched. The
 * state maps domain to the domain's transfer object.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const items = withSchemaValidation( domainTransferSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case DOMAIN_TRANSFER_UPDATE: {
			const { domain, options } = action;

			return {
				...state,
				[ domain ]: options,
			};
		}
		case DOMAIN_TRANSFER_CODE_REQUEST: {
			return updateDomainState( state, action.domain, {
				isRequestingTransferCode: true,
			} );
		}
		case DOMAIN_TRANSFER_CODE_REQUEST_COMPLETED: {
			const { data } = state[ action.domain ];
			const locked = ! action.options.unlock && data.locked;

			return updateDomainState( state, action.domain, {
				data: Object.assign( {}, state[ action.domain ].data, {
					locked,
				} ),
				needsUpdate: true,
				isRequestingTransferCode: false,
			} );
		}
		case DOMAIN_TRANSFER_CODE_REQUEST_FAILED: {
			return updateDomainState( state, action.domain, {
				isRequestingTransferCode: false,
			} );
		}
		case DOMAIN_TRANSFER_CANCEL_REQUEST: {
			return updateDomainState( state, action.domain, {
				isCancelingTransfer: true,
			} );
		}
		case DOMAIN_TRANSFER_CANCEL_REQUEST_COMPLETED: {
			return updateDomainState( state, action.domain, {
				isCancelingTransfer: false,
				data: Object.assign( {}, state[ action.domain ].data, {
					locked: action.options.locked,
					pendingTransfer: false,
				} ),
			} );
		}
		case DOMAIN_TRANSFER_CANCEL_REQUEST_FAILED: {
			return updateDomainState( state, action.domain, {
				isCancelingTransfer: false,
			} );
		}
		case DOMAIN_TRANSFER_ACCEPT: {
			return updateDomainState( state, action.domain, {
				isAcceptingTransfer: true,
			} );
		}
		case DOMAIN_TRANSFER_ACCEPT_COMPLETED: {
			return updateDomainState( state, action.domain, {
				isAcceptingTransfer: false,
				data: Object.assign( {}, state[ action.domain ].data, {
					pendingTransfer: false,
				} ),
			} );
		}
		case DOMAIN_TRANSFER_DECLINE_COMPLETED: {
			return updateDomainState( state, action.domain, {
				data: Object.assign( {}, state[ action.domain ].data, {
					pendingTransfer: false,
				} ),
			} );
		}
		case DOMAIN_WAPI_INFO_FETCH:
		case DOMAIN_WAPI_INFO_FETCH_FAILURE: {
			return updateDomainState( state, action.domain, {
				needsUpdate: false,
			} );
		}

		case DOMAIN_WAPI_INFO_FETCH_SUCCESS: {
			return updateDomainState( state, action.domain, {
				hasLoadedFromServer: true,
				data: action.status,
				needsUpdate: false,
			} );
		}
	}

	return state;
} );

export default combineReducers( {
	items,
} );
