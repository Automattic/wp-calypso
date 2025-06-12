// @ts-nocheck - TODO: Fix TypeScript issues
import * as ExPlatClient from '../index';

const mockLogError = jest.fn();
jest.mock( '../internals/log-error', () => ( {
	...jest.requireActual( '../internals/log-error' ),
	// We get a runtime type error if we don't do this:
	logError: ( ...args ) => mockLogError( ...args ),
} ) );

beforeEach( () => {
	jest.resetAllMocks();
} );

describe( 'ExPlatClient', () => {
	test( 'should loadExperimentAssignment without crashing in SSR', async () => {
		const startNow = Date.now();
		const experimentAssignment = await ExPlatClient.loadExperimentAssignment( 'experiment_a' );
		expect( experimentAssignment ).toMatchObject( {
			experimentName: 'experiment_a',
			isFallbackExperimentAssignment: true,
			ttl: 60,
			variationName: null,
		} );
		expect( experimentAssignment.retrievedTimestamp ).toBeGreaterThanOrEqual( startNow );
		expect( mockLogError.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "experiment_a",
		      "message": "Attempting to load ExperimentAssignment in SSR context",
		    },
		  ],
		]
	` );
	} );

	test( 'should dangerouslyGetExperimentAssignment without crashing in SSR', async () => {
		const startNow = Date.now();
		const experimentAssignment = ExPlatClient.dangerouslyGetExperimentAssignment( 'experiment_b' );
		expect( experimentAssignment ).toMatchObject( {
			experimentName: 'experiment_b',
			isFallbackExperimentAssignment: true,
			ttl: 60,
			variationName: null,
		} );
		expect( experimentAssignment.retrievedTimestamp ).toBeGreaterThanOrEqual( startNow );
		expect( mockLogError.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "experiment_b",
		      "message": "Attempting to dangerously get ExperimentAssignment in SSR context",
		    },
		  ],
		]
	` );
	} );
} );
