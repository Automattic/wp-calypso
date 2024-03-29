import {
	RECEIPT_FETCH,
	RECEIPT_FETCH_COMPLETED,
	RECEIPT_FETCH_FAILED,
} from 'calypso/state/action-types';
import { items } from '../reducer';

describe( 'reducer', () => {
	describe( '#items()', () => {
		test( 'should return an empty state when original state is undefined and action is empty', () => {
			const state = items( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should return the initial state with requesting enabled when fetching is triggered', () => {
			const state = items( undefined, {
				type: RECEIPT_FETCH,
				receiptId: 11111111,
			} );

			expect( state ).toEqual( {
				11111111: {
					data: null,
					error: null,
					hasLoadedFromServer: false,
					isRequesting: true,
				},
			} );
		} );

		test( 'should return the original state with an error and requesting disabled when fetching failed', () => {
			const original = Object.freeze( {
				11111111: {
					data: null,
					error: null,
					hasLoadedFromServer: true,
					isRequesting: true,
				},
			} );
			const state = items( original, {
				type: RECEIPT_FETCH_FAILED,
				receiptId: 11111111,
				error: 'Unable to fetch the receipt.',
			} );

			expect( state ).toEqual( {
				11111111: {
					data: null,
					error: 'Unable to fetch the receipt.',
					hasLoadedFromServer: true,
					isRequesting: false,
				},
			} );
		} );

		test( 'should return an updated state with new properties when fetching completes', () => {
			const original = Object.freeze( {
				11111111: {
					data: { amount: 10 },
					error: null,
					hasLoadedFromServer: true,
					isRequesting: true,
				},
			} );
			const state = items( original, {
				type: RECEIPT_FETCH_COMPLETED,
				receiptId: 11111111,
				receipt: { amount: 20 },
			} );

			expect( state ).toEqual( {
				11111111: {
					data: { amount: 20 },
					error: null,
					hasLoadedFromServer: true,
					isRequesting: false,
				},
			} );
		} );
	} );
} );
