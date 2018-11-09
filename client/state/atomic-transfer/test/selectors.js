/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getAtomicTransfer, getAtomicTransferStatus } from '../selectors';

const siteId = 1;
describe( 'selectors', () => {
	describe( 'getAtomicTransfer()', () => {
		test( 'should return an empty object as a default state', () => {
			const state = deepFreeze( {
				atomicTransfer: { [ siteId ]: {} },
			} );

			expect( getAtomicTransfer( state, siteId ) ).to.eql( {} );
		} );

		test( 'should return a transfer object if available', () => {
			const state = deepFreeze( {
				atomicTransfer: {
					[ siteId ]: {
						status: 'pending',
					},
				},
			} );

			expect( getAtomicTransfer( state, siteId ) ).to.eql( state.atomicTransfer[ siteId ] );
		} );
	} );

	describe( 'getAtomicTransferStatus()', () => {
		test( 'should return a null status by default', () => {
			const state = deepFreeze( {
				atomicTransfer: { [ siteId ]: {} },
			} );

			expect( getAtomicTransferStatus( state, siteId ) ).to.be.null;
		} );

		test( 'should return the status for an existing transfer', () => {
			const state = deepFreeze( {
				atomicTransfer: {
					[ siteId ]: {
						status: 'pending',
					},
				},
			} );
			expect( getAtomicTransferStatus( state, siteId ) ).to.eql( 'pending' );
		} );
	} );
} );
