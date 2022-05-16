import {
	ATOMIC_TRANSFER_REQUEST as TRANSFER_REQUEST,
	ATOMIC_TRANSFER_SET as SET_TRANSFER,
} from 'calypso/state/action-types';
import { fetchAtomicTransfer, setAtomicTransfer } from '../actions';

describe( 'action', () => {
	describe( 'fetchAtomicTransfer', () => {
		test( 'should return a transfer request action', () => {
			const requestAction = fetchAtomicTransfer( 1 );

			expect( requestAction ).toEqual( {
				type: TRANSFER_REQUEST,
				siteId: 1,
			} );
		} );
	} );

	describe( 'setAtomicTransfer', () => {
		test( 'should return a the a set transfer action object', () => {
			const transfer = { status: 'pending' };
			const setTransferAction = setAtomicTransfer( 1, transfer );

			expect( setTransferAction ).toEqual( {
				type: SET_TRANSFER,
				siteId: 1,
				transfer,
			} );
		} );
	} );
} );
