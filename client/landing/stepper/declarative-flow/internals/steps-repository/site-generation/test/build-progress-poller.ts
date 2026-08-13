/**
 * @jest-environment jsdom
 */

import { getStepIndexForProgress, pollForBuildProgress } from '../build-progress-poller';

describe( 'getStepIndexForProgress', () => {
	const stepIds = [ 'preparing', 'designing', 'building', 'images', 'polishing', 'publishing' ];

	it( 'maps persisted workflow events to their matching UI steps', () => {
		expect( getStepIndexForProgress( { current: 'site-spec' }, stepIds ) ).toBe( 0 );
		expect( getStepIndexForProgress( { current: 'theme-json+page-plan' }, stepIds ) ).toBe( 1 );
		expect( getStepIndexForProgress( { current: 'header-hero' }, stepIds ) ).toBe( 2 );
		expect( getStepIndexForProgress( { current: 'assemble-pages' }, stepIds ) ).toBe( 3 );
		expect( getStepIndexForProgress( { current: 'generate-images' }, stepIds ) ).toBe( 4 );
		expect( getStepIndexForProgress( { current: 'generate' }, stepIds ) ).toBe( 5 );
	} );

	it( 'uses the furthest recognized event when the current event is internal', () => {
		expect(
			getStepIndexForProgress(
				{
					current: 'prepare',
					history: [ { status: 'theme-json' }, { status: 'prepare' } ],
				},
				stepIds
			)
		).toBe( 1 );
	} );

	it( 'does not move backwards when a heartbeat resurfaces an earlier step', () => {
		// The backend refreshes a repeated step's timestamp, so a long-running
		// early tool can reappear at the end of the history after later steps.
		expect(
			getStepIndexForProgress(
				{
					current: 'theme-json',
					history: [ { status: 'generate-images' }, { status: 'theme-json' } ],
				},
				stepIds
			)
		).toBe( 4 );
	} );

	it( 'returns null when the response has no recognized progress', () => {
		expect( getStepIndexForProgress( { current: 'done' }, stepIds ) ).toBeNull();
		expect( getStepIndexForProgress( { current: 'fail' }, stepIds ) ).toBeNull();
		expect( getStepIndexForProgress( {}, stepIds ) ).toBeNull();
	} );
} );

describe( 'pollForBuildProgress', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'reports generation events and stops after reporting the final history', async () => {
		const finalProgress = {
			current: 'done',
			history: [ { status: 'generate' } ],
		};
		const fetchProgress = jest
			.fn()
			.mockResolvedValueOnce( { current: 'theme-json' } )
			.mockResolvedValueOnce( finalProgress );
		const onProgress = jest.fn();

		pollForBuildProgress( {
			siteIdentifier: '123',
			onProgress,
			pollIntervalMs: 1000,
			fetchProgress,
		} );

		await jest.advanceTimersByTimeAsync( 5000 );

		expect( onProgress ).toHaveBeenNthCalledWith( 1, { current: 'theme-json' } );
		expect( onProgress ).toHaveBeenNthCalledWith( 2, finalProgress );
		expect( fetchProgress ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'continues polling after a temporary request failure', async () => {
		const fetchProgress = jest
			.fn()
			.mockRejectedValueOnce( new Error( 'Unavailable' ) )
			.mockResolvedValueOnce( { current: 'site-spec' } )
			.mockResolvedValueOnce( { current: 'done' } );
		const onProgress = jest.fn();

		pollForBuildProgress( {
			siteIdentifier: '123',
			onProgress,
			pollIntervalMs: 1000,
			fetchProgress,
		} );

		await jest.advanceTimersByTimeAsync( 2000 );

		expect( onProgress ).toHaveBeenCalledWith( { current: 'site-spec' } );
		expect( fetchProgress ).toHaveBeenCalledTimes( 3 );
	} );

	it( 'stops polling and aborts the current request when cancelled', async () => {
		const fetchProgress = jest.fn().mockResolvedValue( {} );
		const stop = pollForBuildProgress( {
			siteIdentifier: '123',
			onProgress: jest.fn(),
			pollIntervalMs: 1000,
			fetchProgress,
		} );

		await jest.advanceTimersByTimeAsync( 0 );
		stop();
		await jest.advanceTimersByTimeAsync( 5000 );

		expect( fetchProgress ).toHaveBeenCalledTimes( 1 );
	} );
} );
