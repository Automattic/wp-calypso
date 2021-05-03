// This is required to fix the "regeneratorRuntime is not defined" error
import '@automattic/calypso-polyfills';

import type { Config, ExperimentAssignment } from '../../types';
import * as ExperimentAssignments from '../experiment-assignments';
import * as Requests from '../requests';
import { delayedValue, ONE_DELAY, validExperimentAssignment } from '../test-common';
import * as Timing from '../timing';

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
