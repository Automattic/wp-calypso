/**
 * External dependencies
 */
import MockDate from 'mockdate';

/**
 * Internal dependencies
 */
import ExPlatClient from '../index';

const mockLogError = jest.fn();
jest.mock( '../internals/log-error', () => ( {
	...jest.requireActual( '../internals/log-error' ),
	// We get a runtype type error if we don't do this:
	logError: ( ...args ) => mockLogError( ...args ),
} ) );

beforeEach( () => {
	MockDate.set( 0 );
} );

describe( 'ExPlatClient', () => {
	test( 'should run without crashing in SSR', async () => {
		mockLogError.mockReset();
		expect( await ExPlatClient.loadExperimentAssignment( 'experiment_a' ) ).toMatchInlineSnapshot( `
		Object {
		  "experimentName": "experiment_a",
		  "isFallbackExperimentAssignment": true,
		  "retrievedTimestamp": 1,
		  "ttl": 60,
		  "variationName": null,
		}
	` );
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
		mockLogError.mockReset();
		expect( await ExPlatClient.loadExperimentAssignment( 'experiment_b' ) ).toMatchInlineSnapshot( `
		Object {
		  "experimentName": "experiment_b",
		  "isFallbackExperimentAssignment": true,
		  "retrievedTimestamp": 2,
		  "ttl": 60,
		  "variationName": null,
		}
	` );
		expect( mockLogError.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "experiment_b",
		      "message": "Attempting to load ExperimentAssignment in SSR context",
		    },
		  ],
		]
	` );
		mockLogError.mockReset();
		expect( ExPlatClient.dangerouslyGetExperimentAssignment( 'experiment_b' ) )
			.toMatchInlineSnapshot( `
		Object {
		  "experimentName": "experiment_b",
		  "isFallbackExperimentAssignment": true,
		  "retrievedTimestamp": 3,
		  "ttl": 60,
		  "variationName": null,
		}
	` );
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
		mockLogError.mockReset();
		expect( ExPlatClient.dangerouslyGetExperimentAssignment( 'experiment_c' ) )
			.toMatchInlineSnapshot( `
		Object {
		  "experimentName": "experiment_c",
		  "isFallbackExperimentAssignment": true,
		  "retrievedTimestamp": 4,
		  "ttl": 60,
		  "variationName": null,
		}
	` );
		expect( mockLogError.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "experiment_c",
		      "message": "Attempting to dangerously get ExperimentAssignment in SSR context",
		    },
		  ],
		]
	` );
	} );
} );
