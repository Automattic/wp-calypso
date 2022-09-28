import { markCredentialsAsInvalid, markCredentialsAsValid, testCredentials } from '../actions';
import { testRequestStatus } from '../reducer';

describe( 'reducer', () => {
	describe( 'testRequestStatus', () => {
		test( 'should return the initial state', () => {
			expect( testRequestStatus( undefined, {} ) ).toEqual( {} );
		} );

		test( 'status should be valid if the credentials are okay', () => {
			const stateIn = {};
			const action = markCredentialsAsValid( 123000, 'main' );

			const stateOut = testRequestStatus( stateIn, action );
			expect( stateOut ).toEqual( {
				123000: {
					main: 'valid',
				},
			} );
		} );

		test( 'status should be invalid if the credentials are not okay', () => {
			const stateIn = {};
			const action = markCredentialsAsInvalid( 234000, 'main' );

			const stateOut = testRequestStatus( stateIn, action );
			expect( stateOut ).toEqual( {
				234000: {
					main: 'invalid',
				},
			} );
		} );

		test( 'status should be pending if we started the credentials test process', () => {
			const stateIn = {};
			const action = testCredentials( 345000, 'main' );

			const stateOut = testRequestStatus( stateIn, action );
			expect( stateOut ).toEqual( {
				345000: {
					main: 'pending',
				},
			} );
		} );

		test( 'should keep existing roles statuses after requesting a new test', () => {
			const stateIn = {
				456000: {
					main: 'valid',
				},
			};
			const action = testCredentials( 456000, 'alternate' );

			const stateOut = testRequestStatus( stateIn, action );
			expect( stateOut ).toEqual( {
				456000: {
					main: 'valid',
					alternate: 'pending',
				},
			} );
		} );

		test( 'should keep existing roles statuses after marking a role as valid', () => {
			const stateIn = {
				567000: {
					main: 'valid',
					alternate: 'pending',
				},
			};
			const action = markCredentialsAsValid( 567000, 'alternate' );

			const stateOut = testRequestStatus( stateIn, action );
			expect( stateOut ).toEqual( {
				567000: {
					main: 'valid',
					alternate: 'valid',
				},
			} );
		} );

		test( 'should keep existing roles statuses after marking a role as invalid', () => {
			const stateIn = {
				678000: {
					main: 'valid',
					alternate: 'pending',
				},
			};
			const action = markCredentialsAsInvalid( 678000, 'alternate' );

			const stateOut = testRequestStatus( stateIn, action );
			expect( stateOut ).toEqual( {
				678000: {
					main: 'valid',
					alternate: 'invalid',
				},
			} );
		} );
	} );
} );
