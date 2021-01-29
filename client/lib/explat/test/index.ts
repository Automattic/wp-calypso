/**
 * Internal dependencies
 */
import ExPlatClient from '../index';

describe( 'ExPlatClient', () => {
	test( 'should run without crashing in SSR', async () => {
		expect( await ExPlatClient.loadExperimentAssignment( 'experiment_a' ) ).toMatchInlineSnapshot( `
		Object {
		  "experimentName": "null_experiment_assignment",
		  "retrievedTimestamp": 0,
		  "ttl": 0,
		  "variationName": null,
		}
	` );
		expect( await ExPlatClient.loadExperimentAssignment( 'experiment_b' ) ).toMatchInlineSnapshot( `
		Object {
		  "experimentName": "null_experiment_assignment",
		  "retrievedTimestamp": 0,
		  "ttl": 0,
		  "variationName": null,
		}
	` );
		expect( () =>
			ExPlatClient.dangerouslyGetExperimentAssignment( 'experiment_b' )
		).toThrowErrorMatchingInlineSnapshot(
			`[MissingExperimentAssignmentError: Trying to dangerously get an ExperimentAssignment that hasn't loaded.]`
		);
		expect( () =>
			ExPlatClient.dangerouslyGetExperimentAssignment( 'experiment_c' )
		).toThrowErrorMatchingInlineSnapshot(
			`[MissingExperimentAssignmentError: Trying to dangerously get an ExperimentAssignment that hasn't loaded.]`
		);
	} );
} );
