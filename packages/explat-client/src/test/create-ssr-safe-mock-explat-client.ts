/**
 * External dependencies
 */
// This is required to fix the "regeneratorRuntime is not defined" error
import '@automattic/calypso-polyfills';

/**
 * Internal dependencies
 */
import createSsrSafeMockExPlatClient from '../create-ssr-safe-mock-explat-client';
import * as Timing from '../internal/timing';
import type { Config } from '../types';

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

beforeEach( () => {
	jest.resetAllMocks();
} );

describe( 'loadExperimentAssignment', () => {
	it( 'should behave as expected', async () => {
		spiedMonotonicNow.mockImplementationOnce( () => 123456 );
		const client = createSsrSafeMockExPlatClient( mockedConfig );

		await expect( client.loadExperimentAssignment( 'experiment_name' ) ).resolves.toEqual( {
			experimentName: 'experiment_name',
			isFallbackExperimentAssignment: true,
			retrievedTimestamp: 123456,
			ttl: 60,
			variationName: null,
		} );

		expect( mockedFetchExperimentAssignment.mock.calls ).toHaveLength( 0 );
		expect( mockedGetAnonId.mock.calls ).toHaveLength( 0 );
		expect( mockedLogError.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "experiment_name",
		      "message": "Attempting to load ExperimentAssignment in SSR context",
		    },
		  ],
		]
	` );
	} );
} );

describe( 'dangerouslyGetExperimentAssignment', () => {
	it( 'should behave as expected', () => {
		spiedMonotonicNow.mockImplementationOnce( () => 123456 );

		const client = createSsrSafeMockExPlatClient( mockedConfig );
		expect( client.dangerouslyGetExperimentAssignment( 'experiment_name' ) ).toEqual( {
			experimentName: 'experiment_name',
			isFallbackExperimentAssignment: true,
			retrievedTimestamp: 123456,
			ttl: 60,
			variationName: null,
		} );

		expect( mockedFetchExperimentAssignment.mock.calls ).toHaveLength( 0 );
		expect( mockedGetAnonId.mock.calls ).toHaveLength( 0 );
		expect( mockedLogError.mock.calls ).toMatchInlineSnapshot( `
		Array [
		  Array [
		    Object {
		      "experimentName": "experiment_name",
		      "message": "Attempting to dangerously get ExperimentAssignment in SSR context",
		    },
		  ],
		]
	` );
	} );
} );
