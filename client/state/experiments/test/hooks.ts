/**
 * Internal Dependencies
 */
import {
	useIsLoading,
	useVariationForUser,
	useAnonId,
	useNextRefresh,
	useExperiment,
} from '../hooks';

jest.mock( 'react-redux', () => {
	const state = { experiments: {} as any };

	return {
		__updateState: ( newState ) => ( state.experiments = newState ), // only for testing
		useSelector: ( selector ) => selector( state ),
	};
} );

describe( 'Experiemnt Hooks', () => {
	const updateState = require( 'react-redux' ).__updateState;

	describe( 'useIsLoading()', () => {
		test( 'should return true if the variations are loading', () => {
			updateState( {
				isLoading: true,
			} );
			expect( useIsLoading() ).toBe( true );
		} );

		test( 'should return false, otherwise', () => {
			// Undetermined
			updateState( {} );
			expect( useIsLoading() ).toBe( false );

			// Not loading
			updateState( {
				isLoading: false,
			} );
			expect( useIsLoading() ).toBe( false );
		} );
	} );

	describe( 'useVariationForUser()', () => {
		test( 'should return null if the given experiment is not available', () => {
			updateState( {
				variations: {},
			} );
			expect( useVariationForUser( 'mock_test' ) ).toBeNull();
		} );

		test( "should return the user's assigned variation for a given experiment", () => {
			updateState( {
				variations: {
					mock_test: 'control',
					second_mock_test: 'treatment',
				},
			} );
			expect( useVariationForUser( 'mock_test' ) ).toBe( 'control' );
			expect( useVariationForUser( 'second_mock_test' ) ).toBe( 'treatment' );
		} );
	} );

	describe( 'useAnonId()', () => {
		test( "should return the current user's anonId if set", () => {
			updateState( {
				anonId: 'anon-id-string',
			} );
			expect( useAnonId() ).toBe( 'anon-id-string' );
		} );

		test( 'should return null if empty', () => {
			updateState( {
				anonId: '',
			} );
			expect( useAnonId() ).toBeNull();
		} );

		test( 'should return null if not set', () => {
			updateState( {} );
			expect( useAnonId() ).toBeNull();
		} );
	} );

	describe( 'useNextRefresh()', () => {
		test( 'should return the time for the next variation refresh if set', () => {
			updateState( {
				nextRefresh: 1603800736128,
			} );
			expect( useNextRefresh() ).toBe( 1603800736128 );
		} );

		test( 'should return the current time if not set', () => {
			const mockNow = new Date( '2020-10-20T11:00:00.135Z' ).valueOf();
			jest.spyOn( global.Date, 'now' ).mockImplementationOnce( () => mockNow );

			updateState( {} );
			expect( useNextRefresh() ).toBe( mockNow );
		} );
	} );

	describe( 'useExperiment()', () => {
		test( 'should return a unified object with all related data', () => {
			const mockNow = new Date( '2020-10-20T11:00:00.135Z' ).valueOf();
			jest
				.spyOn( global.Date, 'now' )
				.mockImplementationOnce( () => mockNow )
				.mockImplementationOnce( () => mockNow );

			updateState( {} );
			expect( useExperiment( 'mock_test' ) ).toEqual( {
				variation: useVariationForUser( 'mock_test' ),
				anonId: useAnonId(),
				nextRefresh: useNextRefresh(),
				isLoading: useIsLoading(),
			} );

			updateState( {
				variations: {
					mock_test: 'treatment',
				},
				anonId: 'random-anon-id',
				nextRefresh: 1603814562240,
				isLoading: true,
			} );
			expect( useExperiment( 'mock_test' ) ).toEqual( {
				variation: useVariationForUser( 'mock_test' ),
				anonId: useAnonId(),
				nextRefresh: useNextRefresh(),
				isLoading: useIsLoading(),
			} );
		} );
	} );
} );
