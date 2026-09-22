/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { ORCHESTRATOR_AGENT_URL } from '../../constants';
import { creditSnapshot } from '../../utils/__tests__/fixtures/credit-snapshot';
import { useCredits } from '../use-credits';
import type { CreditsStatus } from '../../utils/credits';
import type { TaskUpdate, UseAgentChatConfig } from '@automattic/agenttic-client';
import type { ReactElement } from 'react';

let mockIsProcessing = false;
let mockConfig: UseAgentChatConfig;
jest.mock(
	'@automattic/agenttic-client',
	() => ( {
		useAgentChat: ( config: UseAgentChatConfig ) => {
			mockConfig = config;
			return { isProcessing: mockIsProcessing };
		},
	} ),
	{ virtual: true }
);
jest.mock( '@wordpress/element', () => jest.requireActual( 'react' ) );
jest.mock( 'i18n-calypso', () => ( { getBrowserSafeLocale: () => 'en' } ) );
jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	sprintf: ( format: string, ...values: unknown[] ) => {
		let index = 0;
		return format
			.replace( /%(\d+\$)?[sd]/g, () => String( values[ index++ ] ) )
			.replace( /%%/g, '%' );
	},
} ) );
jest.mock( '../../components/credits-meter', () => () => null );

const authProvider = jest.fn();
const agentConfig: UseAgentChatConfig = {
	agentId: 'wp-orchestrator',
	agentUrl: ORCHESTRATOR_AGENT_URL,
	sessionId: '',
	authProvider,
};
const defaultOptions = { enabled: true, agentConfig, siteKey: '123', userId: 1, isOpen: true };
const terminal = (
	aiCredits?: unknown,
	state: 'completed' | 'failed' | 'canceled' = 'completed'
): TaskUpdate => ( {
	id: 'task',
	status: { state },
	final: true,
	text: '',
	...( aiCredits === undefined ? {} : { aiCredits } ),
} );
const flush = () =>
	act( async () => {
		await Promise.resolve();
	} );
const renderCredits = ( initial = {} ) =>
	renderHook( ( options ) => useCredits( options ), {
		initialProps: { ...defaultOptions, ...initial },
	} );
const props = ( value: ReturnType< typeof useCredits > ) =>
	(
		value.trailingActions as ReactElement< {
			status: CreditsStatus;
			isOpen: boolean;
			onToggle: ( open: boolean ) => void;
			onAction?: unknown;
			manageUrl?: string;
		} >
	 )?.props;
const exhausted = ( blocked = false ) =>
	creditSnapshot( { credits_used: 2500, credits_remaining: 0, exhausted: true, blocked } );
const receive = ( snapshot: unknown, state: 'completed' | 'failed' | 'canceled' = 'completed' ) =>
	act( async () => mockConfig.onTaskUpdate?.( terminal( snapshot, state ) ) );
const fetchMock = jest.fn();
const response = ( snapshot: unknown ) => ( {
	ok: true,
	json: async () => ( { ai_credits: snapshot } ),
} );
function deferred< T >() {
	let resolve!: ( value: T ) => void;
	let reject!: ( reason?: unknown ) => void;
	const promise = new Promise< T >( ( onResolve, onReject ) => {
		resolve = onResolve;
		reject = onReject;
	} );
	return { promise, resolve, reject };
}

beforeEach( () => {
	jest.useFakeTimers();
	jest.setSystemTime( new Date( '2026-09-21T12:00:00Z' ) );
	mockIsProcessing = false;
	window.history.replaceState( {}, '', '/' );
	fetchMock.mockReset().mockImplementation( () => new Promise( () => {} ) );
	authProvider.mockReset().mockResolvedValue( { Authorization: 'Bearer site-jwt' } );
	Object.defineProperty( document, 'visibilityState', { configurable: true, value: 'visible' } );
	globalThis.fetch = fetchMock;
} );
afterEach( () => {
	jest.useRealTimers();
} );

it( 'reads the authenticated balance on opening without sending a prompt', async () => {
	fetchMock.mockResolvedValueOnce( response( creditSnapshot() ) );
	const { result } = renderCredits();
	expect( result.current.trailingActions ).toBeUndefined();
	await flush();
	expect( fetchMock ).toHaveBeenCalledTimes( 1 );
	expect( fetchMock ).toHaveBeenCalledWith(
		'https://public-api.wordpress.com/wpcom/v2/sites/123/ai/credits',
		{
			method: 'GET',
			headers: { Authorization: 'Bearer site-jwt' },
			cache: 'no-store',
			signal: expect.any( AbortSignal ),
		}
	);
	expect( props( result.current ).status.remaining ).toBe( 2450 );
	expect( result.current.beforeSubmit() ).toBe( true );
	expect( authProvider ).toHaveBeenCalledTimes( 1 );
} );
it.each( [ 401, 403, 404, 503 ] )(
	'treats a %i read as unknown rather than zero',
	async ( status ) => {
		fetchMock.mockResolvedValueOnce( response( creditSnapshot() ) );
		const { result } = renderCredits();
		await flush();
		fetchMock.mockResolvedValueOnce( { ok: false, status } );
		act( () => window.dispatchEvent( new Event( 'focus' ) ) );
		await flush();
		expect( result.current.trailingActions ).toBeUndefined();
		expect( result.current.beforeSubmit() ).toBe( true );
	}
);
it.each( [
	null,
	undefined,
	{ broken: true },
	creditSnapshot( { blog_id: 456 } ),
	creditSnapshot( { credits_remaining: -1 } ),
	creditSnapshot( { resets_at: '2026-09-01T00:00:00Z' } ),
] )( 'rejects an invalid balance read %p', async ( snapshot ) => {
	fetchMock.mockResolvedValueOnce( response( snapshot ) );
	const { result } = renderCredits();
	await flush();
	expect( result.current.trailingActions ).toBeUndefined();
	expect( result.current.beforeSubmit() ).toBe( true );
} );
it( 'keeps auth and network failures unknown and recovers on a later refresh', async () => {
	authProvider.mockRejectedValueOnce( new Error( 'Expired credentials' ) );
	const { result } = renderCredits();
	await flush();
	expect( fetchMock ).not.toHaveBeenCalled();
	expect( result.current.trailingActions ).toBeUndefined();
	fetchMock.mockRejectedValueOnce( new Error( 'Offline' ) );
	act( () => window.dispatchEvent( new Event( 'online' ) ) );
	await flush();
	expect( result.current.trailingActions ).toBeUndefined();
	fetchMock.mockResolvedValueOnce( response( creditSnapshot() ) );
	act( () => window.dispatchEvent( new Event( 'online' ) ) );
	await flush();
	expect( props( result.current ).status.remaining ).toBe( 2450 );
} );
it( 'coalesces focus and visibility events while the opening read is pending', async () => {
	const { result } = renderCredits();
	act( () => {
		window.dispatchEvent( new Event( 'focus' ) );
		window.dispatchEvent( new Event( 'online' ) );
		document.dispatchEvent( new Event( 'visibilitychange' ) );
	} );
	await flush();
	expect( authProvider ).toHaveBeenCalledTimes( 1 );
	expect( fetchMock ).toHaveBeenCalledTimes( 1 );
	expect( result.current.trailingActions ).toBeUndefined();
} );
it( 'does not refetch a hidden tab or use an absent auth provider', async () => {
	fetchMock.mockResolvedValueOnce( response( creditSnapshot() ) );
	const view = renderCredits();
	await flush();
	Object.defineProperty( document, 'visibilityState', { value: 'hidden' } );
	act( () => {
		window.dispatchEvent( new Event( 'focus' ) );
		document.dispatchEvent( new Event( 'visibilitychange' ) );
	} );
	expect( fetchMock ).toHaveBeenCalledTimes( 1 );
	view.unmount();
	renderCredits( { agentConfig: { ...agentConfig, authProvider: undefined } } );
	await flush();
	expect( fetchMock ).toHaveBeenCalledTimes( 1 );
} );
it.each( [ { siteKey: '456' }, { userId: 2 }, { enabled: false } ] )(
	'ignores a previous read after changing scope %p',
	async ( next ) => {
		const read = deferred< ReturnType< typeof response > >();
		fetchMock.mockReturnValueOnce( read.promise );
		const view = renderCredits();
		await flush();
		const signal = fetchMock.mock.calls[ 0 ][ 1 ].signal;
		view.rerender( { ...defaultOptions, ...next } );
		expect( signal.aborted ).toBe( true );
		read.resolve( response( exhausted() ) );
		await flush();
		expect( view.result.current.trailingActions ).toBeUndefined();
		expect( view.result.current.beforeSubmit() ).toBe( true );
	}
);
it( 'ignores an old read after navigating A to B to A', async () => {
	const oldRead = deferred< ReturnType< typeof response > >();
	fetchMock.mockReturnValueOnce( oldRead.promise );
	const view = renderCredits();
	await flush();
	fetchMock.mockResolvedValueOnce( response( creditSnapshot( { blog_id: 456 } ) ) );
	view.rerender( { ...defaultOptions, siteKey: '456' } );
	await flush();
	fetchMock.mockResolvedValueOnce( response( creditSnapshot() ) );
	view.rerender( defaultOptions );
	await flush();
	oldRead.resolve( response( exhausted() ) );
	await flush();
	expect( props( view.result.current ).status.remaining ).toBe( 2450 );
} );
it( 'does not start a read after authentication finishes for an unmounted chat', async () => {
	const auth = deferred< Record< string, string > >();
	authProvider.mockReturnValueOnce( auth.promise );
	const view = renderCredits();
	view.unmount();
	auth.resolve( { Authorization: 'Bearer old-user-token' } );
	await flush();
	expect( fetchMock ).not.toHaveBeenCalled();
} );
it.each( [ 'success', 'failure' ] )(
	'a late GET %s cannot overwrite newer terminal metadata',
	async ( outcome ) => {
		const read = deferred< ReturnType< typeof response > >();
		fetchMock.mockReturnValueOnce( read.promise );
		const { result } = renderCredits();
		await flush();
		await receive( exhausted() );
		if ( outcome === 'success' ) {
			read.resolve( response( creditSnapshot() ) );
		} else {
			read.reject( new Error( 'Late network error' ) );
		}
		await flush();
		expect( props( result.current ).status.remaining ).toBe( 0 );
	}
);
it( 'uses the terminal balance and avoids reads while an Agent task is running', async () => {
	const view = renderCredits();
	await flush();
	const signal = fetchMock.mock.calls[ 0 ][ 1 ].signal;
	mockIsProcessing = true;
	view.rerender( defaultOptions );
	expect( signal.aborted ).toBe( true );
	act( () => window.dispatchEvent( new Event( 'focus' ) ) );
	await flush();
	expect( fetchMock ).toHaveBeenCalledTimes( 1 );
	await receive( creditSnapshot() );
	mockIsProcessing = false;
	view.rerender( defaultOptions );
	await flush();
	expect( props( view.result.current ).status.remaining ).toBe( 2450 );
	expect( fetchMock ).toHaveBeenCalledTimes( 1 );
} );
it.each( [ 'no update', 'missing metadata', 'invalid metadata' ] )(
	'reads again when a task ends with %s',
	async ( outcome ) => {
		const view = renderCredits();
		await flush();
		mockIsProcessing = true;
		view.rerender( defaultOptions );
		if ( outcome !== 'no update' ) {
			await receive( outcome === 'missing metadata' ? undefined : { broken: true } );
		}
		fetchMock.mockResolvedValueOnce( response( creditSnapshot() ) );
		mockIsProcessing = false;
		view.rerender( defaultOptions );
		await flush();
		expect( props( view.result.current ).status.remaining ).toBe( 2450 );
		expect( fetchMock ).toHaveBeenCalledTimes( 2 );
	}
);
it( 'feeds the existing interactive meter one real plan pool without fabricated actions', async () => {
	const { result } = renderCredits();
	await receive( creditSnapshot() );
	expect( props( result.current ).status ).toMatchObject( {
		plan: 'paid',
		percent: 98,
		remaining: 2450,
		pools: [ { id: 'plan', remaining: 2450, total: 2500, dateLabel: 'Resets Oct 1 (UTC)' } ],
	} );
	expect( props( result.current ).status.pools ).toHaveLength( 1 );
	expect( props( result.current ).onAction ).toBeUndefined();
	expect( props( result.current ).manageUrl ).toBeUndefined();
	act( () => props( result.current ).onToggle( true ) );
	expect( props( result.current ).isOpen ).toBe( true );
	expect( result.current.notice ).toBeUndefined();
} );
it.each( [ false, true ] )(
	'gates exact exhaustion and opens existing details (blocked=%s)',
	async ( blocked ) => {
		const { result } = renderCredits();
		await receive( creditSnapshot( { credits_used: 2499, credits_remaining: 1 } ) );
		expect( props( result.current ).status.percent ).toBeGreaterThan( 0 );
		expect( result.current.beforeSubmit() ).toBe( true );
		await receive( exhausted( blocked ), blocked ? 'failed' : 'completed' );
		act( () => {
			expect( result.current.beforeSubmit() ).toBe( false );
		} );
		expect( props( result.current ).isOpen ).toBe( true );
		expect( props( result.current ).status.remaining ).toBe( 0 );
		expect( result.current.notice ).toBeUndefined();
	}
);
it.each( [ null, undefined, false, { broken: true }, creditSnapshot( { blog_id: 456 } ) ] )(
	'invalidates prior balance on unreadable, absent, invalid or wrong-site status %p',
	async ( snapshot ) => {
		const { result } = renderCredits();
		await receive( exhausted() );
		await receive( snapshot, 'failed' );
		expect( result.current.trailingActions ).toBeUndefined();
		expect( result.current.beforeSubmit() ).toBe( true );
	}
);
it( 'does not use query overrides while live balance is unknown, failed, or known', async () => {
	window.history.replaceState( {}, '', '/?am_credits=0&am_plan=free' );
	const { result } = renderCredits();
	expect( result.current.beforeSubmit() ).toBe( true );
	await receive( false, 'failed' );
	expect( result.current.trailingActions ).toBeUndefined();
	await receive( creditSnapshot() );
	expect( props( result.current ).status.percent ).toBe( 98 );
	expect( result.current.beforeSubmit() ).toBe( true );
} );
it.each( [
	{ enabled: false },
	{ siteKey: 'no-site' },
	{ agentConfig: { ...agentConfig, agentId: 'reader-chat' } },
	{ agentConfig: { ...agentConfig, agentUrl: 'https://legacy.example/agent' } },
] )( 'ignores live metadata on unsupported surfaces %p', async ( options ) => {
	const { result } = renderCredits( options );
	await receive( creditSnapshot() );
	expect( result.current.trailingActions ).toBeUndefined();
	expect( result.current.beforeSubmit() ).toBe( true );
	expect( authProvider ).not.toHaveBeenCalled();
	expect( fetchMock ).not.toHaveBeenCalled();
} );
it( 'rejects stale callbacks across A to B to A, user and agent changes', async () => {
	const view = renderCredits();
	const oldObserver = mockConfig.onTaskUpdate;
	await receive( creditSnapshot() );
	view.rerender( { ...defaultOptions, siteKey: '456' } );
	expect( view.result.current.trailingActions ).toBeUndefined();
	view.rerender( defaultOptions );
	await act( async () => oldObserver?.( terminal( exhausted() ) ) );
	expect( view.result.current.trailingActions ).toBeUndefined();
	await receive( creditSnapshot() );
	const beforeUserSwitch = mockConfig.onTaskUpdate;
	view.rerender( { ...defaultOptions, userId: 2 } );
	await act( async () => beforeUserSwitch?.( terminal( exhausted() ) ) );
	expect( view.result.current.trailingActions ).toBeUndefined();
	view.rerender( { ...defaultOptions, agentConfig: { ...agentConfig, agentId: 'reader-chat' } } );
	await act( async () => beforeUserSwitch?.( terminal( exhausted() ) ) );
	expect( view.result.current.trailingActions ).toBeUndefined();
} );
it.each( [ 'completed', 'failed', 'canceled' ] as const )(
	'keeps valid %s terminal amounts without a simulated debit',
	async ( state ) => {
		const view = renderCredits();
		mockIsProcessing = true;
		view.rerender( defaultOptions );
		await receive( creditSnapshot(), state );
		mockIsProcessing = false;
		view.rerender( defaultOptions );
		expect( props( view.result.current ).status.remaining ).toBe( 2450 );
		expect( props( view.result.current ).status.percent ).toBe( 98 );
	}
);
it( 'clears old amounts after cancellation/error without terminal metadata, including intermediate completions', async () => {
	const view = renderCredits();
	await receive( creditSnapshot() );
	mockIsProcessing = true;
	view.rerender( defaultOptions );
	await act( async () =>
		mockConfig.onTaskUpdate?.( { ...terminal( exhausted() ), final: false } )
	);
	mockIsProcessing = false;
	view.rerender( defaultOptions );
	expect( view.result.current.trailingActions ).toBeUndefined();
	expect( view.result.current.beforeSubmit() ).toBe( true );
	expect( fetchMock ).not.toHaveBeenCalled();
} );
it.each( [ 'focus', 'online', 'visibilitychange' ] )(
	'keeps the ring and its open popover visible during a %s refresh',
	async ( event ) => {
		const read = deferred< ReturnType< typeof response > >();
		fetchMock
			.mockResolvedValueOnce( response( creditSnapshot() ) )
			.mockReturnValueOnce( read.promise );
		const { result } = renderCredits();
		await flush();
		// Clicking the ring can focus the sidebar's window before opening the popover.
		act( () => {
			( event === 'visibilitychange' ? document : window ).dispatchEvent( new Event( event ) );
			props( result.current ).onToggle( true );
		} );
		await flush();
		expect( props( result.current ).status.remaining ).toBe( 2450 );
		expect( props( result.current ).isOpen ).toBe( true );
		expect( fetchMock ).toHaveBeenCalledTimes( 2 );
		read.resolve( response( creditSnapshot( { credits_used: 100, credits_remaining: 2400 } ) ) );
		await flush();
		expect( props( result.current ).status.remaining ).toBe( 2400 );
		expect( props( result.current ).isOpen ).toBe( true );
	}
);
it( 'keeps a known zero gated until a refresh confirms restored credits', async () => {
	const read = deferred< ReturnType< typeof response > >();
	fetchMock.mockResolvedValueOnce( response( exhausted() ) ).mockReturnValueOnce( read.promise );
	const { result } = renderCredits();
	await flush();
	act( () => window.dispatchEvent( new Event( 'focus' ) ) );
	await flush();
	act( () => expect( result.current.beforeSubmit() ).toBe( false ) );
	expect( props( result.current ).status.remaining ).toBe( 0 );
	read.resolve( response( creditSnapshot() ) );
	await flush();
	expect( result.current.beforeSubmit() ).toBe( true );
} );
it( 'waits while closed, reads on opening, and refreshes on reopen and a fresh mount', async () => {
	fetchMock.mockResolvedValue( response( creditSnapshot() ) );
	const view = renderCredits( { isOpen: false } );
	await flush();
	expect( fetchMock ).not.toHaveBeenCalled();
	view.rerender( defaultOptions );
	await flush();
	expect( props( view.result.current ).status.remaining ).toBe( 2450 );
	view.rerender( { ...defaultOptions, isOpen: false } );
	act( () => window.dispatchEvent( new Event( 'focus' ) ) );
	expect( fetchMock ).toHaveBeenCalledTimes( 1 );
	view.rerender( defaultOptions );
	await flush();
	expect( fetchMock ).toHaveBeenCalledTimes( 2 );
	view.unmount();
	const fresh = renderCredits();
	await flush();
	expect( props( fresh.result.current ).status.remaining ).toBe( 2450 );
	expect( fetchMock ).toHaveBeenCalledTimes( 3 );
} );
it( 'expires the old balance and reads the next period without sending a prompt', async () => {
	fetchMock.mockResolvedValueOnce(
		response( creditSnapshot( { ...exhausted(), resets_at: '2026-09-21T12:00:01Z' } ) )
	);
	const { result } = renderCredits();
	await flush();
	act( () => expect( result.current.beforeSubmit() ).toBe( false ) );
	fetchMock.mockResolvedValueOnce( response( creditSnapshot() ) );
	await act( async () => jest.advanceTimersByTime( 1000 ) );
	expect( props( result.current ).status.remaining ).toBe( 2450 );
	expect( result.current.beforeSubmit() ).toBe( true );
	expect( fetchMock ).toHaveBeenCalledTimes( 2 );
	await receive( exhausted() );
	jest.setSystemTime( new Date( '2026-10-01T00:00:00Z' ) );
	// Timers can be throttled in a hidden tab; the submit gate also checks expiry.
	act( () => expect( result.current.beforeSubmit() ).toBe( true ) );
	expect( result.current.trailingActions ).toBeUndefined();
} );
it( 'rejects late expired snapshots and forwards provider errors unchanged', async () => {
	const error = new Error( 'provider observer failed' );
	const onTaskUpdate = jest.fn().mockRejectedValue( error );
	const { result } = renderCredits( { agentConfig: { ...agentConfig, onTaskUpdate } } );
	await act( async () => {
		await expect(
			mockConfig.onTaskUpdate?.(
				terminal( creditSnapshot( { resets_at: '2026-09-01T00:00:00Z' } ) )
			)
		).rejects.toBe( error );
	} );
	expect( result.current.trailingActions ).toBeUndefined();
	expect( result.current.beforeSubmit() ).toBe( true );
} );

it.each( [
	{ ...agentConfig, agentId: 'legacy-agent' },
	{ ...agentConfig, agentUrl: 'https://legacy.example/agent' },
] )(
	'never gates a real site with query mocks when its agent is outside the live allowance scope',
	async ( config ) => {
		window.history.replaceState( {}, '', '/?am_credits=0&am_plan=free' );
		const view = renderCredits( { agentConfig: config } );
		mockIsProcessing = true;
		view.rerender( { ...defaultOptions, agentConfig: config } );
		mockIsProcessing = false;
		view.rerender( { ...defaultOptions, agentConfig: config } );
		expect( view.result.current.trailingActions ).toBeUndefined();
		expect( view.result.current.notice ).toBeUndefined();
		expect( view.result.current.beforeSubmit() ).toBe( true );
	}
);
