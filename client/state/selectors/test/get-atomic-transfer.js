/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getAtomicTransfer from 'calypso/state/selectors/get-atomic-transfer';

describe( 'getAtomicTransfer()', () => {
	const testState = {
		atomicTransfer: {
			1234: {
				atomicTransfer: {
					status: 'pending',
				},
			},
		},
	};

	test( 'should return an empty object when not given a site id', () => {
		expect( getAtomicTransfer( testState ) ).to.be.empty;
	} );

	test( 'should return an empty object when there is no transer for the site', () => {
		expect( getAtomicTransfer( testState, 1 ) ).to.be.empty;
	} );

	test( 'should return a transfer object for the a site', () => {
		expect( getAtomicTransfer( testState, 1234 ) ).to.eql( { status: 'pending' } );
	} );
} );
