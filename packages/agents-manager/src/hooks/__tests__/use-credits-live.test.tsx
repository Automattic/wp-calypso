/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { ORCHESTRATOR_AGENT_URL } from '../../constants';
import { creditSnapshot } from '../../utils/__tests__/fixtures/credit-snapshot';
import { useCredits } from '../use-credits';
import type { AgentConfig } from '../../utils/create-agent-config';
import type { CreditsStatus } from '../../utils/credits';
import type { TaskUpdate, UseAgentChatConfig } from '@automattic/agenttic-client';
import type { AgentsManagerSite } from '@automattic/data-stores';
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
const agentConfig: AgentConfig = {
	authenticationScope: { siteId: 123, userId: 1 },
	agentId: 'wp-orchestrator',
	agentUrl: ORCHESTRATOR_AGENT_URL,
	sessionId: '',
	authProvider,
};
const site = { ID: 123, domain: 'example.wordpress.com' };
const defaultOptions = {
	enabled: true,
	agentConfig,
	siteKey: '123',
	site: site as AgentsManagerSite | null | undefined,
	userId: 1,
	isOpen: true,
};
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
			upgradeUrl?: string;
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

it.each( [ 'personal', 'premium', 'business' ] as const )(
	'offers the selected-site plans flow for %s through GET and terminal updates',
	async ( plan_tier ) => {
		fetchMock.mockResolvedValueOnce( response( creditSnapshot( { plan_tier } ) ) );
		const { result } = renderCredits();
		await flush();
		expect( props( result.current ).upgradeUrl ).toBe(
			'https://wordpress.com/plans/example.wordpress.com'
		);
		expect( props( result.current ).onAction ).toBeUndefined();
		await receive( { ...exhausted(), plan_tier } );
		expect( props( result.current ).upgradeUrl ).toBe(
			'https://wordpress.com/plans/example.wordpress.com'
		);
		act( () => expect( result.current.beforeSubmit() ).toBe( false ) );
	}
);
it.each( [ 'commerce', undefined, null, 'unsupported' ] )(
	'keeps the balance without an upgrade or fabricated guidance for tier %p',
	async ( plan_tier ) => {
		const { result } = renderCredits();
		await receive( { ...creditSnapshot(), plan_tier } );
		expect( props( result.current ).status.remaining ).toBe( 2450 );
		expect( props( result.current ).upgradeUrl ).toBeUndefined();
		expect( props( result.current ).onAction ).toBeUndefined();
		expect( result.current.notice ).toBeUndefined();
	}
);
it( 'waits for matching site data and follows a domain change for the same site', async () => {
	const view = renderCredits( { site: undefined } );
	await receive( creditSnapshot( { plan_tier: 'personal' } ) );
	expect( props( view.result.current ).upgradeUrl ).toBeUndefined();
	view.rerender( { ...defaultOptions, site: { ID: 456, domain: 'other.wordpress.com' } } );
	expect( props( view.result.current ).upgradeUrl ).toBeUndefined();
	view.rerender( defaultOptions );
	expect( props( view.result.current ).upgradeUrl ).toBe(
		'https://wordpress.com/plans/example.wordpress.com'
	);
	view.rerender( { ...defaultOptions, site: { ID: '123', domain: 'mapped.example::blog' } } );
	expect( props( view.result.current ).upgradeUrl ).toBe(
		'https://wordpress.com/plans/mapped.example%3A%3Ablog'
	);
} );
it.each( [ '', '.', '..', ' ' ] )(
	'omits the destination for an invalid site slug %p',
	async ( domain ) => {
		const { result } = renderCredits( { site: { ...site, domain } } );
		await receive( creditSnapshot( { plan_tier: 'personal' } ) );
		expect( props( result.current ).upgradeUrl ).toBeUndefined();
		expect( props( result.current ).status.remaining ).toBe( 2450 );
	}
);
it( 'never uses a previous site destination during a site switch', async () => {
	const view = renderCredits();
	await receive( creditSnapshot( { plan_tier: 'personal' } ) );
	const oldObserver = mockConfig.onTaskUpdate;
	const next = {
		...defaultOptions,
		siteKey: '456',
		agentConfig: { ...agentConfig, authenticationScope: { siteId: 456, userId: 1 } },
	};
	view.rerender( next );
	expect( view.result.current.trailingActions ).toBeUndefined();
	await receive( creditSnapshot( { blog_id: 456, plan_tier: 'premium' } ) );
	expect( props( view.result.current ).upgradeUrl ).toBeUndefined();
	view.rerender( { ...next, site: { ID: 456, domain: 'second.wordpress.com' } } );
	await act( async () => oldObserver?.( terminal( creditSnapshot( { plan_tier: 'commerce' } ) ) ) );
	expect( props( view.result.current ).upgradeUrl ).toBe(
		'https://wordpress.com/plans/second.wordpress.com'
	);
} );
it.each( [ { userId: 2 }, { agentConfig: { ...agentConfig, authProvider: jest.fn() } } ] )(
	'drops the upgrade action when the authenticated visit changes: %p',
	async ( next ) => {
		const view = renderCredits();
		await receive( creditSnapshot( { plan_tier: 'personal' } ) );
		expect( props( view.result.current ).upgradeUrl ).toBeDefined();
		view.rerender( { ...defaultOptions, ...next } );
		expect( view.result.current.trailingActions ).toBeUndefined();
	}
);
it( 'refreshes an upgraded balance on return focus and removes the action at Commerce', async () => {
	fetchMock.mockResolvedValueOnce(
		response( creditSnapshot( { ...exhausted(), plan_tier: 'personal' } ) )
	);
	const { result } = renderCredits();
	await flush();
	expect( props( result.current ).upgradeUrl ).toBeDefined();
	fetchMock.mockResolvedValueOnce(
		response(
			creditSnapshot( {
				plan_tier: 'business',
				credits_limit: 15000,
				credits_remaining: 14950,
			} )
		)
	);
	act( () => window.dispatchEvent( new Event( 'focus' ) ) );
	await flush();
	expect( props( result.current ).status ).toMatchObject( {
		planTier: 'business',
		remaining: 14950,
	} );
	expect( props( result.current ).upgradeUrl ).toBeDefined();
	expect( result.current.beforeSubmit() ).toBe( true );
	await receive( creditSnapshot( { plan_tier: 'commerce' } ) );
	expect( props( result.current ).upgradeUrl ).toBeUndefined();
	expect( props( result.current ).status.remaining ).toBe( 2450 );
} );

it( 'reads the authenticated balance on opening without sending a prompt', async () => {
	fetchMock.mockResolvedValueOnce( response( creditSnapshot( { plan_tier: 'personal' } ) ) );
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
	expect( props( result.current ).status.planTier ).toBe( 'personal' );
	expect( result.current.beforeSubmit() ).toBe( true );
	expect( authProvider ).toHaveBeenCalledTimes( 1 );
} );
it.each( [
	[ 'wpcom-site-monthly-v1', 'wpcom-site-plan-period-v1' ],
	[ 'wpcom-site-plan-period-v1', 'wpcom-site-monthly-v1' ],
] as const )(
	'keeps the meter across a %s GET and %s terminal update, opening once on depletion',
	async ( getPolicy, terminalPolicy ) => {
		fetchMock.mockResolvedValueOnce( response( creditSnapshot( { policy_id: getPolicy } ) ) );
		const { result } = renderCredits();
		await flush();
		expect( props( result.current ).isOpen ).toBe( false );
		expect( props( result.current ).status.remaining ).toBe( 2450 );
		const zero = creditSnapshot( {
			...exhausted(),
			policy_id: terminalPolicy,
			resets_at: '2026-10-17T14:30:00+00:00',
		} );
		await receive( zero );
		expect( props( result.current ).isOpen ).toBe( true );
		expect( props( result.current ).status ).toMatchObject( {
			plan: 'paid',
			remaining: 0,
			pools: [ { dateLabel: 'Resets Oct 17 (UTC)' } ],
		} );
		act( () => expect( result.current.beforeSubmit() ).toBe( false ) );
		act( () => props( result.current ).onToggle( false ) );
		await receive( zero );
		expect( props( result.current ).isOpen ).toBe( false );
		fetchMock.mockResolvedValueOnce( response( zero ) );
		act( () => window.dispatchEvent( new Event( 'focus' ) ) );
		await flush();
		expect( props( result.current ).isOpen ).toBe( false );
	}
);
it( 'keeps initial and new-site exhausted plan-period balances quiet', async () => {
	const zero = creditSnapshot( { ...exhausted(), policy_id: 'wpcom-site-plan-period-v1' } );
	fetchMock.mockResolvedValueOnce( response( zero ) );
	const view = renderCredits();
	await flush();
	expect( props( view.result.current ).status.remaining ).toBe( 0 );
	expect( props( view.result.current ).isOpen ).toBe( false );
	await receive( creditSnapshot() );
	const oldObserver = mockConfig.onTaskUpdate;
	fetchMock.mockResolvedValueOnce( response( { ...zero, blog_id: 456 } ) );
	view.rerender( {
		...defaultOptions,
		siteKey: '456',
		agentConfig: { ...agentConfig, authenticationScope: { siteId: 456, userId: 1 } },
	} );
	await flush();
	await act( async () => oldObserver?.( terminal( zero ) ) );
	expect( props( view.result.current ).status.remaining ).toBe( 0 );
	expect( props( view.result.current ).isOpen ).toBe( false );
} );
it( 'refreshes the paid tier and balance together after an upgrade', async () => {
	fetchMock.mockResolvedValueOnce( response( creditSnapshot( { plan_tier: 'personal' } ) ) );
	const { result } = renderCredits();
	await flush();
	expect( props( result.current ).status.planTier ).toBe( 'personal' );
	fetchMock.mockResolvedValueOnce(
		response(
			creditSnapshot( {
				plan_tier: 'business',
				credits_limit: 15000,
				credits_remaining: 14950,
			} )
		)
	);
	act( () => window.dispatchEvent( new Event( 'focus' ) ) );
	await flush();
	expect( props( result.current ).status ).toMatchObject( {
		plan: 'paid',
		planTier: 'business',
		remaining: 14950,
		pools: [ { total: 15000, remaining: 14950 } ],
	} );
} );
it.each( [ 'GET', 'terminal' ] )(
	'%s replaces a known tier with unknown metadata while retaining the current balance',
	async ( source ) => {
		fetchMock.mockResolvedValueOnce( response( creditSnapshot( { plan_tier: 'commerce' } ) ) );
		const { result } = renderCredits();
		await flush();
		for ( const tier of [ {}, { plan_tier: 'enterprise' }, { plan_tier: null } ] ) {
			await receive( creditSnapshot( { plan_tier: 'commerce' } ) );
			const snapshot = { ...exhausted(), ...tier };
			if ( source === 'GET' ) {
				fetchMock.mockResolvedValueOnce( response( snapshot ) );
				act( () => window.dispatchEvent( new Event( 'focus' ) ) );
				await flush();
			} else {
				await receive( snapshot );
			}
			expect( props( result.current ).status ).not.toHaveProperty( 'planTier' );
			expect( props( result.current ).status ).toMatchObject( { plan: 'paid', remaining: 0 } );
			act( () => expect( result.current.beforeSubmit() ).toBe( false ) );
			expect( result.current.notice ).toBeUndefined();
		}
	}
);
it( 'does not carry a paid tier across sites or reuse a prior visit callback', async () => {
	fetchMock.mockResolvedValueOnce( response( creditSnapshot( { plan_tier: 'business' } ) ) );
	const view = renderCredits();
	await flush();
	const oldObserver = mockConfig.onTaskUpdate;
	expect( props( view.result.current ).status.planTier ).toBe( 'business' );
	fetchMock.mockResolvedValueOnce( response( creditSnapshot( { blog_id: 456 } ) ) );
	view.rerender( {
		...defaultOptions,
		siteKey: '456',
		agentConfig: { ...agentConfig, authenticationScope: { siteId: 456, userId: 1 } },
	} );
	expect( view.result.current.trailingActions ).toBeUndefined();
	await flush();
	expect( props( view.result.current ).status ).not.toHaveProperty( 'planTier' );
	await receive( creditSnapshot( { blog_id: 456, plan_tier: 'premium' } ) );
	expect( props( view.result.current ).status.planTier ).toBe( 'premium' );
	fetchMock.mockResolvedValueOnce( response( creditSnapshot() ) );
	view.rerender( defaultOptions );
	expect( view.result.current.trailingActions ).toBeUndefined();
	await flush();
	await act( async () => oldObserver?.( terminal( creditSnapshot( { plan_tier: 'business' } ) ) ) );
	expect( props( view.result.current ).status ).not.toHaveProperty( 'planTier' );
	expect( props( view.result.current ).status.remaining ).toBe( 2450 );
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
	view.rerender( {
		...defaultOptions,
		siteKey: '456',
		agentConfig: { ...agentConfig, authenticationScope: { siteId: 456, userId: 1 } },
	} );
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
		await receive( { ...exhausted(), plan_tier: 'commerce' } );
		if ( outcome === 'success' ) {
			read.resolve( response( creditSnapshot( { plan_tier: 'personal' } ) ) );
		} else {
			read.reject( new Error( 'Late network error' ) );
		}
		await flush();
		expect( props( result.current ).status.remaining ).toBe( 0 );
		expect( props( result.current ).status.planTier ).toBe( 'commerce' );
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
	view.rerender( {
		...defaultOptions,
		siteKey: '456',
		agentConfig: { ...agentConfig, authenticationScope: { siteId: 456, userId: 1 } },
	} );
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
		await receive( creditSnapshot( { plan_tier: 'premium' } ), state );
		mockIsProcessing = false;
		view.rerender( defaultOptions );
		expect( props( view.result.current ).status.remaining ).toBe( 2450 );
		expect( props( view.result.current ).status.percent ).toBe( 98 );
		expect( props( view.result.current ).status.planTier ).toBe( 'premium' );
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
		response(
			creditSnapshot( {
				...exhausted(),
				policy_id: 'wpcom-site-plan-period-v1',
				resets_at: '2026-09-21T12:00:01Z',
			} )
		)
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

it.each( [
	{ siteKey: '456', userId: 1, siteId: 456 },
	{ siteKey: '123', userId: 2, siteId: 123 },
] )( 'waits for configuration authentication to match the selected scope %p', async ( next ) => {
	const oldAuth = deferred< Record< string, string > >();
	authProvider.mockReturnValueOnce( oldAuth.promise );
	const view = renderCredits();
	const oldObserver = mockConfig.onTaskUpdate;
	const nextOptions = { ...defaultOptions, siteKey: next.siteKey, userId: next.userId };
	view.rerender( nextOptions );
	act( () => window.dispatchEvent( new Event( 'focus' ) ) );
	oldAuth.resolve( { Authorization: 'Bearer old-scope' } );
	await flush();
	expect( authProvider ).toHaveBeenCalledTimes( 1 );
	expect( fetchMock ).not.toHaveBeenCalled();
	const newAuth = jest.fn().mockResolvedValue( { Authorization: 'Bearer new-scope' } );
	fetchMock.mockResolvedValueOnce( response( creditSnapshot( { blog_id: next.siteId } ) ) );
	view.rerender( {
		...nextOptions,
		agentConfig: {
			...agentConfig,
			authenticationScope: { siteId: next.siteId, userId: next.userId },
			authProvider: newAuth,
		},
	} );
	await flush();
	expect( fetchMock ).toHaveBeenCalledWith(
		`https://public-api.wordpress.com/wpcom/v2/sites/${ next.siteId }/ai/credits`,
		expect.objectContaining( { headers: { Authorization: 'Bearer new-scope' } } )
	);
	await act( async () => oldObserver?.( terminal( exhausted() ) ) );
	expect( props( view.result.current ).status.remaining ).toBe( 2450 );
} );

it( 'does not reuse B authentication when returning to A before configuration is ready', async () => {
	fetchMock.mockResolvedValue( response( creditSnapshot() ) );
	const view = renderCredits();
	await flush();
	const originalObserver = mockConfig.onTaskUpdate;
	view.rerender( { ...defaultOptions, siteKey: '456' } );
	await flush();
	expect( fetchMock ).toHaveBeenCalledTimes( 1 );
	const bConfig = {
		...agentConfig,
		authenticationScope: { siteId: 456, userId: 1 },
		authProvider: jest.fn().mockResolvedValue( { Authorization: 'Bearer B' } ),
	};
	view.rerender( { ...defaultOptions, siteKey: '456', agentConfig: bConfig } );
	await flush();
	expect( fetchMock ).toHaveBeenCalledTimes( 2 );
	view.rerender( { ...defaultOptions, agentConfig: bConfig } );
	await flush();
	expect( fetchMock ).toHaveBeenCalledTimes( 2 );
	view.rerender( {
		...defaultOptions,
		agentConfig: {
			...agentConfig,
			authProvider: jest.fn().mockResolvedValue( { Authorization: 'Bearer new-A' } ),
		},
	} );
	await flush();
	await act( async () => originalObserver?.( terminal( exhausted() ) ) );
	expect( props( view.result.current ).status.remaining ).toBe( 2450 );
	expect( fetchMock ).toHaveBeenLastCalledWith(
		expect.stringContaining( '/sites/123/' ),
		expect.objectContaining( { headers: { Authorization: 'Bearer new-A' } } )
	);
} );

it.each( [
	{ siteKey: '456', userId: 1, agentId: 'wp-orchestrator' },
	{ siteKey: '123', userId: 2, agentId: 'wp-orchestrator' },
	{ siteKey: '123', userId: 1, agentId: 'other-agent' },
] )( 'keeps an open popover and its callbacks within their visit %p', async ( next ) => {
	const view = renderCredits();
	await receive( creditSnapshot() );
	const oldToggle = props( view.result.current ).onToggle;
	act( () => oldToggle( true ) );
	const config = {
		...agentConfig,
		agentId: next.agentId,
		authenticationScope: { siteId: Number( next.siteKey ), userId: next.userId },
	};
	view.rerender( { ...defaultOptions, ...next, agentConfig: config } );
	await receive( creditSnapshot( { blog_id: Number( next.siteKey ) } ) );
	const expectedOpen = next.agentId === 'wp-orchestrator' ? false : undefined;
	expect( props( view.result.current )?.isOpen ).toBe( expectedOpen );
	act( () => oldToggle( true ) );
	expect( props( view.result.current )?.isOpen ).toBe( expectedOpen );
	view.rerender( defaultOptions );
	await receive( creditSnapshot() );
	expect( props( view.result.current ).isOpen ).toBe( false );
} );

it( 'rejects callbacks and pending reads from the previous initialized conversation', async () => {
	const oldRead = deferred< ReturnType< typeof response > >();
	fetchMock.mockReturnValueOnce( oldRead.promise );
	const view = renderCredits();
	await flush();
	const oldObserver = mockConfig.onTaskUpdate;
	const signal = fetchMock.mock.calls[ 0 ][ 1 ].signal;
	fetchMock.mockResolvedValueOnce( response( creditSnapshot() ) );
	view.rerender( {
		...defaultOptions,
		agentConfig: {
			...agentConfig,
			sessionId: 'new-conversation',
			authProvider: jest.fn().mockResolvedValue( { Authorization: 'Bearer new-agent' } ),
		},
	} );
	await flush();
	expect( signal.aborted ).toBe( true );
	oldRead.resolve( response( exhausted() ) );
	await act( async () => oldObserver?.( terminal( exhausted() ) ) );
	await flush();
	expect( props( view.result.current ).status.remaining ).toBe( 2450 );
} );

it( 'accepts the first terminal snapshot after the server assigns the same conversation a session', async () => {
	const view = renderCredits();
	const observer = mockConfig.onTaskUpdate;
	view.rerender( {
		...defaultOptions,
		agentConfig: { ...agentConfig, sessionId: 'server-assigned' },
	} );
	await act( async () => observer?.( terminal( creditSnapshot() ) ) );
	expect( props( view.result.current ).status.remaining ).toBe( 2450 );
} );
