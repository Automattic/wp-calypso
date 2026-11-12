import { vi } from 'vitest';
import { createSsrSafeDummyExPlatClient } from '../create-explat-client';
import * as Timing from '../internal/timing';
import type { Config } from '../types';

const spiedMonotonicNow = vi.spyOn( Timing, 'monotonicNow' );

const createMockedConfig = ( override: Partial< Config > = {} ): Config => ( {
	logError: vi.fn(),
	fetchExperimentAssignment: vi.fn(),
	getAnonId: vi.fn(),
	isDevelopmentMode: false,
	...override,
} );

beforeEach( () => {
	vi.resetAllMocks();
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

		expect( vi.mocked( mockedConfig.fetchExperimentAssignment ).mock.calls ).toHaveLength( 0 );
		expect( vi.mocked( mockedConfig.getAnonId ).mock.calls ).toHaveLength( 0 );
		expect( vi.mocked( mockedConfig.logError ).mock.calls ).toMatchInlineSnapshot( `
			[
			  [
			    {
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

		expect( vi.mocked( mockedConfig.fetchExperimentAssignment ).mock.calls ).toHaveLength( 0 );
		expect( vi.mocked( mockedConfig.getAnonId ).mock.calls ).toHaveLength( 0 );
		expect( vi.mocked( mockedConfig.logError ).mock.calls ).toMatchInlineSnapshot( `
			[
			  [
			    {
			      "experimentName": "experiment_name",
			      "message": "Attempting to dangerously get ExperimentAssignment in SSR context",
			    },
			  ],
			]
		` );
	} );
} );
