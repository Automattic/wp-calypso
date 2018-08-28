/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { TRANSACTION_CREATE_REQUEST, TRANSACTION_CREATE_SUCCESS, TRANSACTION_CREATE_FAILURE } from 'state/action-types';


export const createTransaction = ( request ) => ( {
    type: TRANSACTION_CREATE_REQUEST,
    request
} );

export const setCreateTransactionResponse = ( action, response ) => ( {
    type: TRANSACTION_CREATE_SUCCESS,
    response
} );

export const setCreateTransactionError = ( action, error ) => ( {
    type: TRANSACTION_CREATE_FAILURE,
    error
} );
