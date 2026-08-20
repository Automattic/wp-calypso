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

	it( 'calls onReady once the status is live', async () => {
		const fetchStatus = jest
			.fn()
			.mockResolvedValueOnce( { build_status: 'delivering' } )
			.mockResolvedValueOnce( { build_status: 'live' } );
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
		expect( onFailed ).toHaveBeenCalledWith(
			'failed:build_wow_theme_activation_failed',
			undefined
		);
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

	it( 'ignores a non-string status instead of throwing', async () => {
		const fetchStatus = jest
			.fn()
			.mockResolvedValueOnce( { build_status: 1 } )
			.mockResolvedValueOnce( { build_status: 'live' } );
		const onReady = jest.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady,
			onFailed: jest.fn(),
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 0 );
		expect( onReady ).not.toHaveBeenCalled();

		await jest.advanceTimersByTimeAsync( 1000 );
		expect( onReady ).toHaveBeenCalledTimes( 1 );
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

	it( 'reports an identical repeating request error only once', async () => {
		const fetchStatus = jest.fn().mockRejectedValue( new Error( 'Unavailable' ) );
		const onRequestError = jest.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: jest.fn(),
			onFailed: jest.fn(),
			onRequestError,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 3000 );

		expect( fetchStatus ).toHaveBeenCalledTimes( 4 );
		expect( onRequestError ).toHaveBeenCalledTimes( 1 );
		expect( onRequestError.mock.calls[ 0 ][ 0 ] ).toBe( 'Unavailable' );
	} );

	it( 'does not re-report when requests flap between success and failure', async () => {
		const fetchStatus = jest
			.fn()
			.mockRejectedValueOnce( new Error( 'Unavailable' ) )
			.mockResolvedValueOnce( { build_status: 'delivering' } )
			.mockRejectedValueOnce( new Error( 'Unavailable' ) )
			.mockResolvedValue( { build_status: 'delivering' } );
		const onRequestError = jest.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: jest.fn(),
			onFailed: jest.fn(),
			onRequestError,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 4000 );

		expect( onRequestError ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not report the abort caused by its own teardown', async () => {
		const fetchStatus = jest.fn(
			( _siteIdentifier: string, signal: AbortSignal ) =>
				new Promise< { build_status?: string } >( ( _resolve, reject ) => {
					// The proxy transport rejects with the abort Event, not an Error.
					signal.addEventListener( 'abort', ( event ) => reject( event ) );
				} )
		);
		const onRequestError = jest.fn();

		const stop = pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: jest.fn(),
			onFailed: jest.fn(),
			onRequestError,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 0 );
		stop();
		await jest.advanceTimersByTimeAsync( 1000 );

		expect( onRequestError ).not.toHaveBeenCalled();
	} );

	it( 'reports a request timeout as a readable reason, not "[object Event]"', async () => {
		const fetchStatus = jest.fn(
			( _siteIdentifier: string, signal: AbortSignal ) =>
				new Promise< { build_status?: string } >( ( _resolve, reject ) => {
					signal.addEventListener( 'abort', ( event ) => reject( event ) );
				} )
		);
		const onRequestError = jest.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: jest.fn(),
			onFailed: jest.fn(),
			onRequestError,
			pollIntervalMs: 1000,
			requestTimeoutMs: 500,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 600 );

		expect( onRequestError ).toHaveBeenCalledTimes( 1 );
		expect( onRequestError.mock.calls[ 0 ][ 0 ] ).toBe( 'request timed out after 500ms' );
	} );

	it( 'reports a later distinct error rather than hiding it behind the first', async () => {
		const fetchStatus = jest
			.fn()
			.mockRejectedValueOnce( new Error( 'Service unavailable' ) )
			.mockRejectedValueOnce( new Error( 'Service unavailable' ) )
			.mockRejectedValue( new Error( 'Internal server error' ) );
		const onRequestError = jest.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: jest.fn(),
			onFailed: jest.fn(),
			onRequestError,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 4000 );

		expect( onRequestError.mock.calls.map( ( call ) => call[ 0 ] ) ).toEqual( [
			'Service unavailable',
			'Internal server error',
		] );
	} );

	it( 'keeps polling when onRequestError throws', async () => {
		const fetchStatus = jest.fn().mockRejectedValue( new Error( 'Unavailable' ) );
		const onRequestError = jest.fn( () => {
			throw new Error( 'Logging blew up' );
		} );

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: jest.fn(),
			onFailed: jest.fn(),
			onRequestError,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 3000 );

		expect( fetchStatus.mock.calls.length ).toBeGreaterThan( 1 );
	} );

	it( 'stops polling when a callback throws instead of treating it as a request failure', async () => {
		const fetchStatus = jest.fn().mockResolvedValue( { build_status: 'live' } );
		const onReady = jest.fn( () => {
			throw new Error( 'Navigation blocked' );
		} );
		const onRequestError = jest.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady,
			onFailed: jest.fn(),
			onRequestError,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 5000 );

		expect( onReady ).toHaveBeenCalledTimes( 1 );
		expect( fetchStatus ).toHaveBeenCalledTimes( 1 );
		expect( onRequestError ).not.toHaveBeenCalled();
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

	it( 'reports every ui block to onUpdate, including the terminal one', async () => {
		const fetchStatus = jest
			.fn()
			.mockResolvedValueOnce( {
				build_status: '',
				ui: { state: 'generating', steps: [ { id: 'pages', label: 'Building', state: 'active' } ] },
			} )
			.mockResolvedValueOnce( {
				build_status: 'live',
				ui: { state: 'ready', is_terminal: true, steps: [] },
			} );
		const onUpdate = jest.fn();
		const onReady = jest.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady,
			onFailed: jest.fn(),
			onUpdate,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 1000 );

		expect( onUpdate ).toHaveBeenCalledTimes( 2 );
		expect( onUpdate.mock.calls[ 0 ][ 0 ].state ).toBe( 'generating' );
		expect( onReady ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'trusts the server ui verdict even without a raw build_status', async () => {
		const fetchStatus = jest.fn().mockResolvedValue( { ui: { state: 'failed', can_retry: true } } );
		const onFailed = jest.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: jest.fn(),
			onFailed,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 0 );

		expect( onFailed ).toHaveBeenCalledWith( 'failed:unknown', {
			state: 'failed',
			can_retry: true,
		} );
		await jest.advanceTimersByTimeAsync( 5000 );
		expect( fetchStatus ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'keeps working against a backend without the ui block', async () => {
		const fetchStatus = jest
			.fn()
			.mockResolvedValueOnce( { build_status: 'delivering' } )
			.mockResolvedValueOnce( { build_status: 'live' } );
		const onUpdate = jest.fn();
		const onReady = jest.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady,
			onFailed: jest.fn(),
			onUpdate,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 1000 );

		expect( onUpdate ).not.toHaveBeenCalled();
		expect( onReady ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'passes the failed ui block to onFailed', async () => {
		const failedUi = {
			state: 'failed',
			can_retry: true,
			label: 'We couldn’t finish building your site',
			detail: 'You can start the build again right away.',
		};
		const fetchStatus = jest
			.fn()
			.mockResolvedValue( { build_status: 'failed:generation_failed', ui: failedUi } );
		const onFailed = jest.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: jest.fn(),
			onFailed,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 0 );

		expect( onFailed ).toHaveBeenCalledWith( 'failed:generation_failed', failedUi );
	} );
} );

describe( 'pollForBuildWowStatus feed_seq forwarding', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'reports feed_seq to onFeedSeq, including on terminal responses', async () => {
		const fetchStatus = jest
			.fn()
			.mockResolvedValueOnce( { build_status: 'delivering', feed_seq: 7 } )
			.mockResolvedValueOnce( { build_status: 'failed:x', feed_seq: 9 } );
		const onFeedSeq = jest.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: jest.fn(),
			onFailed: jest.fn(),
			onFeedSeq,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 0 );
		expect( onFeedSeq ).toHaveBeenCalledWith( 7 );

		await jest.advanceTimersByTimeAsync( 1000 );
		expect( onFeedSeq ).toHaveBeenCalledWith( 9 );
	} );

	it( 'does not report an absent or zero feed_seq', async () => {
		const fetchStatus = jest
			.fn()
			.mockResolvedValueOnce( { build_status: 'delivering' } )
			.mockResolvedValueOnce( { build_status: 'delivering', feed_seq: 0 } )
			.mockResolvedValue( { build_status: 'live' } );
		const onFeedSeq = jest.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: jest.fn(),
			onFailed: jest.fn(),
			onFeedSeq,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 0 );
		await jest.advanceTimersByTimeAsync( 1000 );
		expect( onFeedSeq ).not.toHaveBeenCalled();
	} );
} );
