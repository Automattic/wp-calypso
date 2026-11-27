/**
 * @vitest-environment jsdom
 */

import { vi } from 'vitest';
import { pollForBuildWowStatus } from '../build-status-poller';

describe( 'pollForBuildWowStatus', () => {
	beforeEach( () => {
		vi.useFakeTimers();
	} );

	afterEach( () => {
		vi.useRealTimers();
	} );

	it( 'calls onReady with the live response once the status is live', async () => {
		const liveResponse = {
			build_status: 'live',
			site_editor_url:
				'https://example.wordpress.com/wp-admin/site-editor.php?easy-mode=true&p=%2Fpage%2F12&canvas=edit',
		};
		const fetchStatus = vi
			.fn()
			.mockResolvedValueOnce( { build_status: 'delivering' } )
			.mockResolvedValueOnce( liveResponse );
		const onReady = vi.fn();
		const onFailed = vi.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady,
			onFailed,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await vi.advanceTimersByTimeAsync( 0 );
		expect( onReady ).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync( 1000 );
		expect( onReady ).toHaveBeenCalledTimes( 1 );
		// The consumer reads site_editor_url off this: the live route is only
		// known once the build has verified the generated front page.
		expect( onReady ).toHaveBeenCalledWith( liveResponse );
		expect( onFailed ).not.toHaveBeenCalled();
	} );

	it( 'calls onFailed and stops polling on a failed status', async () => {
		const fetchStatus = vi
			.fn()
			.mockResolvedValue( { build_status: 'failed:build_wow_theme_activation_failed' } );
		const onReady = vi.fn();
		const onFailed = vi.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady,
			onFailed,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await vi.advanceTimersByTimeAsync( 0 );
		expect( onFailed ).toHaveBeenCalledWith(
			'failed:build_wow_theme_activation_failed',
			undefined
		);
		expect( onReady ).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync( 5000 );
		expect( fetchStatus ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'keeps polling while the status is missing or still in progress', async () => {
		const fetchStatus = vi
			.fn()
			.mockResolvedValueOnce( {} )
			.mockResolvedValueOnce( { build_status: 'activating' } )
			.mockResolvedValueOnce( { build_status: 'live' } );
		const onReady = vi.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady,
			onFailed: vi.fn(),
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await vi.advanceTimersByTimeAsync( 2000 );
		expect( onReady ).toHaveBeenCalledTimes( 1 );
		expect( fetchStatus ).toHaveBeenCalledTimes( 3 );
	} );

	it( 'ignores a non-string status instead of throwing', async () => {
		const fetchStatus = vi
			.fn()
			.mockResolvedValueOnce( { build_status: 1 } )
			.mockResolvedValueOnce( { build_status: 'live' } );
		const onReady = vi.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady,
			onFailed: vi.fn(),
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await vi.advanceTimersByTimeAsync( 0 );
		expect( onReady ).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync( 1000 );
		expect( onReady ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'continues polling after a temporary request failure', async () => {
		const fetchStatus = vi
			.fn()
			.mockRejectedValueOnce( new Error( 'Unavailable' ) )
			.mockResolvedValueOnce( { build_status: 'live' } );
		const onReady = vi.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady,
			onFailed: vi.fn(),
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await vi.advanceTimersByTimeAsync( 1000 );
		expect( onReady ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'reports an identical repeating request error only once', async () => {
		const fetchStatus = vi.fn().mockRejectedValue( new Error( 'Unavailable' ) );
		const onRequestError = vi.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: vi.fn(),
			onFailed: vi.fn(),
			onRequestError,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await vi.advanceTimersByTimeAsync( 3000 );

		expect( fetchStatus ).toHaveBeenCalledTimes( 4 );
		expect( onRequestError ).toHaveBeenCalledTimes( 1 );
		expect( onRequestError.mock.calls[ 0 ][ 0 ] ).toBe( 'Unavailable' );
	} );

	it( 'does not re-report when requests flap between success and failure', async () => {
		const fetchStatus = vi
			.fn()
			.mockRejectedValueOnce( new Error( 'Unavailable' ) )
			.mockResolvedValueOnce( { build_status: 'delivering' } )
			.mockRejectedValueOnce( new Error( 'Unavailable' ) )
			.mockResolvedValue( { build_status: 'delivering' } );
		const onRequestError = vi.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: vi.fn(),
			onFailed: vi.fn(),
			onRequestError,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await vi.advanceTimersByTimeAsync( 4000 );

		expect( onRequestError ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not report the abort caused by its own teardown', async () => {
		const fetchStatus = vi.fn(
			( _siteIdentifier: string, signal: AbortSignal ) =>
				new Promise< { build_status?: string } >( ( _resolve, reject ) => {
					// The proxy transport rejects with the abort Event, not an Error.
					signal.addEventListener( 'abort', ( event ) => reject( event ) );
				} )
		);
		const onRequestError = vi.fn();

		const stop = pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: vi.fn(),
			onFailed: vi.fn(),
			onRequestError,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await vi.advanceTimersByTimeAsync( 0 );
		stop();
		await vi.advanceTimersByTimeAsync( 1000 );

		expect( onRequestError ).not.toHaveBeenCalled();
	} );

	it( 'reports a request timeout as a readable reason, not "[object Event]"', async () => {
		const fetchStatus = vi.fn(
			( _siteIdentifier: string, signal: AbortSignal ) =>
				new Promise< { build_status?: string } >( ( _resolve, reject ) => {
					signal.addEventListener( 'abort', ( event ) => reject( event ) );
				} )
		);
		const onRequestError = vi.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: vi.fn(),
			onFailed: vi.fn(),
			onRequestError,
			pollIntervalMs: 1000,
			requestTimeoutMs: 500,
			fetchStatus,
		} );

		await vi.advanceTimersByTimeAsync( 600 );

		expect( onRequestError ).toHaveBeenCalledTimes( 1 );
		expect( onRequestError.mock.calls[ 0 ][ 0 ] ).toBe( 'request timed out after 500ms' );
	} );

	it( 'reports a later distinct error rather than hiding it behind the first', async () => {
		const fetchStatus = vi
			.fn()
			.mockRejectedValueOnce( new Error( 'Service unavailable' ) )
			.mockRejectedValueOnce( new Error( 'Service unavailable' ) )
			.mockRejectedValue( new Error( 'Internal server error' ) );
		const onRequestError = vi.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: vi.fn(),
			onFailed: vi.fn(),
			onRequestError,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await vi.advanceTimersByTimeAsync( 4000 );

		expect( onRequestError.mock.calls.map( ( call ) => call[ 0 ] ) ).toEqual( [
			'Service unavailable',
			'Internal server error',
		] );
	} );

	it( 'keeps polling when onRequestError throws', async () => {
		const fetchStatus = vi.fn().mockRejectedValue( new Error( 'Unavailable' ) );
		const onRequestError = vi.fn( () => {
			throw new Error( 'Logging blew up' );
		} );

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: vi.fn(),
			onFailed: vi.fn(),
			onRequestError,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await vi.advanceTimersByTimeAsync( 3000 );

		expect( fetchStatus.mock.calls.length ).toBeGreaterThan( 1 );
	} );

	it( 'stops polling when a callback throws instead of treating it as a request failure', async () => {
		const fetchStatus = vi.fn().mockResolvedValue( { build_status: 'live' } );
		const onReady = vi.fn( () => {
			throw new Error( 'Navigation blocked' );
		} );
		const onRequestError = vi.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady,
			onFailed: vi.fn(),
			onRequestError,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await vi.advanceTimersByTimeAsync( 5000 );

		expect( onReady ).toHaveBeenCalledTimes( 1 );
		expect( fetchStatus ).toHaveBeenCalledTimes( 1 );
		expect( onRequestError ).not.toHaveBeenCalled();
	} );

	it( 'aborts a status request that does not settle', async () => {
		const fetchStatus = vi
			.fn()
			.mockImplementationOnce(
				( _siteIdentifier: string, signal: AbortSignal ) =>
					new Promise< { build_status?: string } >( ( _resolve, reject ) => {
						signal.addEventListener( 'abort', () => reject( new Error( 'Aborted' ) ) );
					} )
			)
			.mockResolvedValueOnce( { build_status: 'live' } );
		const onReady = vi.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady,
			onFailed: vi.fn(),
			pollIntervalMs: 1000,
			requestTimeoutMs: 500,
			fetchStatus,
		} );

		await vi.advanceTimersByTimeAsync( 1500 );
		expect( onReady ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'stops polling and aborts the current request when cancelled', async () => {
		const fetchStatus = vi.fn().mockResolvedValue( {} );
		const stop = pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: vi.fn(),
			onFailed: vi.fn(),
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await vi.advanceTimersByTimeAsync( 0 );
		stop();
		await vi.advanceTimersByTimeAsync( 5000 );

		expect( fetchStatus ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'reports every ui block to onUpdate, including the terminal one', async () => {
		const fetchStatus = vi
			.fn()
			.mockResolvedValueOnce( {
				build_status: '',
				ui: { state: 'generating', steps: [ { id: 'pages', label: 'Building', state: 'active' } ] },
			} )
			.mockResolvedValueOnce( {
				build_status: 'live',
				ui: { state: 'ready', is_terminal: true, steps: [] },
			} );
		const onUpdate = vi.fn();
		const onReady = vi.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady,
			onFailed: vi.fn(),
			onUpdate,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await vi.advanceTimersByTimeAsync( 1000 );

		expect( onUpdate ).toHaveBeenCalledTimes( 2 );
		expect( onUpdate.mock.calls[ 0 ][ 0 ].state ).toBe( 'generating' );
		expect( onReady ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'trusts the server ui verdict even without a raw build_status', async () => {
		const fetchStatus = vi.fn().mockResolvedValue( { ui: { state: 'failed', can_retry: true } } );
		const onFailed = vi.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: vi.fn(),
			onFailed,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await vi.advanceTimersByTimeAsync( 0 );

		expect( onFailed ).toHaveBeenCalledWith( 'failed:unknown', {
			state: 'failed',
			can_retry: true,
		} );
		await vi.advanceTimersByTimeAsync( 5000 );
		expect( fetchStatus ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'keeps working against a backend without the ui block', async () => {
		const fetchStatus = vi
			.fn()
			.mockResolvedValueOnce( { build_status: 'delivering' } )
			.mockResolvedValueOnce( { build_status: 'live' } );
		const onUpdate = vi.fn();
		const onReady = vi.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady,
			onFailed: vi.fn(),
			onUpdate,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await vi.advanceTimersByTimeAsync( 1000 );

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
		const fetchStatus = vi
			.fn()
			.mockResolvedValue( { build_status: 'failed:generation_failed', ui: failedUi } );
		const onFailed = vi.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: vi.fn(),
			onFailed,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await vi.advanceTimersByTimeAsync( 0 );

		expect( onFailed ).toHaveBeenCalledWith( 'failed:generation_failed', failedUi );
	} );
} );
