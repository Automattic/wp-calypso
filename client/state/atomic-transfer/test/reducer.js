import {
	ATOMIC_TRANSFER_REQUEST as TRANSFER_REQUEST,
	ATOMIC_TRANSFER_SET as SET_TRANSFER,
} from 'calypso/state/action-types';
import { transferStates } from '../constants';
import { atomicTransfer } from '../reducer';

describe( 'reducer', () => {
	describe( 'atomicTransfer', () => {
		describe( 'ATOMIC_TRANSFER_REQUEST', () => {
			test( 'should drop a client timeout status, keeping the rest of the transfer', () => {
				const state = {
					atomic_transfer_id: 1,
					blog_id: 1916284,
					status: transferStates.CLIENT_TIMEOUT,
				};

				expect( atomicTransfer( state, { type: TRANSFER_REQUEST } ) ).toEqual( {
					atomic_transfer_id: 1,
					blog_id: 1916284,
				} );
			} );

			test.each( [ transferStates.ACTIVE, transferStates.COMPLETED ] )(
				'should leave a %s status untouched',
				( status ) => {
					const state = { status };

					expect( atomicTransfer( state, { type: TRANSFER_REQUEST } ) ).toBe( state );
				}
			);

			test( 'should leave an empty state untouched', () => {
				expect( atomicTransfer( {}, { type: TRANSFER_REQUEST } ) ).toEqual( {} );
			} );
		} );

		describe( 'ATOMIC_TRANSFER_SET', () => {
			test( 'should merge the transfer into the state', () => {
				const state = { status: transferStates.PENDING };
				const transfer = { status: transferStates.ACTIVE, atomic_transfer_id: 1 };

				expect( atomicTransfer( state, { type: SET_TRANSFER, transfer } ) ).toEqual( {
					status: transferStates.ACTIVE,
					atomic_transfer_id: 1,
				} );
			} );
		} );
	} );
} );
