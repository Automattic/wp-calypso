import { createExPlatClient } from '../create-explat-client';
import localStorage from '../internal/local-storage';
import {
	delayedValue,
	ONE_DELAY,
	setBrowserContext,
	setSsrContext,
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

beforeEach( () => {
	jest.resetAllMocks();
	setBrowserContext();
	localStorage.clear();
} );

describe( 'createExPlatClient', () => {
	it( 'should throw if initialized outside of a browser context', () => {
		setSsrContext();
		expect( () => createExPlatClient( createMockedConfig() ) ).toThrowErrorMatchingInlineSnapshot(
			'"Running outside of a browser context."'
		);
	} );

	it( "shouldn't throw if initialized multiple times", () => {
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
	it( 'should successfully load an ExperimentAssignment', async () => {
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
			'Array []'
		);
	} );
	it( 'should return a fallback for a disabled Experiment', async () => {
		const mockedConfig = createMockedConfig();
		const timestamp0 = 0;
		const timestamp1 = 1;
		spiedMonotonicNow.mockImplementationOnce( () => timestamp0 );
		spiedMonotonicNow.mockImplementationOnce( () => timestamp1 );
		( mockedConfig.fetchExperimentAssignment as MockedFunction ).mockImplementationOnce( () =>
			delayedValue(
				{
					ttl: 60,
					variations: {},
				},
				ONE_DELAY
			)
		);
		const client = createExPlatClient( mockedConfig );
		await expect(
			client.loadExperimentAssignment( validExperimentAssignment.experimentName )
		).resolves.toEqual( {
			...validExperimentAssignment,
			variationName: null,
			retrievedTimestamp: timestamp1,
			isFallbackExperimentAssignment: true,
		} );
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot(
			'Array []'
		);
	} );
	it( '[anonId] should successfully load an ExperimentAssignment', async () => {
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
		spiedMonotonicNow.mockImplementationOnce(
			() => validExperimentAssignment.retrievedTimestamp + 1001
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
			'Array []'
		);
	} );
	it( 'Invalid experimentName: should return fallback and log', async () => {
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
	it( 'Could not fetch ExperimentAssignment: should store and return fallback, and log', async () => {
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

	it( 'Timed-out fetch: should return fallback and log', async () => {
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
		// Temporary hack for the A/B experiment, see https://github.com/Automattic/wp-calypso/pull/54507
		const error = ( mockedConfig.logError as MockedFunction ).mock.calls[ 0 ][ 0 ];
		expect( error ).toEqual(
			expect.objectContaining( {
				experimentName: 'experiment_name_a',
				source: 'loadExperimentAssignment-initialError',
			} )
		);
		expect( error.message ).toMatch( /Promise has timed-out after [0-9]+ms\./ );
		jest.useRealTimers();
	} );
	it( 'logError throws/secondary error: should attempt to log secondary error and return fallback', async () => {
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
} );

describe( 'ExPlatClient.loadExperimentAssignment multiple-use', () => {
	it( 'should respect the ttl (including developmentMode)', async () => {
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
				'Array []'
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
				'Array []'
			);
		} );

		await runTest();
		localStorage.clear();
		await runDevelopmentModeTest();
	} );

	it( 'should only make one request even if it fails, returning the same fallback - until ttl is over with successful next', async () => {
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
			'Array []'
		);
	} );
} );

describe( 'ExPlatClient.dangerouslyGetExperimentAssignment', () => {
	it( 'should log and return fallback when given an invalid name', () => {
		const mockedConfig = createMockedConfig( { isDevelopmentMode: true } );
		const client = createExPlatClient( mockedConfig );
		const firstNow = Date.now();
		spiedMonotonicNow.mockImplementationOnce( () => firstNow );
		expect( client.dangerouslyGetExperimentAssignment( '' ) ).toEqual( {
			experimentName: '',
			retrievedTimestamp: firstNow,
			ttl: 60,
			variationName: null,
			isFallbackExperimentAssignment: true,
		} );
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "",
		      "message": "Invalid experimentName: ",
		      "source": "dangerouslyGetExperimentAssignment-error",
		    },
		  ],
		]
	` );
	} );

	it( "should log and return fallback when the matching experiment hasn't loaded yet", () => {
		const mockedConfig = createMockedConfig( { isDevelopmentMode: true } );
		const client = createExPlatClient( mockedConfig );
		const firstNow = Date.now();
		spiedMonotonicNow.mockImplementationOnce( () => firstNow );
		expect( client.dangerouslyGetExperimentAssignment( 'experiment_name_a' ) ).toEqual( {
			experimentName: 'experiment_name_a',
			retrievedTimestamp: firstNow,
			ttl: 60,
			variationName: null,
			isFallbackExperimentAssignment: true,
		} );
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "Trying to dangerously get an ExperimentAssignment that hasn't loaded.",
		      "source": "dangerouslyGetExperimentAssignment-error",
		    },
		  ],
		]
	` );
	} );

	it( "should log and return fallback when the matching experiment hasn't loaded yet but is currently loading", async () => {
		jest.useFakeTimers();
		const mockedConfig = createMockedConfig( { isDevelopmentMode: true } );
		const client = createExPlatClient( mockedConfig );
		const firstNow = Date.now();
		spiedMonotonicNow.mockImplementationOnce( () => firstNow );
		const secondNow = Date.now();
		spiedMonotonicNow.mockImplementationOnce( () => secondNow );
		const promise = client.loadExperimentAssignment( 'experiment_name_a' );
		expect( client.dangerouslyGetExperimentAssignment( 'experiment_name_a' ) ).toEqual( {
			experimentName: 'experiment_name_a',
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
		      "message": "Trying to dangerously get an ExperimentAssignment that hasn't loaded.",
		      "source": "dangerouslyGetExperimentAssignment-error",
		    },
		  ],
		]
	` );
		jest.runAllTimers();
		await promise;
		jest.useRealTimers();
	} );

	it( 'should return a loaded ExperimentAssignment', async () => {
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

	it( '[developerMode] should log error when run too soon after loading an ExperimentAssignment', async () => {
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
		client.dangerouslyGetExperimentAssignment( validExperimentAssignment.experimentName );
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "experiment_name_a",
		      "message": "Warning: Trying to dangerously get an ExperimentAssignment too soon after loading it.",
		      "source": "dangerouslyGetExperimentAssignment",
		    },
		  ],
		]
	` );
	} );
} );

describe( 'ExPlatClient.dangerouslyGetMaybeLoadedExperimentAssignment', () => {
	it( 'should log and return fallback when given an invalid name', () => {
		const mockedConfig = createMockedConfig( { isDevelopmentMode: true } );
		const client = createExPlatClient( mockedConfig );
		const firstNow = Date.now();
		spiedMonotonicNow.mockImplementationOnce( () => firstNow );
		expect( client.dangerouslyGetMaybeLoadedExperimentAssignment( '' ) ).toEqual( {
			experimentName: '',
			retrievedTimestamp: firstNow,
			ttl: 60,
			variationName: null,
			isFallbackExperimentAssignment: true,
		} );
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "",
		      "message": "Invalid experimentName: ",
		      "source": "dangerouslyGetMaybeLoadedExperimentAssignment-error",
		    },
		  ],
		]
	` );
	} );

	it( "return null when the matching experiment hasn't loaded yet", () => {
		const mockedConfig = createMockedConfig( { isDevelopmentMode: true } );
		const client = createExPlatClient( mockedConfig );
		const firstNow = Date.now();
		spiedMonotonicNow.mockImplementationOnce( () => firstNow );
		expect(
			client.dangerouslyGetMaybeLoadedExperimentAssignment( 'experiment_name_a' )
		).toBeNull();
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls.length ).toEqual( 0 );
	} );

	it( "return null when the matching experiment hasn't loaded yet but is currently loading", async () => {
		jest.useFakeTimers();
		const mockedConfig = createMockedConfig( { isDevelopmentMode: true } );
		const client = createExPlatClient( mockedConfig );
		const firstNow = Date.now();
		spiedMonotonicNow.mockImplementationOnce( () => firstNow );
		const secondNow = Date.now();
		spiedMonotonicNow.mockImplementationOnce( () => secondNow );
		const promise = client.loadExperimentAssignment( 'experiment_name_a' );
		expect(
			client.dangerouslyGetMaybeLoadedExperimentAssignment( 'experiment_name_a' )
		).toBeNull();
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls.length ).toEqual( 0 );
		jest.runAllTimers();
		await promise;
		jest.useRealTimers();
	} );

	it( 'should return a loaded ExperimentAssignment', async () => {
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
			client.dangerouslyGetMaybeLoadedExperimentAssignment(
				validExperimentAssignment.experimentName
			)
		).toEqual( validExperimentAssignment );
	} );
} );
