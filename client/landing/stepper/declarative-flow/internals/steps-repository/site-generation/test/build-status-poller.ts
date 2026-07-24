/**
 * @jest-environment jsdom
 */

import { getStepIndexForStatus, pollForBuildWowStatus } from '../build-status-poller';

describe( 'getStepIndexForStatus', () => {
	// The shipping step list has five entries (see site-generation/index.tsx), which
	// is the arity that matters and the one a three-step fixture cannot exercise —
	// at three, the tail offset is zero and every mapping looks like identity.
	it( 'maps the delivery walk onto the last three of the five shipping steps', () => {
		expect( getStepIndexForStatus( 'delivering', 5 ) ).toBe( 2 );
		expect( getStepIndexForStatus( 'activating', 5 ) ).toBe( 3 );
		expect( getStepIndexForStatus( 'verifying', 5 ) ).toBe( 4 );
	} );

	it( 'returns null for a status outside the known walk', () => {
		expect( getStepIndexForStatus( 'live', 5 ) ).toBeNull();
		expect( getStepIndexForStatus( 'failed:whatever', 5 ) ).toBeNull();
		expect( getStepIndexForStatus( '', 5 ) ).toBeNull();
	} );

	it( 'stays in range for step lists shorter than the delivery walk', () => {
		expect( getStepIndexForStatus( 'delivering', 3 ) ).toBe( 0 );
		expect( getStepIndexForStatus( 'verifying', 3 ) ).toBe( 2 );
		expect( getStepIndexForStatus( 'verifying', 2 ) ).toBe( 1 );
		expect( getStepIndexForStatus( 'verifying', 1 ) ).toBe( 0 );
		expect( getStepIndexForStatus( 'delivering', 0 ) ).toBeNull();
	} );
} );

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

	it( 'ignores a non-string status instead of throwing', async () => {
		const fetchStatus = jest
			.fn()
			.mockResolvedValueOnce( { build_status: 1 } )
			.mockResolvedValueOnce( { build_status: 'live' } );
		const onReady = jest.fn();
		const onProgress = jest.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady,
			onFailed: jest.fn(),
			onProgress,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 0 );
		expect( onProgress ).not.toHaveBeenCalled();

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

	it( 'reports the real error when the deadline passed but the request was never aborted', async () => {
		// Transports that ignore the signal (wpcom-xhr-request) run the request to its
		// real conclusion, so the deadline having passed must not overwrite the cause.
		const fetchStatus = jest.fn(
			() =>
				new Promise< { build_status?: string } >( ( _resolve, reject ) => {
					setTimeout(
						() => reject( Object.assign( new Error( 'Bad gateway' ), { status: 502 } ) ),
						900
					);
				} )
		);
		const onRequestError = jest.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: jest.fn(),
			onFailed: jest.fn(),
			onRequestError,
			pollIntervalMs: 5000,
			requestTimeoutMs: 500,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 1000 );

		expect( onRequestError ).toHaveBeenCalledWith( '502 Bad gateway' );
	} );

	it( 'keeps distinct HTTP statuses apart even when they share a message', async () => {
		const fetchStatus = jest
			.fn()
			.mockRejectedValueOnce( Object.assign( new Error( 'Unauthorized.' ), { status: 401 } ) )
			.mockRejectedValue( Object.assign( new Error( 'Unauthorized.' ), { status: 403 } ) );
		const onRequestError = jest.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: jest.fn(),
			onFailed: jest.fn(),
			onRequestError,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 2000 );

		expect( onRequestError.mock.calls.map( ( call ) => call[ 0 ] ) ).toEqual( [
			'401 Unauthorized.',
			'403 Unauthorized.',
		] );
	} );

	it( 'describes a rejection that is not an Error', async () => {
		const fetchStatus = jest.fn().mockRejectedValue( { message: 'gateway exploded' } );
		const onRequestError = jest.fn();

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: jest.fn(),
			onFailed: jest.fn(),
			onRequestError,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 0 );

		expect( onRequestError ).toHaveBeenCalledWith( 'gateway exploded' );
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

	it( 'keeps polling when onProgress throws', async () => {
		const fetchStatus = jest.fn().mockResolvedValue( { build_status: 'delivering' } );
		const onProgress = jest.fn( () => {
			throw new Error( 'Render blew up' );
		} );

		pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: jest.fn(),
			onFailed: jest.fn(),
			onProgress,
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 3000 );

		expect( onProgress.mock.calls.length ).toBeGreaterThan( 1 );
		expect( fetchStatus.mock.calls.length ).toBeGreaterThan( 1 );
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

	it( 'stops scheduling further polls when cancelled between requests', async () => {
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

	it( 'aborts the request that is still in flight when cancelled', async () => {
		let capturedSignal: AbortSignal | undefined;
		const fetchStatus = jest.fn( ( _siteIdentifier: string, signal: AbortSignal ) => {
			capturedSignal = signal;
			return new Promise< { build_status?: string } >( () => {} );
		} );

		const stop = pollForBuildWowStatus( {
			siteIdentifier: '123',
			onReady: jest.fn(),
			onFailed: jest.fn(),
			pollIntervalMs: 1000,
			fetchStatus,
		} );

		await jest.advanceTimersByTimeAsync( 0 );
		expect( capturedSignal?.aborted ).toBe( false );

		stop();

		expect( capturedSignal?.aborted ).toBe( true );
	} );
} );
