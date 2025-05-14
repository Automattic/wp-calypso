import { createSsrSafeDummyExPlatClient } from '../create-explat-client';
import * as Timing from '../internal/timing';
import type { Config } from '../types';

const spiedMonotonicNow = jest.spyOn( Timing, 'monotonicNow' );

type MockedFunction = ReturnType< typeof jest.fn >;
const createMockedConfig = ( override: Partial< Config > = {} ): Config => ( {
	logError: jest.fn(),
	fetchExperimentAssignment: jest.fn(),
	getAnonId: jest.fn(),
	isDevelopmentMode: false,
	...override,
} );

beforeEach( () => {
	jest.resetAllMocks();
} );

describe( 'loadExperimentAssignment', () => {
	it( 'should behave as expected', async () => {
		spiedMonotonicNow.mockImplementationOnce( () => 123456 );
		const mockedConfig = createMockedConfig();
		const client = createSsrSafeDummyExPlatClient( mockedConfig );

		await expect( client.loadExperimentAssignment( 'experiment_name' ) ).resolves.toEqual( {
			experimentName: 'experiment_name',
			isFallbackExperimentAssignment: true,
			retrievedTimestamp: 123456,
			ttl: 60,
			variationName: null,
		} );

		expect( ( mockedConfig.fetchExperimentAssignment as MockedFunction ).mock.calls ).toHaveLength(
			0
		);
		expect( ( mockedConfig.getAnonId as MockedFunction ).mock.calls ).toHaveLength( 0 );
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot( `
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
		const mockedConfig = createMockedConfig();
		const client = createSsrSafeDummyExPlatClient( mockedConfig );
		expect( client.dangerouslyGetExperimentAssignment( 'experiment_name' ) ).toEqual( {
			experimentName: 'experiment_name',
			isFallbackExperimentAssignment: true,
			retrievedTimestamp: 123456,
			ttl: 60,
			variationName: null,
		} );

		expect( ( mockedConfig.fetchExperimentAssignment as MockedFunction ).mock.calls ).toHaveLength(
			0
		);
		expect( ( mockedConfig.getAnonId as MockedFunction ).mock.calls ).toHaveLength( 0 );
		expect( ( mockedConfig.logError as MockedFunction ).mock.calls ).toMatchInlineSnapshot( `
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
