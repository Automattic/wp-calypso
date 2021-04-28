/**
 * External dependencies
 */
// This is required to fix the "regeneratorRuntime is not defined" error
import '@automattic/calypso-polyfills';

/**
 * Internal dependencies
 */
import * as Timing from '../timing';
import * as Requests from '../requests';
import type { Config, ExperimentAssignment } from '../../types';
import { delayedValue, ONE_DELAY, validExperimentAssignment } from '../test-common';
import * as ExperimentAssignments from '../experiment-assignments';
import localStorage from '../local-storage';

const spiedMonotonicNow = jest.spyOn( Timing, 'monotonicNow' );

const mockedFetchExperimentAssignment = jest.fn();
const mockedGetAnonId = jest.fn();
const mockedConfig: Config = {
	fetchExperimentAssignment: mockedFetchExperimentAssignment,
	getAnonId: mockedGetAnonId,
	logError: async () => {
		throw new Error( `The tested file should throw and not log.` );
	},
	isDevelopmentMode: false,
};

function mockFetchExperimentAssignmentToMatchExperimentAssignment(
	experimentAssignment: ExperimentAssignment
) {
	spiedMonotonicNow.mockImplementationOnce( () => experimentAssignment.retrievedTimestamp );
	mockedFetchExperimentAssignment.mockImplementationOnce( () =>
		delayedValue(
			{
				ttl: experimentAssignment.ttl,
				variations: {
					[ experimentAssignment.experimentName ]: experimentAssignment.variationName,
				},
			},
			ONE_DELAY
		)
	);
}

beforeEach( () => {
	localStorage.clear();
} );

describe( 'fetchExperimentAssignment', () => {
	it( 'should successfully fetch and return a well formed response with an anonId', async () => {
		mockedGetAnonId.mockImplementationOnce( () => delayedValue( 'asdf', ONE_DELAY ) );
		mockFetchExperimentAssignmentToMatchExperimentAssignment( validExperimentAssignment );
		const experimentAssignmentWithAnonId = await Requests.fetchExperimentAssignment(
			mockedConfig,
			validExperimentAssignment.experimentName
		);
		expect( experimentAssignmentWithAnonId ).toEqual( validExperimentAssignment );
		expect( mockedFetchExperimentAssignment.mock.calls ).toEqual( [
			[
				{
					anonId: 'asdf',
					experimentName: 'experiment_name_a',
				},
			],
		] );
	} );

	it( 'should successfully fetch and return a well formed response without an anonId', async () => {
		mockedFetchExperimentAssignment.mockReset();
		mockedGetAnonId.mockImplementationOnce( () => delayedValue( null, ONE_DELAY ) );
		mockFetchExperimentAssignmentToMatchExperimentAssignment( validExperimentAssignment );
		const experimentAssignmentWithoutAnonId = await Requests.fetchExperimentAssignment(
			mockedConfig,
			validExperimentAssignment.experimentName
		);

		expect( experimentAssignmentWithoutAnonId ).toEqual( validExperimentAssignment );
		expect( mockedFetchExperimentAssignment.mock.calls ).toEqual( [
			[
				{
					anonId: null,
					experimentName: 'experiment_name_a',
				},
			],
		] );
	} );

	it( 'should return an experiment assignment with a ttl as the maximum of the ttl provided from the server and the set minimum ttl', async () => {
		const outputTtl = async ( inputTtl: number ) => {
			mockedFetchExperimentAssignment.mockReset();
			mockedGetAnonId.mockImplementationOnce( () => delayedValue( null, ONE_DELAY ) );
			mockFetchExperimentAssignmentToMatchExperimentAssignment( {
				...validExperimentAssignment,
				ttl: inputTtl,
			} );
			const { ttl } = await Requests.fetchExperimentAssignment(
				mockedConfig,
				validExperimentAssignment.experimentName
			);
			return ttl;
		};

		await expect( outputTtl( ExperimentAssignments.minimumTtl - 1 ) ).resolves.toBe(
			ExperimentAssignments.minimumTtl
		);
		await expect( outputTtl( ExperimentAssignments.minimumTtl ) ).resolves.toBe(
			ExperimentAssignments.minimumTtl
		);
		await expect( outputTtl( ExperimentAssignments.minimumTtl + 1 ) ).resolves.toBe(
			ExperimentAssignments.minimumTtl + 1
		);
		await expect( outputTtl( ExperimentAssignments.minimumTtl + 1000 ) ).resolves.toBe(
			ExperimentAssignments.minimumTtl + 1000
		);
	} );

	it( 'should throw for an invalid response', async () => {
		mockedGetAnonId.mockImplementationOnce( () => delayedValue( null, ONE_DELAY ) );
		mockedFetchExperimentAssignment.mockImplementationOnce( () =>
			delayedValue(
				{
					ttl: 60,
				},
				ONE_DELAY
			)
		);
		await expect(
			Requests.fetchExperimentAssignment( mockedConfig, validExperimentAssignment.experimentName )
		).rejects.toThrow( 'Invalid FetchExperimentAssignmentResponse' );
	} );

	it( 'should throw for multiple experiments in the response', async () => {
		mockedGetAnonId.mockImplementationOnce( () => delayedValue( null, ONE_DELAY ) );
		spiedMonotonicNow.mockImplementationOnce( () => validExperimentAssignment.retrievedTimestamp );
		mockedFetchExperimentAssignment.mockImplementationOnce( () =>
			delayedValue(
				{
					ttl: 60,
					variations: {
						[ validExperimentAssignment.experimentName ]: validExperimentAssignment.variationName,
						[ validExperimentAssignment.experimentName +
						'_repeat' ]: validExperimentAssignment.variationName,
					},
				},
				ONE_DELAY
			)
		);
		await expect(
			Requests.fetchExperimentAssignment( mockedConfig, validExperimentAssignment.experimentName )
		).rejects.toThrow(
			'Received multiple experiment assignments while trying to fetch exactly one.'
		);
	} );

	it( 'should return a fallbackExperimentAssignment for no experiments in the response', async () => {
		mockedGetAnonId.mockImplementationOnce( () => delayedValue( null, ONE_DELAY ) );
		spiedMonotonicNow.mockImplementationOnce( () => validExperimentAssignment.retrievedTimestamp );
		spiedMonotonicNow.mockImplementationOnce(
			() => validExperimentAssignment.retrievedTimestamp + 1000
		);
		mockedFetchExperimentAssignment.mockImplementationOnce( () =>
			delayedValue(
				{
					ttl: 60,
					variations: {},
				},
				ONE_DELAY
			)
		);
		await expect(
			Requests.fetchExperimentAssignment( mockedConfig, validExperimentAssignment.experimentName )
		).resolves.toEqual( {
			experimentName: 'experiment_name_a',
			variationName: null,
			retrievedTimestamp: validExperimentAssignment.retrievedTimestamp + 1000,
			ttl: 60,
			isFallbackExperimentAssignment: true,
		} );
	} );

	it( 'should throw for response experiment not matching the requested name', async () => {
		mockedGetAnonId.mockImplementationOnce( () => delayedValue( null, ONE_DELAY ) );
		spiedMonotonicNow.mockImplementationOnce( () => validExperimentAssignment.retrievedTimestamp );
		mockFetchExperimentAssignmentToMatchExperimentAssignment( validExperimentAssignment );
		await expect(
			Requests.fetchExperimentAssignment(
				mockedConfig,
				validExperimentAssignment.experimentName + '_different_name'
			)
		).rejects.toThrow(
			`Newly fetched ExperimentAssignment's experiment name does not match request.`
		);
	} );

	it( 'should throw for returned experiment not being alive', async () => {
		jest.spyOn( ExperimentAssignments, 'isAlive' ).mockImplementationOnce( () => false );
		mockedGetAnonId.mockImplementationOnce( () => delayedValue( null, ONE_DELAY ) );
		mockFetchExperimentAssignmentToMatchExperimentAssignment( validExperimentAssignment );
		await expect(
			Requests.fetchExperimentAssignment( mockedConfig, validExperimentAssignment.experimentName )
		).rejects.toThrow( `Newly fetched experiment isn't alive.` );
	} );
} );

describe( 'localStorageMemoizedGetAnonId', () => {
	it( 'should memoize an anonId for non-empty strings', async () => {
		const mockGetAnonIdA = jest.fn( async () => 'asdf' );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdA ) ).toBe( 'asdf' );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdA ) ).toBe( 'asdf' );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdA ) ).toBe( 'asdf' );
		expect( mockGetAnonIdA ).toHaveBeenCalledTimes( 1 );

		const mockGetAnonIdB = jest.fn( async () => 'qwer' );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdB ) ).toBe( 'asdf' );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdB ) ).toBe( 'asdf' );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdB ) ).toBe( 'asdf' );
		expect( mockGetAnonIdB ).toHaveBeenCalledTimes( 0 );
	} );

	it( 'should not memoize an anonId for falsy values', async () => {
		const mockGetAnonIdA = jest.fn( async () => null );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdA ) ).toBe( null );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdA ) ).toBe( null );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdA ) ).toBe( null );
		expect( mockGetAnonIdA ).toHaveBeenCalledTimes( 3 );

		const mockGetAnonIdB = jest.fn( async () => undefined );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdB ) ).toBe( undefined );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdB ) ).toBe( undefined );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdB ) ).toBe( undefined );
		expect( mockGetAnonIdB ).toHaveBeenCalledTimes( 3 );

		const mockGetAnonIdC = jest.fn( async () => '' );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdC ) ).toBe( '' );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdC ) ).toBe( '' );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdC ) ).toBe( '' );
		expect( mockGetAnonIdC ).toHaveBeenCalledTimes( 3 );

		const mockGetAnonIdD = jest.fn( async () => 'asdf' );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdD ) ).toBe( 'asdf' );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdD ) ).toBe( 'asdf' );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdD ) ).toBe( 'asdf' );
		expect( mockGetAnonIdD ).toHaveBeenCalledTimes( 1 );

		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdA ) ).toBe( 'asdf' );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdA ) ).toBe( 'asdf' );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdA ) ).toBe( 'asdf' );
		expect( mockGetAnonIdA ).toHaveBeenCalledTimes( 3 );

		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdB ) ).toBe( 'asdf' );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdB ) ).toBe( 'asdf' );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdB ) ).toBe( 'asdf' );
		expect( mockGetAnonIdB ).toHaveBeenCalledTimes( 3 );

		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdC ) ).toBe( 'asdf' );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdC ) ).toBe( 'asdf' );
		expect( await Requests.localStorageMemoizedGetAnonId( mockGetAnonIdC ) ).toBe( 'asdf' );
		expect( mockGetAnonIdC ).toHaveBeenCalledTimes( 3 );
	} );
} );

describe( 'isFetchExperimentAssignmentResponse', () => {
	it( 'should return true for valid responses', () => {
		expect(
			Requests.isFetchExperimentAssignmentResponse( {
				ttl: 1,
				variations: {},
			} )
		).toBe( true );
		expect(
			Requests.isFetchExperimentAssignmentResponse( {
				ttl: 60,
				variations: {
					experiment_a: 'variation_name_a',
					experiment_b: null,
				},
			} )
		).toBe( true );
	} );

	it( 'should return false for responses with 0 ttl', () => {
		expect(
			Requests.isFetchExperimentAssignmentResponse( {
				ttl: 0,
				variations: {},
			} )
		).toBe( false );
		expect(
			Requests.isFetchExperimentAssignmentResponse( {
				ttl: 0,
				variations: {
					experiment_a: 'variation_name_a',
					experiment_b: null,
				},
			} )
		).toBe( false );
	} );

	it( 'should return false for invalid responses', () => {
		expect(
			Requests.isFetchExperimentAssignmentResponse( {
				ttl: 0,
			} )
		).toBe( false );
		expect(
			Requests.isFetchExperimentAssignmentResponse( {
				variations: {},
			} )
		).toBe( false );
		expect(
			Requests.isFetchExperimentAssignmentResponse( {
				ttl: null,
				variations: {},
			} )
		).toBe( false );
		expect(
			Requests.isFetchExperimentAssignmentResponse( {
				ttl: undefined,
				variations: {},
			} )
		).toBe( false );
		expect(
			Requests.isFetchExperimentAssignmentResponse( {
				ttl: 'string',
				variations: {},
			} )
		).toBe( false );
		expect(
			Requests.isFetchExperimentAssignmentResponse( {
				ttl: {},
				variations: {},
			} )
		).toBe( false );
		expect(
			Requests.isFetchExperimentAssignmentResponse( {
				ttl: 0,
				variations: null,
			} )
		).toBe( false );
		expect(
			Requests.isFetchExperimentAssignmentResponse( {
				ttl: 0,
				variations: undefined,
			} )
		).toBe( false );
		expect(
			Requests.isFetchExperimentAssignmentResponse( {
				ttl: 0,
				variations: 'string',
			} )
		).toBe( false );
	} );
} );
