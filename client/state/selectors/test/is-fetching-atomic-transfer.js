/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isFetchingAtomicTransfer from 'calypso/state/selectors/is-fetching-atomic-transfer';

describe( 'isFetchingAtomicTransfer()', () => {
	test( 'should return false if the transfer is not found', () => {
		const state = {
			atomicTransfer: {},
		};

		expect( isFetchingAtomicTransfer( state ) ).to.be.false;
		expect( isFetchingAtomicTransfer( state, 12345 ) ).to.be.false;
	} );

	test( 'should return false when transfer status is not being fetched yet for a given site', () => {
		const state = {
			atomicTransfer: {
				12345: {
					fetchingTransfer: false,
				},
			},
		};

		expect( isFetchingAtomicTransfer( state, 12345 ) ).to.be.false;
	} );

	test( 'should return true when transfer status is being fetched for a given site', () => {
		const state = {
			atomicTransfer: {
				12345: {
					fetchingTransfer: true,
				},
			},
		};

		expect( isFetchingAtomicTransfer( state, 12345 ) ).to.be.true;
	} );
} );
