/**
 * External dependencies
 */
// This is required to fix the "regeneratorRuntime is not defined" error
import '@automattic/calypso-polyfills';

/**
 * Internal dependencies
 */
import { createExPlatClient } from '../create-explat-client';
import {
	delayedValue,
	ONE_DELAY,
	validExperimentAssignment,
	ZERO_DELAY,
} from '../internal/test-common';
import * as Timing from '../internal/timing';
import type { Config, ExperimentAssignment } from '../types';

type MockedFunction = ReturnType< typeof jest.fn >;

const spiedMonotonicNow = jest.spyOn( Timing, 'monotonicNow' );

const createMockedConfig = ( override: Partial< Config > = {} ): Config => ( {
	logError: jest.fn(),
	fetchExperimentAssignment: jest.fn(),
	getAnonId: jest.fn(),
	isDevelopmentMode: false,
	...override,
} );

function mockFetchExperimentAssignmentToMatchExperimentAssignment(
	config: Config,
	experimentAssignment: ExperimentAssignment
) {
	spiedMonotonicNow.mockImplementationOnce( () => experimentAssignment.retrievedTimestamp );
	( config.fetchExperimentAssignment as MockedFunction ).mockImplementationOnce( () =>
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

		expect( () => createExPlatClient( createMockedConfig() ) ).toThrowErrorMatchingInlineSnapshot(
			`"Running outside of a browser context."`
		);
	} );

	it( `shouldn't throw if initialized multiple times`, () => {
		const a = createExPlatClient( createMockedConfig() );
		const b = createExPlatClient( createMockedConfig() );
		const c = createExPlatClient( createMockedConfig() );
		const d = createExPlatClient( createMockedConfig() );
		expect( a ).not.toBe( null );
		expect( b ).not.toBe( null );
		expect( c ).not.toBe( null );
		expect( d ).not.toBe( null );
	} );
} );

describe( 'ExPlatClient.loadExperimentAssignment single-use', () => {
	it( `should successfully load an ExperimentAssignment`, async () => {
		const mockedConfig = createMockedConfig();
		mockFetchExperimentAssignmentToMatchExperimentAssignment(
			mockedConfig,
			validExperimentAssignment
		);
		const client = createExPlatClient( mockedConfig );
		spiedMonotonicNow.mockImplementationOnce(
			() => validExperimentAssignment.retrievedTimestamp + 1000
		);
		await expect(
			client.loadExperimentAssignment( validExperimentAssignment.experimentName )
		).resolves.toEqual( validExperimentAssignment );
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot(
			`Array []`
		);
	} );
	it( `[anonId] should successfully load an ExperimentAssignment`, async () => {
		const mockedConfig = createMockedConfig();
		( mockedConfig.getAnonId as MockedFunction ).mockImplementationOnce( () =>
			delayedValue( 'the-anon-id-123', ZERO_DELAY )
		);
		mockFetchExperimentAssignmentToMatchExperimentAssignment(
			mockedConfig,
			validExperimentAssignment
		);
		const client = createExPlatClient( mockedConfig );
		spiedMonotonicNow.mockImplementationOnce(
			() => validExperimentAssignment.retrievedTimestamp + 1000
		);
		await expect(
			client.loadExperimentAssignment( validExperimentAssignment.experimentName )
		).resolves.toEqual( validExperimentAssignment );
		expect( ( mockedConfig.fetchExperimentAssignment as MockedFunction ).mock.calls.length ).toBe(
			1
		);
		expect(
			( mockedConfig.fetchExperimentAssignment as MockedFunction ).mock.calls[ 0 ][ 0 ].anonId
		).toBe( 'the-anon-id-123' );
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot(
			`Array []`
		);
	} );
	it( `[developmentMode] should successfully load an ExperimentAssignment`, async () => {
		const mockedConfig = createMockedConfig( { isDevelopmentMode: true } );
		mockFetchExperimentAssignmentToMatchExperimentAssignment(
			mockedConfig,
			validExperimentAssignment
		);
		const client = createExPlatClient( mockedConfig );
		spiedMonotonicNow.mockImplementationOnce(
			() => validExperimentAssignment.retrievedTimestamp + 1000
		);
		await expect(
			client.loadExperimentAssignment( validExperimentAssignment.experimentName )
		).resolves.toEqual( validExperimentAssignment );
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot(
			`Array []`
		);
	} );
	it( `Invalid experimentName: should return fallback and log`, async () => {
		const mockedConfig = createMockedConfig();
		mockFetchExperimentAssignmentToMatchExperimentAssignment(
			mockedConfig,
			validExperimentAssignment
		);
		const client = createExPlatClient( mockedConfig );
		spiedMonotonicNow.mockImplementationOnce(
			() => validExperimentAssignment.retrievedTimestamp + 1000
		);
		await expect( client.loadExperimentAssignment( '' ) ).resolves.toEqual( {
			experimentName: '',
			retrievedTimestamp: validExperimentAssignment.retrievedTimestamp + 1000,
			ttl: 60,
			variationName: null,
			isFallbackExperimentAssignment: true,
		} );
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "",
		      "message": "Invalid experimentName: \\"\\"",
		      "source": "loadExperimentAssignment-initialError",
		    },
		  ],
		  Array [
		    Object {
		      "experimentName": "",
		      "message": "Invalid ExperimentAssignment",
		      "source": "loadExperimentAssignment-fallbackError",
		    },
		  ],
		]
	` );
	} );
	it( `[developmentMode] Invalid experimentName: should throw`, async () => {
		const mockedConfig = createMockedConfig( { isDevelopmentMode: true } );
		mockFetchExperimentAssignmentToMatchExperimentAssignment(
			mockedConfig,
			validExperimentAssignment
		);
		const client = createExPlatClient( mockedConfig );
		await expect( client.loadExperimentAssignment( '' ) ).rejects.toThrow(
			'Invalid experimentName: ""'
		);
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "",
		      "message": "Invalid experimentName: \\"\\"",
		      "source": "loadExperimentAssignment-initialError",
		    },
		  ],
		]
	` );
	} );
	it( `Could not fetch ExperimentAssignment: should store and return fallback, and log`, async () => {
		const mockedConfig = createMockedConfig();
		( mockedConfig.fetchExperimentAssignment as MockedFunction ).mockImplementationOnce(
			() => new Promise( ( _res, rej ) => rej( new Error( 'some-error-123' ) ) )
		);
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
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "some-error-123",
		      "source": "loadExperimentAssignment-initialError",
		    },
		  ],
		]
	` );
	} );

	it( `[developmentMode] Could not fetch ExperimentAssignment: should throw`, async () => {
		const mockedConfig = createMockedConfig( { isDevelopmentMode: true } );
		( mockedConfig.fetchExperimentAssignment as MockedFunction ).mockImplementationOnce(
			() => new Promise( ( _res, rej ) => rej( new Error( 'some-error-123' ) ) )
		);
		const client = createExPlatClient( mockedConfig );
		const firstNow = Date.now();
		spiedMonotonicNow.mockImplementationOnce( () => firstNow );
		const secondNow = firstNow + 1;
		spiedMonotonicNow.mockImplementationOnce( () => secondNow );
		await expect(
			client.loadExperimentAssignment( validExperimentAssignment.experimentName )
		).rejects.toThrow( 'some-error-123' );
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "some-error-123",
		      "source": "loadExperimentAssignment-initialError",
		    },
		  ],
		]
	` );
	} );
	it( `Timed-out fetch: should return fallback and log`, async () => {
		jest.useFakeTimers();

		const mockedConfig = createMockedConfig();
		( mockedConfig.fetchExperimentAssignment as MockedFunction ).mockImplementationOnce(
			() => new Promise( () => undefined )
		);
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
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "Promise has timed-out.",
		      "source": "loadExperimentAssignment-initialError",
		    },
		  ],
		]
	` );
		jest.useRealTimers();
	} );
	it( `[developmentMode] Timed-out fetch: should throw`, async () => {
		jest.useFakeTimers();

		spiedMonotonicNow.mockImplementation( () => Date.now() );
		const mockedConfig = createMockedConfig( { isDevelopmentMode: true } );
		( mockedConfig.fetchExperimentAssignment as MockedFunction ).mockImplementationOnce(
			() => new Promise( () => undefined )
		);
		const client = createExPlatClient( mockedConfig );
		const expectationPromise = expect(
			client.loadExperimentAssignment( validExperimentAssignment.experimentName )
		).rejects.toThrow( 'Promise has timed-out.' );
		jest.advanceTimersByTime( 5 * 1000 );
		await expectationPromise;
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "Promise has timed-out.",
		      "source": "loadExperimentAssignment-initialError",
		    },
		  ],
		]
	` );
		jest.useRealTimers();
	} );
	it( `logError throws/secondary error: should attempt to log secondary error and return fallback`, async () => {
		// Using invalid name as the initial error
		const mockedConfig = createMockedConfig();
		mockFetchExperimentAssignmentToMatchExperimentAssignment(
			mockedConfig,
			validExperimentAssignment
		);
		( mockedConfig.logError as MockedFunction ).mockImplementation( () => {
			throw new Error( 'Error logging.' );
		} );
		spiedMonotonicNow.mockImplementationOnce(
			() => validExperimentAssignment.retrievedTimestamp + 1000
		);
		const client = createExPlatClient( mockedConfig );
		await expect( client.loadExperimentAssignment( '' ) ).resolves.toEqual( {
			experimentName: '',
			retrievedTimestamp: validExperimentAssignment.retrievedTimestamp + 1000,
			ttl: 60,
			variationName: null,
			isFallbackExperimentAssignment: true,
		} );
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "",
		      "message": "Invalid experimentName: \\"\\"",
		      "source": "loadExperimentAssignment-initialError",
		    },
		  ],
		  Array [
		    Object {
		      "experimentName": "",
		      "message": "Invalid ExperimentAssignment",
		      "source": "loadExperimentAssignment-fallbackError",
		    },
		  ],
		]
	` );
	} );
	it( `[developmentMode] logError throws/secondary error: should throw`, async () => {
		// Using invalid name as the initial error
		const mockedConfig = createMockedConfig( { isDevelopmentMode: true } );
		mockFetchExperimentAssignmentToMatchExperimentAssignment(
			mockedConfig,
			validExperimentAssignment
		);
		( mockedConfig.logError as MockedFunction ).mockImplementation( () => {
			throw new Error( 'Error while logging.' );
		} );
		const client = createExPlatClient( mockedConfig );
		await expect( client.loadExperimentAssignment( '' ) ).rejects.toThrow(
			'Invalid experimentName: ""'
		);
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "",
		      "message": "Invalid experimentName: \\"\\"",
		      "source": "loadExperimentAssignment-initialError",
		    },
		  ],
		]
	` );
	} );
} );

describe( 'ExPlatClient.loadExperimentAssignment multiple-use', () => {
	it( `should respect the ttl (including developmentMode)`, async () => {
		const [ runTest, runDevelopmentModeTest ] = [
			createMockedConfig(),
			createMockedConfig( { isDevelopmentMode: true } ),
		].map( ( mockedConfig ) => async () => {
			mockFetchExperimentAssignmentToMatchExperimentAssignment(
				mockedConfig,
				validExperimentAssignment
			);
			const client = createExPlatClient( mockedConfig );

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
			expect(
				( mockedConfig.fetchExperimentAssignment as MockedFunction ).mock.calls
			).toHaveLength( 1 );
			expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot(
				`Array []`
			);

			const dateIncreasePastTtl = validExperimentAssignment.ttl * 1000 + 1;
			const refreshedValidExperimentAssignment = {
				...validExperimentAssignment,
				variationName: null,
				retrievedTimestamp: Date.now() + dateIncreasePastTtl,
			};
			mockFetchExperimentAssignmentToMatchExperimentAssignment(
				mockedConfig,
				refreshedValidExperimentAssignment
			);
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
			expect(
				( mockedConfig.fetchExperimentAssignment as MockedFunction ).mock.calls
			).toHaveLength( 2 );
			expect( ( await experimentAssignmentA ).retrievedTimestamp ).toBeLessThan(
				( await experimentAssignmentE ).retrievedTimestamp
			);
			expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot(
				`Array []`
			);
		} );

		await runTest();
		await runDevelopmentModeTest();
	} );

	it( `should only make one request even if it fails, returning the same fallback - until ttl is over with successful next`, async () => {
		const mockedConfig = createMockedConfig();
		const client = createExPlatClient( mockedConfig );

		const invalidExperimentAssignment = {
			...validExperimentAssignment,
			experimentName: '',
		};
		mockFetchExperimentAssignmentToMatchExperimentAssignment(
			mockedConfig,
			invalidExperimentAssignment
		);
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
		expect( ( mockedConfig.fetchExperimentAssignment as MockedFunction ).mock.calls ).toHaveLength(
			1
		);
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "Invalid ExperimentAssignment",
		      "source": "loadExperimentAssignment-initialError",
		    },
		  ],
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "Invalid ExperimentAssignment",
		      "source": "loadExperimentAssignment-initialError",
		    },
		  ],
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "Invalid ExperimentAssignment",
		      "source": "loadExperimentAssignment-initialError",
		    },
		  ],
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "Invalid ExperimentAssignment",
		      "source": "loadExperimentAssignment-initialError",
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
		mockFetchExperimentAssignmentToMatchExperimentAssignment(
			mockedConfig,
			refreshedValidExperimentAssignment
		);
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
		expect( ( mockedConfig.fetchExperimentAssignment as MockedFunction ).mock.calls ).toHaveLength(
			1
		);
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot(
			`Array []`
		);
	} );

	it( `[developmentMode] should only make one request even if it fails, throwing the same error`, async () => {
		const mockedConfig = createMockedConfig( { isDevelopmentMode: true } );
		const client = createExPlatClient( mockedConfig );

		const invalidExperimentAssignment = {
			...validExperimentAssignment,
			experimentName: '',
		};
		mockFetchExperimentAssignmentToMatchExperimentAssignment(
			mockedConfig,
			invalidExperimentAssignment
		);
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

		const promiseError = async ( promise: Promise< unknown > ) => {
			try {
				await promise;
			} catch ( e ) {
				return e;
			}
			throw new Error( `Promise shouldn't resolve.` );
		};
		const errorA = await promiseError( experimentAssignmentA );
		const errorB = await promiseError( experimentAssignmentB );
		const errorC = await promiseError( experimentAssignmentC );
		const errorD = await promiseError( experimentAssignmentD );

		expect( errorA ).toBe( errorB );
		expect( errorA ).toBe( errorC );
		expect( errorA ).toBe( errorD );
		expect( ( mockedConfig.fetchExperimentAssignment as MockedFunction ).mock.calls ).toHaveLength(
			1
		);
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "Invalid ExperimentAssignment",
		      "source": "loadExperimentAssignment-initialError",
		    },
		  ],
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "Invalid ExperimentAssignment",
		      "source": "loadExperimentAssignment-initialError",
		    },
		  ],
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "Invalid ExperimentAssignment",
		      "source": "loadExperimentAssignment-initialError",
		    },
		  ],
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "Invalid ExperimentAssignment",
		      "source": "loadExperimentAssignment-initialError",
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
		mockFetchExperimentAssignmentToMatchExperimentAssignment(
			mockedConfig,
			refreshedValidExperimentAssignment
		);
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
		expect( ( mockedConfig.fetchExperimentAssignment as MockedFunction ).mock.calls ).toHaveLength(
			1
		);
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot(
			`Array []`
		);
	} );
} );

describe( 'ExPlatClient.dangerouslyGetExperimentAssignment', () => {
	it( 'should throw when given an invalid name', () => {
		const mockedConfig = createMockedConfig();
		const client = createExPlatClient( mockedConfig );
		expect( () =>
			client.dangerouslyGetExperimentAssignment( 'the-invalid-name' )
		).toThrowErrorMatchingInlineSnapshot(
			`"Trying to dangerously get an ExperimentAssignment that hasn't loaded."`
		);
	} );

	it( `should throw when the matching experiment hasn't loaded yet`, () => {
		const mockedConfig = createMockedConfig();
		const client = createExPlatClient( mockedConfig );
		expect( () =>
			client.dangerouslyGetExperimentAssignment( 'experiment_name_a' )
		).toThrowErrorMatchingInlineSnapshot(
			`"Trying to dangerously get an ExperimentAssignment that hasn't loaded."`
		);
	} );

	it( `should throw when the matching experiment hasn't loaded yet but is currently loading`, () => {
		const mockedConfig = createMockedConfig();
		const client = createExPlatClient( mockedConfig );
		mockFetchExperimentAssignmentToMatchExperimentAssignment(
			mockedConfig,
			validExperimentAssignment
		);
		expect( () =>
			client.dangerouslyGetExperimentAssignment( 'experiment_name_a' )
		).toThrowErrorMatchingInlineSnapshot(
			`"Trying to dangerously get an ExperimentAssignment that hasn't loaded."`
		);
	} );

	it( `should return a loaded ExperimentAssignment`, async () => {
		const mockedConfig = createMockedConfig( { isDevelopmentMode: true } );
		const client = createExPlatClient( mockedConfig );
		mockFetchExperimentAssignmentToMatchExperimentAssignment(
			mockedConfig,
			validExperimentAssignment
		);
		spiedMonotonicNow.mockImplementationOnce(
			() => validExperimentAssignment.retrievedTimestamp + 1
		);
		await client.loadExperimentAssignment( validExperimentAssignment.experimentName );
		expect(
			client.dangerouslyGetExperimentAssignment( validExperimentAssignment.experimentName )
		).toEqual( validExperimentAssignment );
	} );

	it( `[developerMode] should throw when run too soon after loading an ExperimentAssignment`, async () => {
		const mockedConfig = createMockedConfig( { isDevelopmentMode: true } );
		const client = createExPlatClient( mockedConfig );
		mockFetchExperimentAssignmentToMatchExperimentAssignment(
			mockedConfig,
			validExperimentAssignment
		);
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
		const mockedConfig = createMockedConfig( { isDevelopmentMode: true } );
		const client = createExPlatClient( mockedConfig );
		mockFetchExperimentAssignmentToMatchExperimentAssignment(
			mockedConfig,
			validExperimentAssignment
		);
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
