/**
 * External dependencies
 */
// This is required to fix the "regeneratorRuntime is not defined" error
import '@automattic/calypso-polyfills';

/**
 * Internal dependencies
 */
import createExPlatClient from '../create-explat-client';
import { delayedValue, validExperimentAssignment } from '../internal/test-common';
import * as Timing from '../internal/timing';
import type { Config, ExperimentAssignment } from '../types';

const spiedMonotonicNow = jest.spyOn( Timing, 'monotonicNow' );

const mockedFetchExperimentAssignment = jest.fn();
const mockedGetAnonId = jest.fn();
const mockedLogError = jest.fn();
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore; Not using the full Config
const mockedConfig: Config = {
	logError: mockedLogError,
	fetchExperimentAssignment: mockedFetchExperimentAssignment,
	getAnonId: mockedGetAnonId,
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
			1
		)
	);
}

function allMockedConfigCalls() {
	return {
		logError: mockedLogError.mock.calls,
		fetchExperimentAssignment: mockedFetchExperimentAssignment.mock.calls,
		getAnonId: mockedGetAnonId.mock.calls,
	};
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.window = {};

beforeEach( () => {
	jest.resetAllMocks();
} );

describe( 'createExPlatClient', () => {
	it( `should throw if initialized outside of a browser context`, () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		global.window = undefined;

		expect( () => createExPlatClient( mockedConfig ) ).toThrowErrorMatchingInlineSnapshot(
			`"Running outside of a browser context."`
		);

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		global.window = {};
	} );

	it( `shouldn't call any deps if only initialized`, () => {
		createExPlatClient( mockedConfig );

		expect( allMockedConfigCalls() ).toMatchInlineSnapshot( `
		Object {
		  "fetchExperimentAssignment": Array [],
		  "getAnonId": Array [],
		  "logError": Array [],
		}
	` );
	} );

	// eslint-disable-next-line jest/expect-expect
	it( `shouldn't throw if initialized multiple times`, () => {
		createExPlatClient( mockedConfig );
		createExPlatClient( mockedConfig );
		createExPlatClient( mockedConfig );
		createExPlatClient( mockedConfig );
	} );
} );

describe( 'ExPlatClient.loadExperimentAssignment', () => {
	it( `should successfully load an ExperimentAssignment`, async () => {
		mockFetchExperimentAssignmentToMatchExperimentAssignment( validExperimentAssignment );
		mockedConfig.isDevelopmentMode = false;
		const client = createExPlatClient( mockedConfig );
		spiedMonotonicNow.mockImplementationOnce(
			() => validExperimentAssignment.retrievedTimestamp + 1000
		);
		await expect(
			client.loadExperimentAssignment( validExperimentAssignment.experimentName )
		).resolves.toEqual( validExperimentAssignment );
		expect( allMockedConfigCalls() ).toMatchInlineSnapshot( `
		Object {
		  "fetchExperimentAssignment": Array [
		    Array [
		      Object {
		        "anonId": undefined,
		        "experimentName": "experiment_name_a",
		      },
		    ],
		  ],
		  "getAnonId": Array [
		    Array [],
		  ],
		  "logError": Array [],
		}
	` );
	} );
	it( `[developmentMode] should successfully load an ExperimentAssignment`, async () => {
		mockFetchExperimentAssignmentToMatchExperimentAssignment( validExperimentAssignment );
		mockedConfig.isDevelopmentMode = true;
		const client = createExPlatClient( mockedConfig );
		spiedMonotonicNow.mockImplementationOnce(
			() => validExperimentAssignment.retrievedTimestamp + 1000
		);
		await expect(
			client.loadExperimentAssignment( validExperimentAssignment.experimentName )
		).resolves.toEqual( validExperimentAssignment );
		expect( allMockedConfigCalls() ).toMatchInlineSnapshot( `
		Object {
		  "fetchExperimentAssignment": Array [
		    Array [
		      Object {
		        "anonId": undefined,
		        "experimentName": "experiment_name_a",
		      },
		    ],
		  ],
		  "getAnonId": Array [
		    Array [],
		  ],
		  "logError": Array [],
		}
	` );
	} );
	// should not reload for the next load within ttl
	// should reload outside of the ttl
	// should reload outside of the ttl
	it( `Invalid experimentName: should return fallback and log`, async () => {
		mockFetchExperimentAssignmentToMatchExperimentAssignment( validExperimentAssignment );
		mockedConfig.isDevelopmentMode = false;
		const client = createExPlatClient( mockedConfig );
		await expect(
			client.loadExperimentAssignment( 'the-invalid-experiment-name' )
		).resolves.toEqual( {
			experimentName: 'fallback_experiment_assignment',
			retrievedTimestamp: validExperimentAssignment.retrievedTimestamp,
			ttl: 60,
			variationName: null,
			isFallbackExperimentAssignment: true,
		} );
		expect( allMockedConfigCalls() ).toMatchInlineSnapshot( `
		Object {
		  "fetchExperimentAssignment": Array [],
		  "getAnonId": Array [],
		  "logError": Array [
		    Array [
		      Object {
		        "experimentName": "the-invalid-experiment-name",
		        "message": "Invalid experimentName: the-invalid-experiment-name",
		      },
		    ],
		  ],
		}
	` );
	} );
	it( `[developmentMode] Invalid experimentName: should throw`, async () => {
		mockFetchExperimentAssignmentToMatchExperimentAssignment( validExperimentAssignment );
		mockedConfig.isDevelopmentMode = true;
		const client = createExPlatClient( mockedConfig );
		await expect(
			client.loadExperimentAssignment( 'the-invalid-experiment-name' )
		).rejects.toThrow( 'Invalid experimentName: the-invalid-experiment-name' );
		expect( allMockedConfigCalls() ).toMatchInlineSnapshot( `
		Object {
		  "fetchExperimentAssignment": Array [],
		  "getAnonId": Array [],
		  "logError": Array [
		    Array [
		      Object {
		        "experimentName": "the-invalid-experiment-name",
		        "message": "Invalid experimentName: the-invalid-experiment-name",
		      },
		    ],
		  ],
		}
	` );
	} );
} );
