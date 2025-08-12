import * as ExperimentAssignments from '../experiment-assignments';
import localStorage from '../local-storage';
import * as Requests from '../requests';
import { delayedValue, ONE_DELAY, validExperimentAssignment } from '../test-common';
import * as Timing from '../timing';
import type { Config, ExperimentAssignment } from '../../types';

const spiedMonotonicNow = jest.spyOn( Timing, 'monotonicNow' );

const mockedFetchExperimentAssignment = jest.fn();
const mockedGetAnonId = jest.fn();
const mockedConfig: Config = {
	fetchExperimentAssignment: mockedFetchExperimentAssignment,
	getAnonId: mockedGetAnonId,
	logError: async () => {
		throw new Error( 'The tested file should throw and not log.' );
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
						[ validExperimentAssignment.experimentName + '_repeat' ]:
							validExperimentAssignment.variationName,
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
			"Newly fetched ExperimentAssignment's experiment name does not match request."
		);
	} );

	it( 'should throw for returned experiment not being alive', async () => {
		jest.spyOn( ExperimentAssignments, 'isAlive' ).mockImplementationOnce( () => false );
		mockedGetAnonId.mockImplementationOnce( () => delayedValue( null, ONE_DELAY ) );
		mockFetchExperimentAssignmentToMatchExperimentAssignment( validExperimentAssignment );
		await expect(
			Requests.fetchExperimentAssignment( mockedConfig, validExperimentAssignment.experimentName )
		).rejects.toThrow( "Newly fetched experiment isn't alive." );
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

describe( 'localStorageCachedGetAnonId', () => {
	it( 'should return a fresh anonId for non-falsy values', async () => {
		const mockGetAnonIdA = jest.fn( async () => 'asdf' );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdA ) ).toBe( 'asdf' );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdA ) ).toBe( 'asdf' );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdA ) ).toBe( 'asdf' );
		expect( mockGetAnonIdA ).toHaveBeenCalledTimes( 3 );

		const mockGetAnonIdB = jest.fn( async () => 'qwer' );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdB ) ).toBe( 'qwer' );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdB ) ).toBe( 'qwer' );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdB ) ).toBe( 'qwer' );
		expect( mockGetAnonIdB ).toHaveBeenCalledTimes( 3 );
	} );

	it( 'should not cache an anonId for falsy values', async () => {
		const mockGetAnonIdNull = jest.fn( async () => null );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdNull ) ).toBe( null );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdNull ) ).toBe( null );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdNull ) ).toBe( null );
		expect( mockGetAnonIdNull ).toHaveBeenCalledTimes( 3 );

		const mockGetAnonIdEmpty = jest.fn( async () => '' );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdEmpty ) ).toBe( null );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdEmpty ) ).toBe( null );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdEmpty ) ).toBe( null );
		expect( mockGetAnonIdEmpty ).toHaveBeenCalledTimes( 3 );

		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdNull ) ).toBe( null );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdNull ) ).toBe( null );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdNull ) ).toBe( null );
		expect( mockGetAnonIdNull ).toHaveBeenCalledTimes( 6 );
	} );

	it( 'should return a cached anonId for falsy-values within the expiry time', async () => {
		const mockGetAnonIdA = jest.fn( async () => 'asdf' );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdA ) ).toBe( 'asdf' );

		const mockGetAnonIdNull = jest.fn( async () => null );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdNull ) ).toBe( 'asdf' );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdNull ) ).toBe( 'asdf' );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdNull ) ).toBe( 'asdf' );
		expect( mockGetAnonIdNull ).toHaveBeenCalledTimes( 3 );

		const mockGetAnonIdEmpty = jest.fn( async () => '' );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdEmpty ) ).toBe( 'asdf' );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdEmpty ) ).toBe( 'asdf' );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdEmpty ) ).toBe( 'asdf' );
		expect( mockGetAnonIdEmpty ).toHaveBeenCalledTimes( 3 );
	} );

	it( 'should not return the cached anonId for falsy-values outside of the expiry time', async () => {
		const mockGetAnonIdA = jest.fn( async () => 'asdf' );
		spiedMonotonicNow.mockImplementationOnce( () => 0 );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdA ) ).toBe( 'asdf' );

		const mockGetAnonIdNull = jest.fn( async () => null );
		spiedMonotonicNow.mockImplementationOnce( () => 1 );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdNull ) ).toBe( 'asdf' );
		spiedMonotonicNow.mockImplementationOnce( () => 24 * 60 * 60 * 1000 - 1 );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdNull ) ).toBe( 'asdf' );
		spiedMonotonicNow.mockImplementationOnce( () => 24 * 60 * 60 * 1000 );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdNull ) ).toBe( null );
		spiedMonotonicNow.mockImplementationOnce( () => 24 * 60 * 60 * 1000 + 1 );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdNull ) ).toBe( null );
		spiedMonotonicNow.mockImplementationOnce( () => Infinity );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdNull ) ).toBe( null );

		// And let's make sure we can overwrite it:
		spiedMonotonicNow.mockImplementationOnce( () => 0 );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdA ) ).toBe( 'asdf' );
		spiedMonotonicNow.mockImplementationOnce( () => 1 );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdNull ) ).toBe( 'asdf' );
		spiedMonotonicNow.mockImplementationOnce( () => 24 * 60 * 60 * 1000 - 1 );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdNull ) ).toBe( 'asdf' );
		spiedMonotonicNow.mockImplementationOnce( () => 24 * 60 * 60 * 1000 );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdNull ) ).toBe( null );
		spiedMonotonicNow.mockImplementationOnce( () => 24 * 60 * 60 * 1000 + 1 );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdNull ) ).toBe( null );
		spiedMonotonicNow.mockImplementationOnce( () => Infinity );
		expect( await Requests.localStorageCachedGetAnonId( mockGetAnonIdNull ) ).toBe( null );
	} );
} );
