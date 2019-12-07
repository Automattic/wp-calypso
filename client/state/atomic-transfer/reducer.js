/**
 * Internal dependencies
 */
import {
	combineReducers,
	keyedReducer,
	createReducer,
	createReducerWithValidation,
} from 'state/utils';
import { atomicTransfer as schema } from './schema';
import {
	ATOMIC_TRANSFER_REQUEST,
	ATOMIC_TRANSFER_REQUEST_FAILURE,
	ATOMIC_TRANSFER_SET,
	ATOMIC_TRANSFER_COMPLETE,
} from 'state/action-types';

export const atomicTransfer = createReducerWithValidation(
	{},
	{
		[ ATOMIC_TRANSFER_SET ]: ( state, { transfer } ) => ( { ...state, ...transfer } ),
	},
	schema
);

export const fetchingTransfer = createReducer( false, {
	[ ATOMIC_TRANSFER_REQUEST ]: () => true,
	[ ATOMIC_TRANSFER_REQUEST_FAILURE ]: () => false,
	[ ATOMIC_TRANSFER_COMPLETE ]: () => false,
} );

export const atomicTransferReducers = combineReducers( {
	atomicTransfer,
	fetchingTransfer,
} );

//export default atomicTransferReducers;
export default keyedReducer( 'siteId', atomicTransferReducers );
