/**
 * Internal dependencies
 */
import getAtomicTransfer from 'calypso/state/selectors/get-atomic-transfer';

describe( 'getAtomicTransfer()', () => {
	const testState = {
		atomicTransfer: {
			1234: {
				status: 'pending',
			},
		},
	};

	test( 'should return an empty object when not given a site id', () => {
		expect( getAtomicTransfer( testState ) ).toEqual( {} );
	} );

	test( 'should return an empty object when there is no transer for the site', () => {
		expect( getAtomicTransfer( testState, 1 ) ).toEqual( {} );
	} );

	test( 'should return a transfer object for the a site', () => {
		expect( getAtomicTransfer( testState, 1234 ) ).toEqual( { status: 'pending' } );
	} );
} );
