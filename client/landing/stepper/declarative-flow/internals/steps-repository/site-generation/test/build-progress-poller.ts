/**
 * @jest-environment jsdom
 */

import { getStepProgress, pollForBuildProgress } from '../build-progress-poller';

describe( 'getStepProgress', () => {
	const stepIds = [ 'preparing', 'designing', 'building', 'images', 'polishing', 'publishing' ];
	const getStepIndex = ( response: Parameters< typeof getStepProgress >[ 0 ] ) =>
		getStepProgress( response, stepIds )?.stepIndex ?? null;

	it( 'maps persisted workflow events to their matching UI steps', () => {
		expect( getStepIndex( { current: 'site-spec' } ) ).toBe( 0 );
		expect( getStepIndex( { current: 'theme-json+page-plan' } ) ).toBe( 1 );
		expect( getStepIndex( { current: 'header-hero' } ) ).toBe( 2 );
		expect( getStepIndex( { current: 'assemble-pages' } ) ).toBe( 3 );
		expect( getStepIndex( { current: 'generate-images' } ) ).toBe( 4 );
		expect( getStepIndex( { current: 'generate' } ) ).toBe( 5 );
	} );

	it( 'uses the furthest recognized event when the current event is internal', () => {
		expect(
			getStepIndex( {
				current: 'prepare',
				history: [ { status: 'theme-json' }, { status: 'prepare' } ],
			} )
		).toBe( 1 );
	} );

	it( 'does not move backwards when a heartbeat resurfaces an earlier step', () => {
		// The backend refreshes a repeated step's timestamp, so a long-running
		// early tool can reappear at the end of the history after later steps.
		expect(
			getStepIndex( {
				current: 'theme-json',
				history: [ { status: 'generate-images' }, { status: 'theme-json' } ],
			} )
		).toBe( 4 );
	} );

	it( 'returns null when the response has no recognized progress', () => {
		expect( getStepIndex( { current: 'done' } ) ).toBeNull();
		expect( getStepIndex( { current: 'fail' } ) ).toBeNull();
		expect( getStepIndex( {} ) ).toBeNull();
	} );

	it( 'returns the earliest timestamp recorded for the active milestone', () => {
		expect(
			getStepProgress(
				{
					current: 'theme-json',
					last_update: 1723032195,
					history: [
						{ status: 'site-spec', timestamp: 1723032000 },
						{ status: 'design-direction', timestamp: 1723032170 },
						{ status: 'theme-json', timestamp: 1723032195 },
					],
				},
				stepIds
			)
		).toEqual( { stepIndex: 1, startedAt: 1723032170000 } );
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
