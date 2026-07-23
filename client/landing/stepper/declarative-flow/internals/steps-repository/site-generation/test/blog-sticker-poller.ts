/**
 * @jest-environment jsdom
 */

import { BUILD_WOW_READY_STICKER, pollForBuildWowReadySticker } from '../blog-sticker-poller';

describe( 'pollForBuildWowReadySticker', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'polls until the ready sticker appears', async () => {
		const fetchStickers = jest
			.fn()
			.mockResolvedValueOnce( [] )
			.mockResolvedValueOnce( [ BUILD_WOW_READY_STICKER ] );
		const onReady = jest.fn();

		pollForBuildWowReadySticker( {
			siteIdentifier: '123',
			onReady,
			pollIntervalMs: 1000,
			fetchStickers,
		} );

		await jest.advanceTimersByTimeAsync( 0 );
		expect( onReady ).not.toHaveBeenCalled();

		await jest.advanceTimersByTimeAsync( 1000 );
		expect( onReady ).toHaveBeenCalledTimes( 1 );
		expect( fetchStickers ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'continues polling after a temporary request failure', async () => {
		const fetchStickers = jest
			.fn()
			.mockRejectedValueOnce( new Error( 'Unavailable' ) )
			.mockResolvedValueOnce( [ BUILD_WOW_READY_STICKER ] );
		const onReady = jest.fn();

		pollForBuildWowReadySticker( {
			siteIdentifier: '123',
			onReady,
			pollIntervalMs: 1000,
			fetchStickers,
		} );

		await jest.advanceTimersByTimeAsync( 1000 );
		expect( onReady ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'aborts a status request that does not settle', async () => {
		const fetchStickers = jest
			.fn()
			.mockImplementationOnce(
				( _siteIdentifier: string, signal: AbortSignal ) =>
					new Promise< string[] >( ( _resolve, reject ) => {
						signal.addEventListener( 'abort', () => reject( new Error( 'Aborted' ) ) );
					} )
			)
			.mockResolvedValueOnce( [ BUILD_WOW_READY_STICKER ] );
		const onReady = jest.fn();

		pollForBuildWowReadySticker( {
			siteIdentifier: '123',
			onReady,
			pollIntervalMs: 1000,
			requestTimeoutMs: 500,
			fetchStickers,
		} );

		await jest.advanceTimersByTimeAsync( 1500 );
		expect( onReady ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'stops polling and aborts the current request when cancelled', async () => {
		const fetchStickers = jest.fn().mockResolvedValue( [] );
		const stop = pollForBuildWowReadySticker( {
			siteIdentifier: '123',
			onReady: jest.fn(),
			pollIntervalMs: 1000,
			fetchStickers,
		} );

		await jest.advanceTimersByTimeAsync( 0 );
		stop();
		await jest.advanceTimersByTimeAsync( 5000 );

		expect( fetchStickers ).toHaveBeenCalledTimes( 1 );
	} );
} );
