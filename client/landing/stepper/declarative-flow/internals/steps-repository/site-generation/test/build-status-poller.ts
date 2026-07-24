/**
 * @jest-environment jsdom
 */

import { pollForBuildWowStatus } from '../build-status-poller';

describe( 'pollForBuildWowStatus', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'reports progress and calls onReady once the status is live', async () => {
		const fetchStatus = jest
			.fn()
			.mockResolvedValueOnce( { build_status: 'delivering' } )
			.mockResolvedValueOnce( { build_status: 'live' } );
		const onReady = jest.fn();
		const onFailed = jest.fn();
		const onProgress = jest.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady,
			onFailed,
			onProgress,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 0 );
		expect( onProgress ).toHaveBeenCalledWith( 'delivering' );
		expect( onReady ).not.toHaveBeenCalled();

		await jest.advanceTimersByTimeAsync( 1000 );
		expect( onReady ).toHaveBeenCalledTimes( 1 );
		expect( onFailed ).not.toHaveBeenCalled();
	} );

	it( 'calls onFailed and stops polling on a failed status', async () => {
		const fetchStatus = jest
			.fn()
			.mockResolvedValue( { build_status: 'failed:build_wow_theme_activation_failed' } );
		const onReady = jest.fn();
		const onFailed = jest.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady,
			onFailed,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 0 );
		expect( onFailed ).toHaveBeenCalledWith( 'failed:build_wow_theme_activation_failed' );
		expect( onReady ).not.toHaveBeenCalled();

		await jest.advanceTimersByTimeAsync( 5000 );
		expect( fetchStatus ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'keeps polling while the status is missing or still in progress', async () => {
		const fetchStatus = jest
			.fn()
			.mockResolvedValueOnce( {} )
			.mockResolvedValueOnce( { build_status: 'activating' } )
			.mockResolvedValueOnce( { build_status: 'live' } );
		const onReady = jest.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady,
			onFailed: jest.fn(),
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 2000 );
		expect( onReady ).toHaveBeenCalledTimes( 1 );
		expect( fetchStatus ).toHaveBeenCalledTimes( 3 );
	} );

	it( 'continues polling after a temporary request failure', async () => {
		const fetchStatus = jest
			.fn()
			.mockRejectedValueOnce( new Error( 'Unavailable' ) )
			.mockResolvedValueOnce( { build_status: 'live' } );
		const onReady = jest.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady,
			onFailed: jest.fn(),
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 1000 );
		expect( onReady ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'aborts a status request that does not settle', async () => {
		const fetchStatus = jest
			.fn()
			.mockImplementationOnce(
				( _siteIdentifier: string, signal: AbortSignal ) =>
					new Promise< { build_status?: string } >( ( _resolve, reject ) => {
						signal.addEventListener( 'abort', () => reject( new Error( 'Aborted' ) ) );
					} )
			)
			.mockResolvedValueOnce( { build_status: 'live' } );
		const onReady = jest.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady,
			onFailed: jest.fn(),
			pollIntervalMs: 1000,
			requestTimeoutMs: 500,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 1500 );
		expect( onReady ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'stops polling and aborts the current request when cancelled', async () => {
		const fetchStatus = jest.fn().mockResolvedValue( {} );
		const stop = pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: jest.fn(),
			onFailed: jest.fn(),
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 0 );
		stop();
		await jest.advanceTimersByTimeAsync( 5000 );

		expect( fetchStatus ).toHaveBeenCalledTimes( 1 );
	} );
} );
