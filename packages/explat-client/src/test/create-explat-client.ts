/**
 * External dependencies
 */
// This is required to fix the "regeneratorRuntime is not defined" error
import '@automattic/calypso-polyfills';

/**
 * Internal dependencies
 */
import { createExPlatClient } from '../create-explat-client';
import { delayedValue, validExperimentAssignment } from '../internal/test-common';
import * as Timing from '../internal/timing';
import type { Config, ExperimentAssignment } from '../types';

const spiedMonotonicNow = jest.spyOn( Timing, 'monotonicNow' );

const mockedFetchExperimentAssignment = jest.fn();
const mockedGetAnonId = jest.fn();
const mockedLogError = jest.fn();
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

function setBrowserContext() {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	global.window = {};
}

function setSsrContext() {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	global.window = undefined;
}

beforeEach( () => {
	jest.resetAllMocks();
	setBrowserContext();
} );

describe( 'createExPlatClient', () => {
	it( `should throw if initialized outside of a browser context`, () => {
		setSsrContext();

		expect( () => createExPlatClient( mockedConfig ) ).toThrowErrorMatchingInlineSnapshot(
			`"Running outside of a browser context."`
		);
	} );

	it( `shouldn't call any deps if only initialized`, () => {
		createExPlatClient( mockedConfig );

		expect( mockedLogError.mock.calls ).toMatchInlineSnapshot( `Array []` );
	} );

	it( `shouldn't throw if initialized multiple times`, () => {
		const a = createExPlatClient( mockedConfig );
		const b = createExPlatClient( mockedConfig );
		const c = createExPlatClient( mockedConfig );
		const d = createExPlatClient( mockedConfig );
		expect( a ).not.toBe( null );
		expect( b ).not.toBe( null );
		expect( c ).not.toBe( null );
		expect( d ).not.toBe( null );
	} );
} );

describe( 'ExPlatClient.loadExperimentAssignment single-use', () => {
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
		expect( mockedLogError.mock.calls ).toMatchInlineSnapshot( `Array []` );
	} );
	it( `[anonId] should successfully load an ExperimentAssignment`, async () => {
		mockedGetAnonId.mockImplementationOnce( () => delayedValue( 'the-anon-id-123', 0 ) );
		mockFetchExperimentAssignmentToMatchExperimentAssignment( validExperimentAssignment );
		mockedConfig.isDevelopmentMode = false;
		const client = createExPlatClient( mockedConfig );
		spiedMonotonicNow.mockImplementationOnce(
			() => validExperimentAssignment.retrievedTimestamp + 1000
		);
		await expect(
			client.loadExperimentAssignment( validExperimentAssignment.experimentName )
		).resolves.toEqual( validExperimentAssignment );
		expect( mockedLogError.mock.calls ).toMatchInlineSnapshot( `Array []` );
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
		expect( mockedLogError.mock.calls ).toMatchInlineSnapshot( `Array []` );
	} );
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
		expect( mockedLogError.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "the-invalid-experiment-name",
		      "message": "Invalid experimentName: the-invalid-experiment-name",
		    },
		  ],
		]
	` );
	} );
	it( `[developmentMode] Invalid experimentName: should throw`, async () => {
		mockFetchExperimentAssignmentToMatchExperimentAssignment( validExperimentAssignment );
		mockedConfig.isDevelopmentMode = true;
		const client = createExPlatClient( mockedConfig );
		await expect(
			client.loadExperimentAssignment( 'the-invalid-experiment-name' )
		).rejects.toThrow( 'Invalid experimentName: the-invalid-experiment-name' );
		expect( mockedLogError.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "the-invalid-experiment-name",
		      "message": "Invalid experimentName: the-invalid-experiment-name",
		    },
		  ],
		]
	` );
	} );
	it( `Could not fetch ExperimentAssignment: should store and return fallback, and log`, async () => {
		mockedFetchExperimentAssignment.mockImplementationOnce(
			() => new Promise( ( _res, rej ) => rej( new Error( 'some-error-123' ) ) )
		);
		mockedConfig.isDevelopmentMode = false;
		const client = createExPlatClient( mockedConfig );
		const firstNow = Date.now();
		spiedMonotonicNow.mockImplementationOnce( () => firstNow );
		const secondNow = firstNow + 1;
		spiedMonotonicNow.mockImplementationOnce( () => secondNow );
		await expect(
			client.loadExperimentAssignment( validExperimentAssignment.experimentName )
		).resolves.toEqual( {
			experimentName: validExperimentAssignment.experimentName,
			retrievedTimestamp: secondNow,
			ttl: 60,
			variationName: null,
			isFallbackExperimentAssignment: true,
		} );
		expect( mockedLogError.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "some-error-123",
		    },
		  ],
		]
	` );
	} );

	it( `[developmentMode] Could not fetch ExperimentAssignment: should throw`, async () => {
		mockedFetchExperimentAssignment.mockImplementationOnce(
			() => new Promise( ( _res, rej ) => rej( new Error( 'some-error-123' ) ) )
		);
		mockedConfig.isDevelopmentMode = true;
		const client = createExPlatClient( mockedConfig );
		const firstNow = Date.now();
		spiedMonotonicNow.mockImplementationOnce( () => firstNow );
		const secondNow = firstNow + 1;
		spiedMonotonicNow.mockImplementationOnce( () => secondNow );
		await expect(
			client.loadExperimentAssignment( validExperimentAssignment.experimentName )
		).rejects.toThrow( 'some-error-123' );
		expect( mockedLogError.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "some-error-123",
		    },
		  ],
		]
	` );
	} );
	it( `Timed-out fetch: should return fallback and log`, async () => {
		jest.useFakeTimers();

		mockedFetchExperimentAssignment.mockImplementationOnce( () => new Promise( () => undefined ) );
		mockedConfig.isDevelopmentMode = false;
		const client = createExPlatClient( mockedConfig );
		const firstNow = Date.now();
		spiedMonotonicNow.mockImplementationOnce( () => firstNow );
		const secondNow = firstNow + 1;
		spiedMonotonicNow.mockImplementationOnce( () => secondNow );
		const expectationPromise = expect(
			client.loadExperimentAssignment( validExperimentAssignment.experimentName )
		).resolves.toEqual( {
			experimentName: validExperimentAssignment.experimentName,
			retrievedTimestamp: secondNow,
			ttl: 60,
			variationName: null,
			isFallbackExperimentAssignment: true,
		} );
		jest.advanceTimersByTime( 10 * 1000 );
		await expectationPromise;
		expect( mockedLogError.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "Promise has timed-out.",
		    },
		  ],
		]
	` );
		jest.useRealTimers();
	} );
	it( `[developmentMode] Timed-out fetch: should throw`, async () => {
		jest.useFakeTimers();

		mockedFetchExperimentAssignment.mockImplementationOnce( () => new Promise( () => undefined ) );
		spiedMonotonicNow.mockImplementation( () => Date.now() );
		mockedConfig.isDevelopmentMode = true;
		const client = createExPlatClient( mockedConfig );
		const expectationPromise = expect(
			client.loadExperimentAssignment( validExperimentAssignment.experimentName )
		).rejects.toThrow( 'Promise has timed-out.' );
		jest.advanceTimersByTime( 5 * 1000 );
		await expectationPromise;
		expect( mockedLogError.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "Promise has timed-out.",
		    },
		  ],
		]
	` );
		jest.useRealTimers();
	} );
	it( `logError throws/secondary error: should attempt to log secondary error and return fallback`, async () => {
		// Using invalid name as the initial error
		mockFetchExperimentAssignmentToMatchExperimentAssignment( validExperimentAssignment );
		mockedLogError.mockImplementation( () => {
			throw new Error( 'Error logging.' );
		} );
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
		expect( mockedLogError.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "the-invalid-experiment-name",
		      "message": "Invalid experimentName: the-invalid-experiment-name",
		    },
		  ],
		]
	` );
	} );
	it( `[developmentMode] logError throws/secondary error: should throw`, async () => {
		// Using invalid name as the initial error
		mockFetchExperimentAssignmentToMatchExperimentAssignment( validExperimentAssignment );
		mockedLogError.mockImplementation( () => {
			throw new Error( 'Error while logging.' );
		} );
		mockedConfig.isDevelopmentMode = true;
		const client = createExPlatClient( mockedConfig );
		await expect(
			client.loadExperimentAssignment( 'the-invalid-experiment-name' )
		).rejects.toThrow( 'Invalid experimentName: the-invalid-experiment-name' );
		expect( mockedLogError.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "the-invalid-experiment-name",
		      "message": "Invalid experimentName: the-invalid-experiment-name",
		    },
		  ],
		]
	` );
	} );
} );

describe( 'ExPlatClient.loadExperimentAssignment multiple-use', () => {
	it( `should respect the ttl`, async () => {
		mockedConfig.isDevelopmentMode = false;
		const client = createExPlatClient( mockedConfig );

		mockFetchExperimentAssignmentToMatchExperimentAssignment( validExperimentAssignment );
		const firstDate = Date.now();
		spiedMonotonicNow.mockImplementation( () => firstDate );
		const experimentAssignmentA = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		const experimentAssignmentB = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		const experimentAssignmentC = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		const experimentAssignmentD = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		expect( await experimentAssignmentA ).toEqual( await experimentAssignmentB );
		expect( await experimentAssignmentA ).toEqual( await experimentAssignmentC );
		expect( await experimentAssignmentA ).toEqual( await experimentAssignmentD );
		expect( mockedFetchExperimentAssignment.mock.calls ).toHaveLength( 1 );
		expect( mockedLogError.mock.calls ).toMatchInlineSnapshot( `Array []` );

		const dateIncreasePastTtl = validExperimentAssignment.ttl * 1000 + 1;
		const refreshedValidExperimentAssignment = {
			...validExperimentAssignment,
			variationName: null,
			retrievedTimestamp: Date.now() + dateIncreasePastTtl,
		};
		mockFetchExperimentAssignmentToMatchExperimentAssignment( refreshedValidExperimentAssignment );
		spiedMonotonicNow.mockImplementation( () => Date.now() + dateIncreasePastTtl );
		const experimentAssignmentE = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		const experimentAssignmentF = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		const experimentAssignmentG = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		const experimentAssignmentH = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		expect( await experimentAssignmentE ).toEqual( await experimentAssignmentF );
		expect( await experimentAssignmentE ).toEqual( await experimentAssignmentG );
		expect( await experimentAssignmentE ).toEqual( await experimentAssignmentH );
		expect( mockedFetchExperimentAssignment.mock.calls ).toHaveLength( 2 );
		expect( ( await experimentAssignmentA ).retrievedTimestamp ).toBeLessThan(
			( await experimentAssignmentE ).retrievedTimestamp
		);
		expect( mockedLogError.mock.calls ).toMatchInlineSnapshot( `Array []` );
	} );

	it( `[developmentMode] should respect the ttl`, async () => {
		mockedConfig.isDevelopmentMode = true;
		const client = createExPlatClient( mockedConfig );

		mockFetchExperimentAssignmentToMatchExperimentAssignment( validExperimentAssignment );
		const firstDate = Date.now();
		spiedMonotonicNow.mockImplementation( () => firstDate );
		const experimentAssignmentA = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		const experimentAssignmentB = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		const experimentAssignmentC = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		const experimentAssignmentD = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		expect( await experimentAssignmentA ).toEqual( await experimentAssignmentB );
		expect( await experimentAssignmentA ).toEqual( await experimentAssignmentC );
		expect( await experimentAssignmentA ).toEqual( await experimentAssignmentD );
		expect( mockedFetchExperimentAssignment.mock.calls ).toHaveLength( 1 );

		jest.resetAllMocks();
		const dateIncreasePastTtl = validExperimentAssignment.ttl * 1000 + 1;
		const refreshedValidExperimentAssignment = {
			...validExperimentAssignment,
			variationName: null,
			retrievedTimestamp: Date.now() + dateIncreasePastTtl,
		};
		mockFetchExperimentAssignmentToMatchExperimentAssignment( refreshedValidExperimentAssignment );
		spiedMonotonicNow.mockImplementation( () => Date.now() + dateIncreasePastTtl );
		const experimentAssignmentE = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		const experimentAssignmentF = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		const experimentAssignmentG = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		const experimentAssignmentH = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		expect( await experimentAssignmentE ).toEqual( await experimentAssignmentF );
		expect( await experimentAssignmentE ).toEqual( await experimentAssignmentG );
		expect( await experimentAssignmentE ).toEqual( await experimentAssignmentH );
		expect( mockedFetchExperimentAssignment.mock.calls ).toHaveLength( 1 );
		expect( ( await experimentAssignmentA ).retrievedTimestamp ).toBeLessThan(
			( await experimentAssignmentE ).retrievedTimestamp
		);
	} );
	it( `should only make one request even if it fails, returning the same fallback - until ttl is over with successful next`, async () => {
		mockedConfig.isDevelopmentMode = false;
		const client = createExPlatClient( mockedConfig );

		const invalidExperimentAssignment = {
			...validExperimentAssignment,
			experimentName: 'invalid-experiment-name',
		};
		mockFetchExperimentAssignmentToMatchExperimentAssignment( invalidExperimentAssignment );
		const firstDate = Date.now();
		spiedMonotonicNow.mockImplementation( () => firstDate );
		const experimentAssignmentA = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		const experimentAssignmentB = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		const experimentAssignmentC = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		const experimentAssignmentD = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		expect( await experimentAssignmentA ).toEqual( await experimentAssignmentB );
		expect( await experimentAssignmentA ).toEqual( await experimentAssignmentC );
		expect( await experimentAssignmentA ).toEqual( await experimentAssignmentD );
		expect( mockedFetchExperimentAssignment.mock.calls ).toHaveLength( 1 );
		expect( mockedLogError.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "Invalid ExperimentAssignment",
		    },
		  ],
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "Invalid ExperimentAssignment",
		    },
		  ],
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "Invalid ExperimentAssignment",
		    },
		  ],
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "Invalid ExperimentAssignment",
		    },
		  ],
		]
	` );

		await delayedValue( undefined, 1000 );

		jest.resetAllMocks();
		const dateIncreasePastTtl = validExperimentAssignment.ttl * 1000 + 10;
		const refreshedValidExperimentAssignment = {
			...validExperimentAssignment,
			variationName: null,
			retrievedTimestamp: Date.now() + dateIncreasePastTtl,
		};
		mockFetchExperimentAssignmentToMatchExperimentAssignment( refreshedValidExperimentAssignment );
		spiedMonotonicNow.mockImplementation( () => Date.now() + dateIncreasePastTtl );
		const experimentAssignmentE = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		await experimentAssignmentE;
		const experimentAssignmentF = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		const experimentAssignmentG = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		const experimentAssignmentH = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		expect( await experimentAssignmentE ).toEqual( await experimentAssignmentF );
		expect( await experimentAssignmentE ).toEqual( await experimentAssignmentG );
		expect( await experimentAssignmentE ).toEqual( await experimentAssignmentH );
		expect( ( await experimentAssignmentA ).retrievedTimestamp ).toBeLessThan(
			( await experimentAssignmentE ).retrievedTimestamp
		);
		expect( mockedFetchExperimentAssignment.mock.calls ).toHaveLength( 1 );
		expect( mockedLogError.mock.calls ).toMatchInlineSnapshot( `Array []` );
	} );
	it( `[developmentMode] should only make one request even if it fails, throwing the same error`, async () => {
		mockedConfig.isDevelopmentMode = true;
		const client = createExPlatClient( mockedConfig );

		const invalidExperimentAssignment = {
			...validExperimentAssignment,
			experimentName: 'invalid-experiment-name',
		};
		mockFetchExperimentAssignmentToMatchExperimentAssignment( invalidExperimentAssignment );
		const firstDate = Date.now();
		spiedMonotonicNow.mockImplementation( () => firstDate );
		const experimentAssignmentA = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		const experimentAssignmentB = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		const experimentAssignmentC = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		const experimentAssignmentD = client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		let errorA;
		try {
			await experimentAssignmentA;
		} catch ( e ) {
			errorA = e;
		}
		let errorB;
		try {
			await experimentAssignmentB;
		} catch ( e ) {
			errorB = e;
		}
		let errorC;
		try {
			await experimentAssignmentC;
		} catch ( e ) {
			errorC = e;
		}
		let errorD;
		try {
			await experimentAssignmentD;
		} catch ( e ) {
			errorD = e;
		}
		expect( errorA ).toBe( errorB );
		expect( errorA ).toBe( errorC );
		expect( errorA ).toBe( errorD );
		expect( mockedFetchExperimentAssignment.mock.calls ).toHaveLength( 1 );
		expect( mockedLogError.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "Invalid ExperimentAssignment",
		    },
		  ],
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "Invalid ExperimentAssignment",
		    },
		  ],
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "Invalid ExperimentAssignment",
		    },
		  ],
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "Invalid ExperimentAssignment",
		    },
		  ],
		]
	` );

		// Trying again with a passing configuration:
		jest.resetAllMocks();
		const dateIncreasePastTtl = validExperimentAssignment.ttl * 1000 + 1000;
		const refreshedValidExperimentAssignment = {
			...validExperimentAssignment,
			variationName: null,
			retrievedTimestamp: Date.now() + dateIncreasePastTtl,
		};
		mockFetchExperimentAssignmentToMatchExperimentAssignment( refreshedValidExperimentAssignment );
		spiedMonotonicNow.mockImplementation( () => Date.now() + dateIncreasePastTtl );
		const experimentAssignmentE = await client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		const experimentAssignmentF = await client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		const experimentAssignmentG = await client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		const experimentAssignmentH = await client.loadExperimentAssignment(
			validExperimentAssignment.experimentName
		);
		expect( experimentAssignmentE ).toEqual( experimentAssignmentF );
		expect( experimentAssignmentE ).toEqual( experimentAssignmentG );
		expect( experimentAssignmentE ).toEqual( experimentAssignmentH );
		expect( mockedFetchExperimentAssignment.mock.calls ).toHaveLength( 1 );
		expect( mockedLogError.mock.calls ).toMatchInlineSnapshot( `Array []` );
	} );
} );

describe( 'ExPlatClient.dangerouslyGetExperimentAssignment', () => {
	it( 'should throw when given an invalid name', () => {
		mockedConfig.isDevelopmentMode = false;
		const client = createExPlatClient( mockedConfig );
		expect( () =>
			client.dangerouslyGetExperimentAssignment( 'the-invalid-name' )
		).toThrowErrorMatchingInlineSnapshot( `"Invalid experimentName: the-invalid-name"` );
	} );

	it( `should throw when the matching experiment hasn't loaded yet`, () => {
		mockedConfig.isDevelopmentMode = false;
		const client = createExPlatClient( mockedConfig );
		expect( () =>
			client.dangerouslyGetExperimentAssignment( 'experiment_name_a' )
		).toThrowErrorMatchingInlineSnapshot(
			`"Trying to dangerously get an ExperimentAssignment that hasn't loaded."`
		);
	} );
	it( `should throw when the matching experiment hasn't loaded yet but is currently loading`, () => {
		mockedConfig.isDevelopmentMode = false;
		const client = createExPlatClient( mockedConfig );
		mockFetchExperimentAssignmentToMatchExperimentAssignment( validExperimentAssignment );
		expect( () =>
			client.dangerouslyGetExperimentAssignment( 'experiment_name_a' )
		).toThrowErrorMatchingInlineSnapshot(
			`"Trying to dangerously get an ExperimentAssignment that hasn't loaded."`
		);
	} );
	it( `should return a loaded ExperimentAssignment`, async () => {
		mockedConfig.isDevelopmentMode = false;
		const client = createExPlatClient( mockedConfig );
		mockFetchExperimentAssignmentToMatchExperimentAssignment( validExperimentAssignment );
		spiedMonotonicNow.mockImplementationOnce(
			() => validExperimentAssignment.retrievedTimestamp + 1
		);
		await client.loadExperimentAssignment( validExperimentAssignment.experimentName );
		expect(
			client.dangerouslyGetExperimentAssignment( validExperimentAssignment.experimentName )
		).toEqual( validExperimentAssignment );
	} );
	it( `[developerMode] should throw when run too soon after loading an ExperimentAssignment`, async () => {
		mockedConfig.isDevelopmentMode = true;
		const client = createExPlatClient( mockedConfig );
		mockFetchExperimentAssignmentToMatchExperimentAssignment( validExperimentAssignment );
		spiedMonotonicNow.mockImplementationOnce(
			() => validExperimentAssignment.retrievedTimestamp + 1
		);
		spiedMonotonicNow.mockImplementationOnce(
			() => validExperimentAssignment.retrievedTimestamp + 1
		);
		await client.loadExperimentAssignment( validExperimentAssignment.experimentName );
		expect( () =>
			client.dangerouslyGetExperimentAssignment( validExperimentAssignment.experimentName )
		).toThrowErrorMatchingInlineSnapshot(
			`"Warning: Trying to dangerously get an ExperimentAssignment too soon after loading it."`
		);
	} );
	it( `[developmentMode] should return a loaded ExperimentAssignment when not run too soon after`, async () => {
		mockedConfig.isDevelopmentMode = true;
		const client = createExPlatClient( mockedConfig );
		mockFetchExperimentAssignmentToMatchExperimentAssignment( validExperimentAssignment );
		spiedMonotonicNow.mockImplementationOnce(
			() => validExperimentAssignment.retrievedTimestamp + 1
		);
		spiedMonotonicNow.mockImplementationOnce(
			() => validExperimentAssignment.retrievedTimestamp + 1000
		);
		await client.loadExperimentAssignment( validExperimentAssignment.experimentName );
		expect(
			client.dangerouslyGetExperimentAssignment( validExperimentAssignment.experimentName )
		).toEqual( validExperimentAssignment );
	} );
} );
