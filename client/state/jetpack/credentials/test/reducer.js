import { markCredentialsAsInvalid, markCredentialsAsValid, testCredentials } from '../actions';
import { testRequestStatus } from '../reducer';

describe( 'reducer', () => {
	describe( 'testRequestStatus', () => {
		test( 'should return the initial state', () => {
			expect( testRequestStatus( undefined, {} ) ).toEqual( {} );
		} );

		test( 'state should be valid if the credentials are okay', () => {
			const stateIn = undefined;
			const action = markCredentialsAsValid( 123000, 'main' );

			const stateOut = testRequestStatus( stateIn, action );
			expect( stateOut ).toEqual( {
				123000: {
					main: 'valid',
				},
			} );
		} );

		test( 'state should be invalid if the credentials are not okay', () => {
			const stateIn = undefined;
			const action = markCredentialsAsInvalid( 234000, 'main' );

			const stateOut = testRequestStatus( stateIn, action );
			expect( stateOut ).toEqual( {
				234000: {
					main: 'invalid',
				},
			} );
		} );

		test( 'state should be pending if we started the credentials test process', () => {
			const stateIn = undefined;
			const action = testCredentials( 345000, 'main' );

			const stateOut = testRequestStatus( stateIn, action );
			expect( stateOut ).toEqual( {
				345000: {
					main: 'pending',
				},
			} );
		} );
	} );
} );
