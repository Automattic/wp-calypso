import { markCredentialsAsInvalid, markCredentialsAsValid, testCredentials } from '../actions';
import { testRequestStatus, testStatus } from '../reducer';

describe( 'reducer', () => {
	describe( 'testRequestStatus', () => {
		test( 'should return the initial state', () => {
			expect( testRequestStatus( undefined, {} ) ).toEqual( {} );
		} );

		test( 'should return true if we are requesting to test credentials', () => {
			const stateIn = {};
			const action = testCredentials( 123000, 'main' );
			const stateOut = testRequestStatus( stateIn, action );

			expect( stateOut ).toEqual( {
				123000: {
					main: true,
				},
			} );
		} );

		test( 'should return false if credentials are valid', () => {
			const stateIn = {};
			const action = markCredentialsAsValid( 123000, 'main' );
			const stateOut = testRequestStatus( stateIn, action );

			expect( stateOut ).toEqual( {
				123000: {
					main: false,
				},
			} );
		} );

		test( 'should return false if credentials are invalid', () => {
			const stateIn = {};
			const action = markCredentialsAsInvalid( 234000, 'main' );
			const stateOut = testRequestStatus( stateIn, action );

			expect( stateOut ).toEqual( {
				234000: {
					main: false,
				},
			} );
		} );

		test( 'should return true if credentials are valid (or invalid) and we request a new credentials test for same role', () => {
			const stateIn = {
				234000: {
					main: false,
				},
			};
			const action = testCredentials( 234000, 'main' );
			const stateOut = testRequestStatus( stateIn, action );

			expect( stateOut ).toEqual( {
				234000: {
					main: true,
				},
			} );
		} );

		test( 'should keep existing roles request statuses after requesting a new credentials test for a new role', () => {
			const stateIn = {
				123456: {
					main: false,
				},
			};
			const action = testCredentials( 123456, 'alternate' );
			const stateOut = testRequestStatus( stateIn, action );

			expect( stateOut ).toEqual( {
				123456: {
					main: false,
					alternate: true,
				},
			} );
		} );

		test( 'should keep existing sites data after requesting a credentials test for a new site', () => {
			const stateIn = {
				123456: {
					main: false,
					alternate: false,
				},
				987654: {
					main: false,
				},
			};
			const action = testCredentials( 999000, 'main' );
			const stateOut = testRequestStatus( stateIn, action );

			expect( stateOut ).toEqual( {
				123456: {
					main: false,
					alternate: false,
				},
				987654: {
					main: false,
				},
				999000: {
					main: true,
				},
			} );
		} );
	} );

	describe( 'testStatus', () => {
		test( 'should return the initial state', () => {
			expect( testStatus( undefined, {} ) ).toEqual( {} );
		} );

		test( 'should be valid if the credentials are okay', () => {
			const stateIn = {};
			const action = markCredentialsAsValid( 345000, 'main' );

			const stateOut = testStatus( stateIn, action );
			expect( stateOut ).toEqual( {
				345000: {
					main: 'valid',
				},
			} );
		} );

		test( 'should be invalid if the credentials are not okay', () => {
			const stateIn = {};
			const action = markCredentialsAsInvalid( 234000, 'main' );

			const stateOut = testStatus( stateIn, action );
			expect( stateOut ).toEqual( {
				234000: {
					main: 'invalid',
				},
			} );
		} );

		test( 'should keep previous value if we started a new credentials test for same role', () => {
			const stateIn = {
				456000: {
					main: 'valid',
				},
			};
			const action = testCredentials( 456000, 'main' );

			const stateOut = testStatus( stateIn, action );
			expect( stateOut ).toEqual( {
				456000: {
					main: 'valid',
				},
			} );
		} );

		test( 'should keep existing roles statuses after marking a role as valid', () => {
			const stateIn = {
				567000: {
					main: 'valid',
				},
			};
			const action = markCredentialsAsValid( 567000, 'alternate' );

			const stateOut = testStatus( stateIn, action );
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
				},
			};
			const action = markCredentialsAsInvalid( 678000, 'alternate' );

			const stateOut = testStatus( stateIn, action );
			expect( stateOut ).toEqual( {
				678000: {
					main: 'valid',
					alternate: 'invalid',
				},
			} );
		} );

		test( 'should keep existing sites data after marking a role for a new site as valid', () => {
			const stateIn = {
				123000: {
					main: 'valid',
				},
				456000: {
					main: 'invalid',
					alternate: 'valid',
				},
				999000: {
					main: 'pending',
				},
			};
			const action = markCredentialsAsValid( 999000, 'main' );

			const stateOut = testStatus( stateIn, action );
			expect( stateOut ).toEqual( {
				123000: {
					main: 'valid',
				},
				456000: {
					main: 'invalid',
					alternate: 'valid',
				},
				999000: {
					main: 'valid',
				},
			} );
		} );

		test( 'should keep existing sites data after marking a role for a new site as invalid', () => {
			const stateIn = {
				123000: {
					main: 'valid',
				},
				456000: {
					main: 'invalid',
					alternate: 'valid',
				},
				999000: {
					main: 'pending',
				},
			};
			const action = markCredentialsAsInvalid( 999000, 'main' );

			const stateOut = testStatus( stateIn, action );
			expect( stateOut ).toEqual( {
				123000: {
					main: 'valid',
				},
				456000: {
					main: 'invalid',
					alternate: 'valid',
				},
				999000: {
					main: 'invalid',
				},
			} );
		} );
	} );
} );
