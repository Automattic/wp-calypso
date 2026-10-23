/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { act, renderHook } from '@testing-library/react';
import { ORCHESTRATOR_AGENT_URL } from '../../constants';
import { creditSnapshot } from '../../utils/__tests__/fixtures/credit-snapshot';
import { localNumber } from '../../utils/__tests__/fixtures/local-number';
import {
	NO_SITE,
	clearSessionId,
	saveSessionId,
	setSessionSiteKey,
	setSessionUserId,
} from '../../utils/agent-session';
import { CREDITS_LOW_BALANCE, getCreditsLabel, isCreditsAlert } from '../../utils/credits';
import { setResolvedAgentId } from '../../utils/resolved-agent-id';
import { recordAgentsManagerTracksEvent } from '../../utils/tracks';
import { useCredits } from '../use-credits';
import type { AgentConfig } from '../../utils/create-agent-config';
import type { CreditsPlanTier, CreditsStatus } from '../../utils/credits';
import type { CreditsPurchaseAction } from '../../utils/credits-access';
import type { TaskUpdate, UseAgentChatConfig } from '@automattic/agenttic-client';
import type { AgentsManagerSite } from '@automattic/data-stores';
import type { ReactElement } from 'react';

let mockIsProcessing = false;
let mockMessages: unknown[] = [];
let mockConfig: UseAgentChatConfig;
jest.mock(
	'@automattic/agenttic-client',
	() => ( {
		useAgentChat: ( config: UseAgentChatConfig ) => {
			mockConfig = config;
			return { isProcessing: mockIsProcessing, messages: mockMessages };
		},
	} ),
	{ virtual: true }
);
jest.mock( '@wordpress/element', () => jest.requireActual( 'react' ) );
jest.mock( 'i18n-calypso', () => ( { getBrowserSafeLocale: () => 'en' } ) );
jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	_n: ( single: string, plural: string, count: number ) => ( count === 1 ? single : plural ),
	sprintf: ( format: string, ...values: unknown[] ) => {
		let index = 0;
		return format
			.replace( /%(\d+\$)?[sd]/g, () => String( values[ index++ ] ) )
			.replace( /%%/g, '%' );
	},
} ) );
jest.mock( '../../components/credits-meter', () => () => null );
jest.mock( '../../utils/tracks', () => ( { recordAgentsManagerTracksEvent: jest.fn() } ) );
jest.mock( '@automattic/calypso-analytics', () => ( { recordTracksEvent: jest.fn() } ) );

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
	isNoticeVisible: true,
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
			action?: CreditsPurchaseAction;
			manageUrl?: string;
		} >
	 )?.props;
const exhausted = ( blocked = false ) =>
	creditSnapshot( { credits_used: 2500, credits_remaining: 0, exhausted: true, blocked } );
const receive = ( snapshot: unknown, state: 'completed' | 'failed' | 'canceled' = 'completed' ) =>
	act( async () => mockConfig.onTaskUpdate?.( terminal( snapshot, state ) ) );
const failed = ( parts: unknown[] ): TaskUpdate =>
	( {
		id: 'task',
		status: {
			state: 'failed',
			message: { role: 'agent', kind: 'message', messageId: 'm', parts },
		},
		final: true,
		text: '',
	} ) as TaskUpdate;
const refuse = ( aiCredits: unknown, code = 'ai_credit_allowance_exhausted' ) =>
	act( async () =>
		mockConfig.onTaskUpdate?.( { ...failed( [ { type: 'data', data: { code } } ] ), aiCredits } )
	);
const low = ( plan_tier: CreditsPlanTier = 'personal' ) =>
	creditSnapshot( { credits_remaining: 5, credits_used: 2495, plan_tier } );
const fetchMock = jest.fn();
// `null` leaves a field out, as an older server does; the server itself sends
// `can_upgrade: null` when it can't tell who bought the plan.
const response = (
	snapshot: unknown,
	canBuyCredits: boolean | null = true,
	canUpgrade: boolean | null = canBuyCredits
) => ( {
	ok: true,
	json: async () => ( {
		ai_credits: snapshot,
		...( canBuyCredits === null ? {} : { can_buy_credits: canBuyCredits } ),
		...( canUpgrade === null ? {} : { can_upgrade: canUpgrade } ),
	} ),
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
	mockMessages = [ { id: 'm' } ];
	window.history.replaceState( {}, '', '/' );
	fetchMock.mockReset().mockImplementation( () => new Promise( () => {} ) );
	authProvider.mockReset().mockResolvedValue( { Authorization: 'Bearer site-jwt' } );
	Object.defineProperty( document, 'visibilityState', { configurable: true, value: 'visible' } );
	globalThis.fetch = fetchMock;
	jest.mocked( recordAgentsManagerTracksEvent ).mockClear();
} );
afterEach( () => {
	jest.useRealTimers();
} );

const UPGRADE_URL = 'https://wordpress.com/plans/example.wordpress.com?source=wp_ai_credits';
const ADD_CREDITS_URL =
	'https://wordpress.com/checkout/example.wordpress.com/ai-credits-lifetime:-q-100000?source=wp_ai_credits&redirect_to=https%3A%2F%2Fwordpress.com%2Fhome%2Fexample.wordpress.com&cancel_to=https%3A%2F%2Fwordpress.com%2Fhome%2Fexample.wordpress.com';

it.each( [ 'personal', 'premium' ] as const )(
	'offers the selected-site plans flow for %s through GET and terminal updates',
	async ( plan_tier ) => {
		fetchMock.mockResolvedValueOnce( response( creditSnapshot( { plan_tier } ) ) );
		const { result } = renderCredits();
		await flush();
		expect( props( result.current ).action?.href ).toBe( UPGRADE_URL );
		expect( props( result.current ).onAction ).toBeUndefined();
		await receive( { ...exhausted(), plan_tier } );
		expect( props( result.current ).action?.href ).toBe( UPGRADE_URL );
		expect( result.current.notice?.message ).toBe( 'You’ve used all your site credits.' );
		expect( result.current.notice?.action ).toEqual( {
			label: 'Upgrade',
			href: props( result.current ).action?.href,
			target: '_blank',
			rel: 'noopener noreferrer',
			onClick: expect.any( Function ),
		} );
		expect( props( result.current ).action ).toEqual( result.current.notice?.action );
		act( () => expect( result.current.beforeSubmit() ).toBe( false ) );
	}
);
it.each( [ 'business', 'commerce' ] as const )(
	'offers %s one credits pack at checkout through GET and terminal updates',
	async ( plan_tier ) => {
		fetchMock.mockResolvedValueOnce( response( creditSnapshot( { plan_tier } ) ) );
		const { result } = renderCredits();
		await flush();
		expect( props( result.current ).action?.href ).toBe( ADD_CREDITS_URL );
		await receive( { ...exhausted(), plan_tier } );
		expect( result.current.notice?.message ).toBe( 'You’ve used all your site credits.' );
		expect( result.current.notice?.action ).toEqual( {
			label: 'Add credits',
			href: ADD_CREDITS_URL,
			target: '_blank',
			rel: 'noopener noreferrer',
			onClick: expect.any( Function ),
		} );
		expect( props( result.current ).action ).toEqual( result.current.notice?.action );
		act( () => expect( result.current.beforeSubmit() ).toBe( false ) );
	}
);
describe( 'return address', () => {
	const POST_RETURN = 'https://wordpress.com/post/example.wordpress.com/42';
	const HOME_RETURN = 'https://wordpress.com/home/example.wordpress.com';
	const returnsOf = ( value: ReturnType< typeof useCredits > ) => {
		const { searchParams } = new URL( props( value ).action?.href ?? '' );
		return {
			redirectTo: searchParams.get( 'redirect_to' ),
			cancelTo: searchParams.get( 'cancel_to' ),
		};
	};

	beforeEach( () => {
		window.history.replaceState( {}, '', '/wp-admin/post.php?post=42&action=edit' );
	} );
	afterEach( () => {
		delete window._currentSiteType;
	} );

	it.each( [
		[ 'the open post on a Simple site', 'simple', POST_RETURN ],
		[ 'home on an Atomic site', 'atomic', HOME_RETURN ],
	] as const )( 'returns Add credits to %s', async ( _where, siteType, returnUrl ) => {
		window._currentSiteType = siteType;
		fetchMock.mockResolvedValueOnce( response( creditSnapshot( { plan_tier: 'business' } ) ) );
		const { result } = renderCredits();
		await flush();
		expect( returnsOf( result.current ) ).toEqual( { redirectTo: returnUrl, cancelTo: returnUrl } );
	} );
} );
describe( 'session', () => {
	const LINKS = [
		[ 'Upgrade', 'premium', UPGRADE_URL ],
		[ 'Add credits', 'business', ADD_CREDITS_URL ],
	] as const;
	const sessionOf = ( href?: string ) => new URL( href ?? '' ).searchParams.get( 'ai_session_id' );
	const hrefs = ( value: ReturnType< typeof useCredits > ) => ( {
		notice: value.notice?.action?.href,
		popover: props( value ).action?.href,
	} );
	const both = ( url: string ) => ( { notice: url, popover: url } );
	const withSession = ( url: string, aiSessionId: string ) =>
		url.replace( 'source=wp_ai_credits', `source=wp_ai_credits&ai_session_id=${ aiSessionId }` );

	beforeEach( () => {
		// The scope the chat publishes for its Tracks events.
		setResolvedAgentId( 'wp-orchestrator' );
		setSessionSiteKey( '123' );
		setSessionUserId( 1 );
	} );
	afterEach( () => {
		sessionStorage.clear();
		setResolvedAgentId( undefined );
		setSessionSiteKey( NO_SITE );
		setSessionUserId( undefined );
		jest.mocked( recordAgentsManagerTracksEvent ).mockReset();
	} );

	it.each( LINKS )(
		'adds the chat’s session to %s in the notice and the popover, keeping the rest',
		async ( _label, plan_tier, url ) => {
			saveSessionId( 'session-a' );
			fetchMock.mockResolvedValueOnce( response( { ...exhausted(), plan_tier } ) );
			const { result } = renderCredits();
			await flush();
			expect( hrefs( result.current ) ).toEqual( both( withSession( url, 'session-a' ) ) );
		}
	);

	it.each( LINKS )(
		'leaves %s without a session before the chat has one',
		async ( _label, plan_tier, url ) => {
			fetchMock.mockResolvedValueOnce( response( { ...exhausted(), plan_tier } ) );
			const { result } = renderCredits();
			await flush();
			expect( hrefs( result.current ) ).toEqual( both( url ) );
		}
	);

	it( 'sends the click event the session its link carries', async () => {
		const tracks =
			jest.requireActual< typeof import( '../../utils/tracks' ) >( '../../utils/tracks' );
		jest
			.mocked( recordAgentsManagerTracksEvent )
			.mockImplementation( tracks.recordAgentsManagerTracksEvent );
		jest.mocked( recordTracksEvent ).mockClear();
		saveSessionId( 'session-a' );
		fetchMock.mockResolvedValueOnce( response( { ...exhausted(), plan_tier: 'business' } ) );
		const { result } = renderCredits();
		await flush();

		act( () => result.current.notice?.action?.onClick?.() );
		act( () => props( result.current ).action?.onClick?.() );

		const clicks = jest
			.mocked( recordTracksEvent )
			.mock.calls.filter( ( [ name ] ) => name === 'calypso_agents_manager_credits_cta_clicked' );
		expect( clicks.map( ( [ , eventProps ] ) => eventProps?.ai_session_id ) ).toEqual( [
			sessionOf( hrefs( result.current ).notice ),
			sessionOf( hrefs( result.current ).popover ),
		] );
		expect( sessionOf( hrefs( result.current ).notice ) ).toBe( 'session-a' );
	} );

	it( 'follows a new conversation in the same tab', async () => {
		saveSessionId( 'session-a' );
		fetchMock.mockResolvedValueOnce( response( { ...exhausted(), plan_tier: 'premium' } ) );
		const view = renderCredits();
		await flush();
		expect( hrefs( view.result.current ) ).toEqual(
			both( withSession( UPGRADE_URL, 'session-a' ) )
		);

		// A new chat clears the session, and the server assigns the next one in its first turn.
		clearSessionId();
		view.rerender( defaultOptions );
		expect( hrefs( view.result.current ) ).toEqual( both( UPGRADE_URL ) );

		saveSessionId( 'session-b' );
		await receive( { ...exhausted(), plan_tier: 'premium' } );
		expect( hrefs( view.result.current ) ).toEqual(
			both( withSession( UPGRADE_URL, 'session-b' ) )
		);
	} );
} );
it.each( [ undefined, null, 'unsupported' ] )(
	'keeps the balance without a purchase link or fabricated guidance for tier %p',
	async ( plan_tier ) => {
		const { result } = renderCredits();
		await receive( { ...creditSnapshot(), plan_tier } );
		expect( props( result.current ).status.remaining ).toBe( 2450 );
		expect( props( result.current ).action?.href ).toBeUndefined();
		expect( props( result.current ).onAction ).toBeUndefined();
		expect( result.current.notice?.message ).toBe( `${ localNumber( 2.4 ) }k credits left.` );
		expect( result.current.notice?.action ).toBeUndefined();
	}
);
describe( 'purchase access', () => {
	const purchaseHint = ( value: ReturnType< typeof useCredits > ) =>
		(
			value.trailingActions as ReactElement< {
				purchaseHint?: string;
			} >
		 )?.props.purchaseHint;

	it( 'shows Upgrade with no guidance to someone who can upgrade the plan but can’t buy credits', async () => {
		fetchMock.mockResolvedValueOnce(
			response( { ...exhausted(), plan_tier: 'personal' }, false, true )
		);
		const { result } = renderCredits();
		await flush();
		expect( props( result.current ).action?.href ).toBe( UPGRADE_URL );
		expect( purchaseHint( result.current ) ).toBeUndefined();
		expect( result.current.notice?.message ).toBe( 'You’ve used all your site credits.' );
	} );

	it( 'points someone who can’t buy to a site admin, with no purchase link', async () => {
		fetchMock.mockResolvedValueOnce( response( { ...exhausted(), plan_tier: 'personal' }, false ) );
		const { result } = renderCredits();
		await flush();
		expect( props( result.current ).status.remaining ).toBe( 0 );
		expect( props( result.current ).action?.href ).toBeUndefined();
		expect( purchaseHint( result.current ) ).toBe( 'Ask a site admin to add more.' );
		expect( result.current.notice?.message ).toBe(
			'You’ve used all your site credits. Ask a site admin to add more.'
		);
		expect( result.current.notice?.action ).toBeUndefined();
	} );

	it( 'keeps the low-balance notice for someone who can’t buy, without a link', async () => {
		fetchMock.mockResolvedValueOnce(
			response(
				creditSnapshot( {
					credits_limit: 10000,
					credits_remaining: 1999,
					credits_used: 8001,
					plan_tier: 'personal',
				} ),
				false
			)
		);
		const { result } = renderCredits();
		await flush();
		expect( purchaseHint( result.current ) ).toBe( 'Ask a site admin to add more.' );
		expect( result.current.notice?.message ).toBe(
			`${ localNumber( 1.9 ) }k credits left. Ask a site admin to add more.`
		);
		expect( result.current.notice?.action ).toBeUndefined();
		expect( result.current.notice?.dismissible ).toBe( true );
	} );

	it( 'tells an admin who didn’t buy the plan who did, and points the notice to the plan owner', async () => {
		fetchMock.mockResolvedValueOnce(
			response( { ...exhausted(), plan_tier: 'personal' }, true, false )
		);
		const { result } = renderCredits();
		await flush();
		expect( props( result.current ).status.remaining ).toBe( 0 );
		expect( props( result.current ).action?.href ).toBeUndefined();
		expect( purchaseHint( result.current ) ).toBe(
			'This plan was purchased by a different WordPress.com account. To manage this plan, log in to that account or contact the account owner.'
		);
		expect( result.current.notice?.message ).toBe(
			'You’ve used all your site credits. Ask the plan owner to upgrade.'
		);
		expect( result.current.notice?.action ).toBeUndefined();
	} );

	it( 'keeps the low-balance notice for an admin who didn’t buy the plan, without a link', async () => {
		fetchMock.mockResolvedValueOnce(
			response(
				creditSnapshot( {
					credits_limit: 10000,
					credits_remaining: 1999,
					credits_used: 8001,
					plan_tier: 'personal',
				} ),
				true,
				false
			)
		);
		const { result } = renderCredits();
		await flush();
		expect( purchaseHint( result.current ) ).toBe(
			'This plan was purchased by a different WordPress.com account. To manage this plan, log in to that account or contact the account owner.'
		);
		expect( result.current.notice?.message ).toBe(
			`${ localNumber( 1.9 ) }k credits left. Ask the plan owner to upgrade.`
		);
		expect( result.current.notice?.action ).toBeUndefined();
		expect( result.current.notice?.dismissible ).toBe( true );
	} );

	it( 'shows Upgrade with no guidance to the plan buyer on every surface', async () => {
		fetchMock.mockResolvedValueOnce(
			response(
				creditSnapshot( {
					credits_limit: 10000,
					credits_remaining: 1999,
					credits_used: 8001,
					plan_tier: 'personal',
				} )
			)
		);
		const { result } = renderCredits();
		await flush();
		expect( props( result.current ).action?.href ).toBe( UPGRADE_URL );
		expect( purchaseHint( result.current ) ).toBeUndefined();
		expect( result.current.notice?.message ).toBe( `${ localNumber( 1.9 ) }k credits left.` );
		expect( result.current.notice?.action?.href ).toBe( UPGRADE_URL );
		await receive( { ...exhausted(), plan_tier: 'personal' } );
		expect( props( result.current ).action?.href ).toBe( UPGRADE_URL );
		expect( purchaseHint( result.current ) ).toBeUndefined();
		expect( result.current.notice?.message ).toBe( 'You’ve used all your site credits.' );
		expect( result.current.notice?.action?.href ).toBe( UPGRADE_URL );
	} );

	it( 'offers someone who can’t buy no guidance when the server can’t tell who bought the plan', async () => {
		fetchMock.mockResolvedValueOnce(
			response( { ...exhausted(), plan_tier: 'personal' }, false, null )
		);
		const { result } = renderCredits();
		await flush();
		expect( props( result.current ).action?.href ).toBeUndefined();
		expect( purchaseHint( result.current ) ).toBeUndefined();
		expect( result.current.notice?.message ).toBe( 'You’ve used all your site credits.' );
		expect( result.current.notice?.action ).toBeUndefined();
	} );

	it( 'offers neither a link nor guidance when the server doesn’t say', async () => {
		fetchMock.mockResolvedValueOnce( response( { ...exhausted(), plan_tier: 'personal' }, null ) );
		const { result } = renderCredits();
		await flush();
		expect( props( result.current ).action?.href ).toBeUndefined();
		expect( purchaseHint( result.current ) ).toBeUndefined();
		expect( result.current.notice?.message ).toBe( 'You’ve used all your site credits.' );
		expect( result.current.notice?.action ).toBeUndefined();
	} );

	it.each( [
		[ 'omits', response( { ...exhausted(), plan_tier: 'personal' }, true, null ) ],
		[
			'nulls',
			{
				ok: true,
				json: async () => ( {
					ai_credits: { ...exhausted(), plan_tier: 'personal' },
					can_buy_credits: true,
					can_upgrade: null,
				} ),
			},
		],
	] )(
		'offers an admin neither a link nor guidance when the server %s who bought the plan',
		async ( _case, read ) => {
			fetchMock.mockResolvedValueOnce( read );
			const { result } = renderCredits();
			await flush();
			expect( props( result.current ).action?.href ).toBeUndefined();
			expect( purchaseHint( result.current ) ).toBeUndefined();
			expect( result.current.notice?.message ).toBe( 'You’ve used all your site credits.' );
			expect( result.current.notice?.action ).toBeUndefined();
		}
	);

	it( 'keeps the balance read’s answer through terminal updates', async () => {
		fetchMock.mockResolvedValueOnce(
			response( creditSnapshot( { plan_tier: 'personal' } ), false )
		);
		const { result } = renderCredits();
		await flush();
		await receive( { ...exhausted(), plan_tier: 'personal' } );
		expect( props( result.current ).action?.href ).toBeUndefined();
		expect( purchaseHint( result.current ) ).toBe( 'Ask a site admin to add more.' );
	} );

	it.each( [
		[
			'user',
			{
				userId: 2,
				agentConfig: { ...agentConfig, authenticationScope: { siteId: 123, userId: 2 } },
			},
		],
		[
			'auth provider',
			{
				agentConfig: {
					...agentConfig,
					authProvider: jest.fn().mockResolvedValue( { Authorization: 'Bearer other' } ),
				},
			},
		],
	] )( 'drops the answer when the visit changes its %s', async ( _case, next ) => {
		fetchMock.mockResolvedValueOnce( response( creditSnapshot( { plan_tier: 'personal' } ) ) );
		const view = renderCredits();
		await flush();
		expect( props( view.result.current ).action?.href ).toBeDefined();
		// The new visit's read hangs, so a task delivers its balance before anyone says who may buy.
		view.rerender( { ...defaultOptions, ...next } );
		await flush();
		await receive( creditSnapshot( { plan_tier: 'personal' } ) );
		expect( props( view.result.current ).status.remaining ).toBe( 2450 );
		expect( props( view.result.current ).action?.href ).toBeUndefined();
		expect( purchaseHint( view.result.current ) ).toBeUndefined();
	} );

	it( 'reads who may buy again on returning to a site', async () => {
		fetchMock.mockResolvedValueOnce( response( creditSnapshot( { plan_tier: 'personal' } ) ) );
		const view = renderCredits();
		await flush();
		expect( props( view.result.current ).action?.href ).toBe( UPGRADE_URL );
		fetchMock.mockResolvedValueOnce(
			response( creditSnapshot( { blog_id: 456, plan_tier: 'personal' } ), false )
		);
		view.rerender( {
			...defaultOptions,
			siteKey: '456',
			site: { ID: 456, domain: 'second.wordpress.com' },
			agentConfig: { ...agentConfig, authenticationScope: { siteId: 456, userId: 1 } },
		} );
		await flush();
		expect( props( view.result.current ).action?.href ).toBeUndefined();
		expect( purchaseHint( view.result.current ) ).toBe( 'Ask a site admin to add more.' );
		// Back on A, its new read hangs: neither the old answer for A nor B's applies.
		view.rerender( defaultOptions );
		await flush();
		expect( view.result.current.trailingActions ).toBeUndefined();
		await receive( creditSnapshot( { plan_tier: 'personal' } ) );
		expect( props( view.result.current ).status.remaining ).toBe( 2450 );
		expect( props( view.result.current ).action?.href ).toBeUndefined();
		expect( purchaseHint( view.result.current ) ).toBeUndefined();
		fetchMock.mockResolvedValueOnce( response( creditSnapshot( { plan_tier: 'personal' } ) ) );
		act( () => window.dispatchEvent( new Event( 'focus' ) ) );
		await flush();
		expect( props( view.result.current ).action?.href ).toBe( UPGRADE_URL );
		expect( purchaseHint( view.result.current ) ).toBeUndefined();
	} );

	it.each( [
		[ 'a failed read', () => Promise.resolve( { ok: false, status: 503 } ) ],
		[ 'a network error', () => Promise.reject( new Error( 'Offline' ) ) ],
	] )( 'keeps the answer for the visit through %s', async ( _case, read ) => {
		fetchMock.mockResolvedValueOnce( response( creditSnapshot( { plan_tier: 'personal' } ) ) );
		const { result } = renderCredits();
		await flush();
		expect( props( result.current ).action?.href ).toBeDefined();
		fetchMock.mockImplementationOnce( read );
		act( () => window.dispatchEvent( new Event( 'focus' ) ) );
		await flush();
		expect( result.current.trailingActions ).toBeUndefined();
		await receive( { ...exhausted(), plan_tier: 'personal' } );
		expect( props( result.current ).action?.href ).toBe( UPGRADE_URL );
		expect( purchaseHint( result.current ) ).toBeUndefined();
		expect( result.current.notice?.action?.href ).toBe( UPGRADE_URL );
	} );
} );

it( 'waits for matching site data and follows a domain change for the same site', async () => {
	fetchMock.mockResolvedValueOnce( response( creditSnapshot() ) );
	const view = renderCredits( { site: undefined } );
	await flush();
	await receive( creditSnapshot( { plan_tier: 'personal' } ) );
	expect( props( view.result.current ).action?.href ).toBeUndefined();
	view.rerender( { ...defaultOptions, site: { ID: 456, domain: 'other.wordpress.com' } } );
	expect( props( view.result.current ).action?.href ).toBeUndefined();
	view.rerender( defaultOptions );
	expect( props( view.result.current ).action?.href ).toBe( UPGRADE_URL );
	view.rerender( { ...defaultOptions, site: { ID: '123', domain: 'mapped.example::blog' } } );
	expect( props( view.result.current ).action?.href ).toBe(
		'https://wordpress.com/plans/mapped.example%3A%3Ablog?source=wp_ai_credits'
	);
} );
it.each( [ '', '.', '..', ' ' ] )(
	'omits the destination for an invalid site slug %p',
	async ( domain ) => {
		const { result } = renderCredits( { site: { ...site, domain } } );
		await receive( creditSnapshot( { plan_tier: 'personal' } ) );
		expect( props( result.current ).action?.href ).toBeUndefined();
		expect( props( result.current ).status.remaining ).toBe( 2450 );
	}
);
it( 'never uses a previous site destination during a site switch', async () => {
	fetchMock.mockResolvedValueOnce( response( creditSnapshot() ) );
	const view = renderCredits();
	await flush();
	await receive( creditSnapshot( { plan_tier: 'personal' } ) );
	const oldObserver = mockConfig.onTaskUpdate;
	const next = {
		...defaultOptions,
		siteKey: '456',
		agentConfig: { ...agentConfig, authenticationScope: { siteId: 456, userId: 1 } },
	};
	fetchMock.mockResolvedValueOnce( response( creditSnapshot( { blog_id: 456 } ) ) );
	view.rerender( next );
	expect( view.result.current.trailingActions ).toBeUndefined();
	await flush();
	await receive( creditSnapshot( { blog_id: 456, plan_tier: 'premium' } ) );
	expect( props( view.result.current ).action?.href ).toBeUndefined();
	view.rerender( { ...next, site: { ID: 456, domain: 'second.wordpress.com' } } );
	await act( async () => oldObserver?.( terminal( creditSnapshot( { plan_tier: 'commerce' } ) ) ) );
	expect( props( view.result.current ).action?.href ).toBe(
		'https://wordpress.com/plans/second.wordpress.com?source=wp_ai_credits'
	);
} );
it.each( [ { userId: 2 }, { agentConfig: { ...agentConfig, authProvider: jest.fn() } } ] )(
	'drops the upgrade action when the authenticated visit changes: %p',
	async ( next ) => {
		fetchMock.mockResolvedValueOnce( response( creditSnapshot() ) );
		const view = renderCredits();
		await flush();
		await receive( creditSnapshot( { plan_tier: 'personal' } ) );
		expect( props( view.result.current ).action?.href ).toBeDefined();
		view.rerender( { ...defaultOptions, ...next } );
		expect( view.result.current.trailingActions ).toBeUndefined();
	}
);
it( 'refreshes an upgraded balance on return focus and switches Upgrade to Add credits', async () => {
	fetchMock.mockResolvedValueOnce(
		response( creditSnapshot( { ...exhausted(), plan_tier: 'personal' } ) )
	);
	const { result } = renderCredits();
	await flush();
	expect( props( result.current ).action?.label ).toBe( 'Upgrade' );
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
	expect( props( result.current ).action ).toMatchObject( {
		label: 'Add credits',
		href: ADD_CREDITS_URL,
	} );
	expect( result.current.beforeSubmit() ).toBe( true );
	await receive( creditSnapshot( { plan_tier: 'commerce' } ) );
	expect( props( result.current ).action ).toMatchObject( {
		label: 'Add credits',
		href: ADD_CREDITS_URL,
	} );
	expect( props( result.current ).status.remaining ).toBe( 2450 );
} );

it.each( [
	[ 15000, 15000, undefined, undefined ],
	[ 10001, 40000, undefined, undefined ],
	[ 10000, 40000, undefined, undefined ],
	[ 9999, 40000, `${ localNumber( 9.9 ) }k credits left.`, true ],
	[ 8500, 40000, `${ localNumber( 8.5 ) }k credits left.`, true ],
	[ 800, 40000, `${ localNumber( 800 ) } credits left.`, true ],
	[ 1, 40000, `${ localNumber( 1 ) } credit left.`, true ],
	[ 0, 40000, 'You’ve used all your site credits.', false ],
] as const )(
	'shows an initial live warning at %i of %i credits',
	async ( remaining, limit, message, dismissible ) => {
		fetchMock.mockResolvedValueOnce(
			response(
				creditSnapshot( {
					credits_limit: limit,
					credits_remaining: remaining,
					credits_used: limit - remaining,
					exhausted: remaining === 0,
				} )
			)
		);
		const { result } = renderCredits();
		await flush();
		expect( result.current.notice?.message ).toBe( message );
		expect( result.current.notice?.dismissible ).toBe( dismissible );
		expect( typeof result.current.notice?.onDismiss ).toBe(
			dismissible ? 'function' : 'undefined'
		);
		expect( props( result.current ).isOpen ).toBe( false );
	}
);

it( 'switches the meter to its alert icon by amount through depletion and replenishment', async () => {
	const balance = ( remaining: number ) =>
		creditSnapshot( {
			credits_limit: 100000,
			credits_remaining: remaining,
			credits_used: 100000 - remaining,
			exhausted: remaining === 0,
		} );
	fetchMock.mockResolvedValueOnce( response( balance( 25000 ) ) );
	const { result } = renderCredits();
	await flush();
	// The meter and the notice share one rule, so the alert icon shows exactly when a notice would.
	const expectAlert = ( isAlert: boolean, message?: string ) => {
		const actual = isCreditsAlert( props( result.current ).status );
		expect( actual ).toBe( isAlert );
		expect( result.current.notice?.message ).toBe( message );
		expect( result.current.notice !== undefined ).toBe( actual );
	};
	expectAlert( false );
	for ( const [ remaining, isAlert, message ] of [
		[ 10000, false, undefined ],
		[ 9999, true, `${ localNumber( 9.9 ) }k credits left.` ],
		[ 800, true, `${ localNumber( 800 ) } credits left.` ],
		[ 0, true, 'You’ve used all your site credits.' ],
	] as const ) {
		await receive( balance( remaining ) );
		expect( props( result.current ).status.remaining ).toBe( remaining );
		expectAlert( isAlert, message );
	}
	fetchMock.mockResolvedValueOnce( response( balance( 25000 ) ) );
	act( () => window.dispatchEvent( new Event( 'focus' ) ) );
	await flush();
	expectAlert( false );
} );

it.each( [ 'GET', 'terminal' ] )(
	'keeps a site with top-ups but no plan credits open to sending through %s',
	async ( source ) => {
		const topUpsOnly = creditSnapshot( {
			plan_tier: 'personal',
			credits_used: 2500,
			credits_remaining: 0,
			credits_available: 67000,
		} );
		fetchMock.mockResolvedValueOnce( response( creditSnapshot( { plan_tier: 'personal' } ) ) );
		const { result } = renderCredits();
		await flush();
		if ( source === 'GET' ) {
			fetchMock.mockResolvedValueOnce( response( topUpsOnly ) );
			act( () => window.dispatchEvent( new Event( 'focus' ) ) );
			await flush();
		} else {
			await receive( topUpsOnly );
		}
		expect( props( result.current ).status ).toMatchObject( {
			percent: 0,
			remaining: 67000,
			pools: [ { id: 'plan', percent: 0, remaining: 0 } ],
		} );
		expect( props( result.current ).isOpen ).toBe( false );
		expect( result.current.notice ).toBeUndefined();
		act( () => expect( result.current.beforeSubmit() ).toBe( true ) );
	}
);

// A 15,000-credit plan with 67,000 of 100,000 top-up credits left.
const withTopUps = ( planRemaining: number ) =>
	creditSnapshot( {
		plan_tier: 'personal',
		credits_limit: 15000,
		credits_used: 15000 - planRemaining,
		credits_remaining: planRemaining,
		credits_available: planRemaining + 67000,
		top_up_credits_purchased: 100000,
		top_up_credits_used: 33000,
		top_up_credits_remaining: 67000,
	} );

it( 'shows no low notice while top-ups keep a low plan balance above the limit', async () => {
	fetchMock.mockResolvedValueOnce( response( withTopUps( 5000 ) ) );
	const { result } = renderCredits();
	await flush();
	expect( props( result.current ).status ).toMatchObject( {
		remaining: 72000,
		pools: [
			{ id: 'plan', remaining: 5000 },
			{ id: 'topups', remaining: 67000 },
		],
	} );
	expect( getCreditsLabel( props( result.current ).status ) ).toBe(
		`${ localNumber( 72 ) }k credits left`
	);
	expect( result.current.notice ).toBeUndefined();
} );

it.each( [ 'GET', 'terminal' ] )(
	'spends top-ups once plan credits run out, without blocking Send, through %s',
	async ( source ) => {
		fetchMock.mockResolvedValueOnce( response( withTopUps( 5000 ) ) );
		const { result } = renderCredits();
		await flush();
		if ( source === 'GET' ) {
			fetchMock.mockResolvedValueOnce( response( withTopUps( 0 ) ) );
			act( () => window.dispatchEvent( new Event( 'focus' ) ) );
			await flush();
		} else {
			await receive( withTopUps( 0 ) );
		}
		const { status } = props( result.current );
		expect( status ).toMatchObject( {
			remaining: 67000,
			pools: [
				{ id: 'plan', percent: 0, remaining: 0 },
				{ id: 'topups', remaining: 67000 },
			],
		} );
		expect( getCreditsLabel( status ) ).toBe( `${ localNumber( 67 ) }k credits left` );
		expect( props( result.current ).isOpen ).toBe( false );
		expect( result.current.notice ).toBeUndefined();
		act( () => expect( result.current.beforeSubmit() ).toBe( true ) );
	}
);

it.each( [ undefined, 'unsupported' ] )(
	'shows the exhausted notice without a purchase link for tier %p',
	async ( plan_tier ) => {
		const { result } = renderCredits();
		await receive( { ...exhausted(), plan_tier } );
		expect( result.current.notice?.message ).toBe( 'You’ve used all your site credits.' );
		expect( result.current.notice?.action ).toBeUndefined();
		expect( result.current.notice?.dismissible ).toBe( false );
	}
);

it( 'uses the meter destination as site details become available or change', async () => {
	fetchMock.mockResolvedValueOnce( response( creditSnapshot() ) );
	const view = renderCredits( { site: undefined } );
	await flush();
	await receive( { ...exhausted(), plan_tier: 'personal' } );
	expect( view.result.current.notice?.action ).toBeUndefined();
	view.rerender( { ...defaultOptions, site: { ID: 456, domain: 'other.wordpress.com' } } );
	expect( view.result.current.notice?.action ).toBeUndefined();
	view.rerender( defaultOptions );
	expect( view.result.current.notice?.action?.href ).toBe(
		props( view.result.current ).action?.href
	);
	view.rerender( { ...defaultOptions, site: { ID: 123, domain: 'mapped.example' } } );
	expect( view.result.current.notice?.action?.href ).toBe(
		'https://wordpress.com/plans/mapped.example?source=wp_ai_credits'
	);
} );

it( 'keeps dismissal within the current visit and ignores previous-site dismiss handlers', async () => {
	const low = creditSnapshot( { credits_remaining: 500, credits_used: 2000 } );
	const view = renderCredits();
	await receive( low );
	const oldDismiss = view.result.current.notice?.onDismiss;
	act( () => oldDismiss?.() );
	expect( view.result.current.notice ).toBeUndefined();
	await receive( exhausted() );
	expect( view.result.current.notice?.message ).toBe( 'You’ve used all your site credits.' );
	expect( view.result.current.notice?.dismissible ).toBe( false );
	expect( view.result.current.notice?.onDismiss ).toBeUndefined();
	expect( props( view.result.current ).isOpen ).toBe( true );
	act( () => expect( view.result.current.beforeSubmit() ).toBe( false ) );
	await receive( creditSnapshot() );
	await receive( low );
	expect( view.result.current.notice ).toBeUndefined();
	view.rerender( {
		...defaultOptions,
		siteKey: '456',
		agentConfig: { ...agentConfig, authenticationScope: { siteId: 456, userId: 1 } },
	} );
	expect( view.result.current.notice ).toBeUndefined();
	await receive( { ...low, blog_id: 456 } );
	act( () => oldDismiss?.() );
	expect( view.result.current.notice?.message ).toBe( `${ localNumber( 500 ) } credits left.` );
	view.rerender( defaultOptions );
	await receive( low );
	act( () => oldDismiss?.() );
	expect( view.result.current.notice?.message ).toBe( `${ localNumber( 500 ) } credits left.` );
} );

describe( 'while the host says the page isn’t in dev mode', () => {
	const purchaseHint = ( value: ReturnType< typeof useCredits > ) =>
		( value.trailingActions as ReactElement< { purchaseHint?: string } > | undefined )?.props
			.purchaseHint;

	beforeEach( () => {
		( window as { agentsManagerData?: unknown } ).agentsManagerData = { isDevMode: false };
	} );
	afterEach( () => {
		delete ( window as { agentsManagerData?: unknown } ).agentsManagerData;
	} );

	it( 'never reads on opening, reopening, focus, coming online, becoming visible or after a turn', async () => {
		const view = renderCredits();
		await flush();
		await act( async () => {
			window.dispatchEvent( new Event( 'focus' ) );
			window.dispatchEvent( new Event( 'online' ) );
			document.dispatchEvent( new Event( 'visibilitychange' ) );
		} );
		view.rerender( { ...defaultOptions, isOpen: false } );
		view.rerender( defaultOptions );
		await flush();
		// In dev mode, a valid turn reads again for who may buy, and a turn without a balance reads instead.
		for ( const snapshot of [ creditSnapshot( { plan_tier: 'personal' } ), undefined ] ) {
			mockIsProcessing = true;
			view.rerender( defaultOptions );
			await receive( snapshot );
			mockIsProcessing = false;
			view.rerender( defaultOptions );
			await flush();
		}
		expect( authProvider ).not.toHaveBeenCalled();
		expect( fetchMock ).not.toHaveBeenCalled();
	} );

	it( 'shows a turn’s balance without a purchase link or hint, since only a read says who may buy', async () => {
		const low = creditSnapshot( {
			credits_remaining: 5,
			credits_used: 2495,
			plan_tier: 'personal',
		} );
		fetchMock.mockResolvedValue( response( low ) );
		const { result } = renderCredits();
		await flush();
		await receive( low );
		expect( authProvider ).not.toHaveBeenCalled();
		expect( props( result.current ).status.remaining ).toBe( 5 );
		expect( props( result.current ).action?.href ).toBeUndefined();
		expect( purchaseHint( result.current ) ).toBeUndefined();
		expect( result.current.notice ).toBeDefined();
		expect( result.current.notice?.action ).toBeUndefined();
		expect( fetchMock ).not.toHaveBeenCalled();
	} );

	it( 'blocks sends after a turn’s zero until the period resets, with no read on focus', async () => {
		const { result } = renderCredits();
		await receive(
			creditSnapshot( {
				...exhausted(),
				policy_id: 'wpcom-site-plan-period-v1',
				resets_at: '2026-09-21T12:00:01Z',
			} )
		);
		act( () => expect( result.current.beforeSubmit() ).toBe( false ) );
		await act( async () => {
			window.dispatchEvent( new Event( 'focus' ) );
		} );
		act( () => expect( result.current.beforeSubmit() ).toBe( false ) );
		await act( async () => jest.advanceTimersByTime( 1000 ) );
		expect( result.current.trailingActions ).toBeUndefined();
		expect( result.current.beforeSubmit() ).toBe( true );
		await receive( exhausted() );
		jest.setSystemTime( new Date( '2026-10-01T00:00:00Z' ) );
		// Timers can be throttled in a hidden tab; the submit gate also checks expiry.
		act( () => expect( result.current.beforeSubmit() ).toBe( true ) );
		expect( fetchMock ).not.toHaveBeenCalled();
	} );

	it( 'draws a zero a reply brought while hidden as soon as the chat reopens, since it can’t read', async () => {
		const view = renderCredits( { isOpen: false } );
		await receive( exhausted() );
		view.rerender( defaultOptions );
		await flush();
		expect( props( view.result.current ).status.remaining ).toBe( 0 );
		expect( fetchMock ).not.toHaveBeenCalled();
	} );
} );
describe( 'the dev mode gate', () => {
	afterEach( () => {
		delete ( window as { agentsManagerData?: unknown } ).agentsManagerData;
	} );

	it.each( [
		[ 'never reads outside dev mode', { isDevMode: false }, 0 ],
		[
			'never reads outside dev mode, even for an Automattician',
			{ isDevMode: false, isA11n: true },
			0,
		],
		[ 'reads in dev mode', { isDevMode: true }, 1 ],
		[
			'reads in dev mode for someone who isn’t an Automattician',
			{ isDevMode: true, isA11n: false },
			1,
		],
		[ 'reads when the host leaves the flag out', {}, 1 ],
		[ 'reads with no host data, like Calypso', undefined, 1 ],
	] )( '%s', async ( _name, inlineData, reads ) => {
		( window as { agentsManagerData?: unknown } ).agentsManagerData = inlineData;
		fetchMock.mockResolvedValueOnce( response( creditSnapshot( { plan_tier: 'personal' } ) ) );
		renderCredits();
		await flush();
		expect( fetchMock ).toHaveBeenCalledTimes( reads );
	} );
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
			expect( result.current.notice?.message ).toBe( 'You’ve used all your site credits.' );
			expect( result.current.notice?.action ).toBeUndefined();
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
	expect( fetchMock ).toHaveBeenCalledTimes( 1 );
	mockIsProcessing = false;
	view.rerender( defaultOptions );
	await flush();
	expect( props( view.result.current ).status.remaining ).toBe( 2450 );
} );
it.each( [
	[ 'the opening read was aborted by the task', false ],
	[ 'the chat opened during the task', true ],
] )(
	'reads who may buy after a task delivers the balance when %s',
	async ( _case, openedMidTask ) => {
		mockIsProcessing = openedMidTask;
		const view = renderCredits();
		await flush();
		mockIsProcessing = true;
		view.rerender( defaultOptions );
		const openingReads = openedMidTask ? 0 : 1;
		expect( fetchMock ).toHaveBeenCalledTimes( openingReads );
		expect( fetchMock.mock.calls.every( ( [ , init ] ) => init.signal.aborted ) ).toBe( true );
		await receive( creditSnapshot( { plan_tier: 'personal' } ) );
		expect( props( view.result.current ).status.remaining ).toBe( 2450 );
		expect( props( view.result.current ).action?.href ).toBeUndefined();
		const read = deferred< ReturnType< typeof response > >();
		fetchMock.mockReturnValueOnce( read.promise );
		mockIsProcessing = false;
		view.rerender( defaultOptions );
		await flush();
		expect( fetchMock ).toHaveBeenCalledTimes( openingReads + 1 );
		// The terminal balance stays while the read is pending; only the access is missing.
		expect( props( view.result.current ).status.remaining ).toBe( 2450 );
		expect( props( view.result.current ).action?.href ).toBeUndefined();
		read.resolve( response( creditSnapshot( { plan_tier: 'personal' } ) ) );
		await flush();
		expect( props( view.result.current ).action?.href ).toBe( UPGRADE_URL );
		await receive( { ...exhausted(), plan_tier: 'personal' } );
		expect( props( view.result.current ).isOpen ).toBe( true );
		expect( view.result.current.notice?.action?.href ).toBe( UPGRADE_URL );
		expect( fetchMock ).toHaveBeenCalledTimes( openingReads + 1 );
	}
);
it( 'does not read again after a task when the opening read already said who may buy', async () => {
	fetchMock.mockResolvedValueOnce( response( creditSnapshot( { plan_tier: 'personal' } ) ) );
	const view = renderCredits();
	await flush();
	expect( fetchMock ).toHaveBeenCalledTimes( 1 );
	mockIsProcessing = true;
	view.rerender( defaultOptions );
	await receive( { ...exhausted(), plan_tier: 'personal' } );
	mockIsProcessing = false;
	view.rerender( defaultOptions );
	await flush();
	expect( fetchMock ).toHaveBeenCalledTimes( 1 );
	expect( props( view.result.current ).status.remaining ).toBe( 0 );
	expect( props( view.result.current ).isOpen ).toBe( true );
	expect( props( view.result.current ).action?.href ).toBe( UPGRADE_URL );
	expect( view.result.current.notice?.action?.href ).toBe( UPGRADE_URL );
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
	expect( result.current.notice?.action ).toBeUndefined();
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
		expect( result.current.notice?.message ).toBe( 'You’ve used all your site credits.' );
		expect( result.current.notice?.dismissible ).toBe( false );
		expect( result.current.notice?.onDismiss ).toBeUndefined();
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
	'keeps the meter and its open popover visible during a %s refresh',
	async ( event ) => {
		const read = deferred< ReturnType< typeof response > >();
		fetchMock
			.mockResolvedValueOnce( response( creditSnapshot() ) )
			.mockReturnValueOnce( read.promise );
		const { result } = renderCredits();
		await flush();
		// Clicking the meter can focus the sidebar's window before opening the popover.
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
it( 'confirms, on reopening, a zero last shown before minimising', async () => {
	fetchMock.mockResolvedValueOnce( response( creditSnapshot() ) );
	const view = renderCredits();
	await flush();
	fetchMock.mockResolvedValueOnce( response( exhausted() ) );
	act( () => window.dispatchEvent( new Event( 'focus' ) ) );
	await flush();
	expect( view.result.current.notice ).toBeDefined();

	view.rerender( { ...defaultOptions, isOpen: false } );
	fetchMock.mockResolvedValueOnce( response( creditSnapshot() ) );
	view.rerender( defaultOptions );
	expect( view.result.current.trailingActions ).toBeUndefined();
	expect( view.result.current.notice ).toBeUndefined();

	await flush();
	expect( props( view.result.current ).status.remaining ).toBe( 2450 );
	expect( view.result.current.notice?.dismissible ).toBe( true );
} );
it( 'confirms a second zero that arrived while minimised before drawing it again', async () => {
	fetchMock.mockResolvedValueOnce( response( creditSnapshot() ) );
	const view = renderCredits();
	await flush();
	view.rerender( { ...defaultOptions, isOpen: false } );
	await receive( exhausted() );
	await receive( exhausted() );

	fetchMock.mockResolvedValueOnce( response( creditSnapshot() ) );
	view.rerender( defaultOptions );
	expect( view.result.current.trailingActions ).toBeUndefined();
	await flush();
	expect( props( view.result.current ).status.remaining ).toBe( 2450 );
} );
it( 'blocks a send while the reopening read confirms a zero', async () => {
	fetchMock.mockResolvedValueOnce( response( creditSnapshot() ) );
	const view = renderCredits();
	await flush();
	view.rerender( { ...defaultOptions, isOpen: false } );
	await receive( exhausted() );

	const read = deferred< ReturnType< typeof response > >();
	fetchMock.mockReturnValueOnce( read.promise );
	view.rerender( defaultOptions );
	act( () => expect( view.result.current.beforeSubmit() ).toBe( false ) );

	await act( async () => read.resolve( response( creditSnapshot() ) ) );
	act( () => expect( view.result.current.beforeSubmit() ).toBe( true ) );
} );
it( 'draws a turn’s zero on reopening once the turn ends, without another read', async () => {
	fetchMock.mockResolvedValueOnce( response( creditSnapshot() ) );
	const view = renderCredits();
	await flush();
	mockIsProcessing = true;
	view.rerender( { ...defaultOptions, isOpen: false } );
	await receive( exhausted() );

	view.rerender( defaultOptions );
	expect( view.result.current.trailingActions ).toBeUndefined();
	mockIsProcessing = false;
	view.rerender( defaultOptions );
	await flush();
	expect( props( view.result.current ).status.remaining ).toBe( 0 );
	expect( fetchMock ).toHaveBeenCalledTimes( 1 );
} );
it( 'keeps drawing a balance above 0 while the reopening read runs', async () => {
	fetchMock.mockResolvedValueOnce( response( creditSnapshot() ) );
	const view = renderCredits();
	await flush();
	view.rerender( { ...defaultOptions, isOpen: false } );
	view.rerender( defaultOptions );
	expect( props( view.result.current ).status.remaining ).toBe( 2450 );
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
describe( 'credits Tracks events', () => {
	// Recorded notice states last for the page, so each case uses its own user.
	let nextUserId = 1000;
	const freshScope = ( overrides: Partial< AgentConfig > = {} ) => {
		const scopedUserId = nextUserId++;
		return {
			userId: scopedUserId,
			agentConfig: {
				...agentConfig,
				...overrides,
				authenticationScope: { siteId: 123, userId: scopedUserId },
			},
		};
	};
	const creditsEvents = () =>
		jest
			.mocked( recordAgentsManagerTracksEvent )
			.mock.calls.filter( ( [ eventName ] ) => eventName.includes( '_credits_' ) );
	const healthy = () =>
		creditSnapshot( {
			credits_limit: CREDITS_LOW_BALANCE * 2,
			credits_remaining: CREDITS_LOW_BALANCE,
			credits_used: CREDITS_LOW_BALANCE,
			plan_tier: 'business',
		} );
	const base = {
		blog_id: 123,
		site_type: 'none',
		agent_environment: 'none',
		top_up_credits_left: 'none',
	};

	it( 'records the notice once per state, not on re-renders or a repeated state', async () => {
		const scope = freshScope();
		fetchMock.mockResolvedValueOnce( response( low() ) );
		const view = renderCredits( scope );
		await flush();
		view.rerender( { ...defaultOptions, ...scope } );
		expect( creditsEvents() ).toEqual( [
			[
				'calypso_agents_manager_credits_notice_shown',
				{
					...base,
					state: 'low',
					credits_left: 5,
					plan_tier: 'personal',
					user_role: 'admin',
					cta_type: 'upgrade',
					ref: 'wp_ai_credits',
				},
			],
		] );
		await receive( { ...exhausted(), plan_tier: 'personal' } );
		await receive( low() );
		await receive( { ...exhausted(), plan_tier: 'personal' } );
		expect(
			creditsEvents()
				.filter( ( [ name ] ) => name === 'calypso_agents_manager_credits_notice_shown' )
				.map( ( [ , eventProps ] ) => eventProps?.state )
		).toEqual( [ 'low', 'zero' ] );
	} );

	it( 'keeps a recorded notice across a remount and a new conversation, but not for another user', async () => {
		const scope = freshScope();
		fetchMock.mockResolvedValue( response( low() ) );
		const first = renderCredits( scope );
		await flush();
		first.unmount();
		const second = renderCredits( scope );
		await flush();
		second.rerender( {
			...defaultOptions,
			...scope,
			agentConfig: { ...scope.agentConfig, authProvider: jest.fn( authProvider ) },
		} );
		await flush();
		expect( second.result.current.notice ).toBeDefined();
		expect( creditsEvents() ).toHaveLength( 1 );
		renderCredits( freshScope() );
		await flush();
		expect( creditsEvents() ).toHaveLength( 2 );
	} );

	describe( 'outside dev mode', () => {
		beforeEach( () => {
			( window as { agentsManagerData?: unknown } ).agentsManagerData = { isDevMode: false };
		} );
		afterEach( () => {
			delete ( window as { agentsManagerData?: unknown } ).agentsManagerData;
		} );

		it( 'records a turn’s notice with who may buy unknown', async () => {
			fetchMock.mockResolvedValue( response( low() ) );
			renderCredits( freshScope() );
			await flush();
			await receive( low() );
			expect( authProvider ).not.toHaveBeenCalled();
			expect( fetchMock ).not.toHaveBeenCalled();
			expect( creditsEvents() ).toEqual( [
				[
					'calypso_agents_manager_credits_notice_shown',
					{
						...base,
						state: 'low',
						credits_left: 5,
						plan_tier: 'personal',
						user_role: 'none',
						cta_type: 'none',
						ref: 'none',
					},
				],
			] );
		} );
	} );

	describe( 'when a turn’s balance comes before any read says who may buy', () => {
		const lowOn = ( plan_tier: string ) => ( { ...low(), plan_tier } );
		const failedRead = { ok: false, status: 503 };
		// The chat re-renders as agenttic starts and finishes a turn.
		const setProcessing = (
			view: ReturnType< typeof renderCredits >,
			scope: ReturnType< typeof freshScope >,
			isProcessing: boolean
		) => {
			mockIsProcessing = isProcessing;
			view.rerender( { ...defaultOptions, ...scope } );
		};
		const runTurn = async (
			view: ReturnType< typeof renderCredits >,
			scope: ReturnType< typeof freshScope >,
			snapshot: unknown
		) => {
			setProcessing( view, scope, true );
			await receive( snapshot );
			setProcessing( view, scope, false );
			await flush();
		};

		it.each( [
			[ 'upgrade', 'personal', 'the opening read failed' ],
			[ 'top_up', 'business', 'the opening read failed' ],
			[ 'upgrade', 'personal', 'the turn cancelled the opening read' ],
			[ 'top_up', 'business', 'the turn cancelled the opening read' ],
		] as const )(
			'records the %s call to action for a %s plan only once the read after the turn answers, when %s',
			async ( ctaType, plan_tier, cause ) => {
				const scope = freshScope();
				if ( cause === 'the opening read failed' ) {
					fetchMock.mockResolvedValueOnce( failedRead );
				}
				const view = renderCredits( scope );
				await flush();
				const read = deferred< ReturnType< typeof response > >();
				fetchMock.mockReturnValueOnce( read.promise );

				await runTurn( view, scope, lowOn( plan_tier ) );
				expect( view.result.current.notice ).toBeDefined();
				expect( creditsEvents() ).toEqual( [] );

				read.resolve( response( lowOn( plan_tier ) ) );
				await flush();
				expect( creditsEvents() ).toEqual( [
					[
						'calypso_agents_manager_credits_notice_shown',
						{
							...base,
							state: 'low',
							credits_left: 5,
							plan_tier,
							user_role: 'admin',
							cta_type: ctaType,
							ref: 'wp_ai_credits',
						},
					],
				] );
			}
		);

		it.each( [
			[ 'a failed read', () => Promise.resolve( failedRead ) ],
			[ 'a network error', () => Promise.reject( new Error( 'Offline' ) ) ],
		] )(
			'records nothing when the read after the turn ends in %s, since the notice hides',
			async ( _case, read ) => {
				const scope = freshScope();
				fetchMock.mockResolvedValueOnce( failedRead );
				const view = renderCredits( scope );
				await flush();
				fetchMock.mockImplementationOnce( read );

				await runTurn( view, scope, low() );
				expect( view.result.current.notice ).toBeUndefined();
				expect( creditsEvents() ).toEqual( [] );
			}
		);

		it( 'keeps waiting when the next turn cancels the read, and records once the read after that turn answers', async () => {
			const scope = freshScope();
			fetchMock.mockResolvedValueOnce( failedRead );
			const view = renderCredits( scope );
			await flush();
			await runTurn( view, scope, low() );

			setProcessing( view, scope, true );
			await flush();
			expect( fetchMock.mock.calls.at( -1 )?.[ 1 ].signal.aborted ).toBe( true );
			expect( creditsEvents() ).toEqual( [] );

			fetchMock.mockResolvedValueOnce( response( low() ) );
			await receive( low() );
			setProcessing( view, scope, false );
			await flush();
			expect( creditsEvents() ).toEqual( [
				[
					'calypso_agents_manager_credits_notice_shown',
					expect.objectContaining( { state: 'low', user_role: 'admin', cta_type: 'upgrade' } ),
				],
			] );
		} );
	} );

	it( 'waits until the chat draws the notice', async () => {
		const scope = freshScope();
		fetchMock.mockResolvedValueOnce( response( low() ) );
		const view = renderCredits( { ...scope, isNoticeVisible: false } );
		await flush();
		expect( view.result.current.notice ).toBeDefined();
		expect( creditsEvents() ).toEqual( [] );
		view.rerender( { ...defaultOptions, ...scope, isNoticeVisible: true } );
		expect( creditsEvents() ).toHaveLength( 1 );
	} );

	it.each( [
		[ true, true, 'admin', 'upgrade', 'wp_ai_credits' ],
		[ false, false, 'non_admin', 'contact_admin', 'none' ],
		[ true, false, 'admin', 'contact_plan_owner', 'none' ],
		[ null, null, 'none', 'none', 'none' ],
	] as const )(
		'records who may buy (%p, %p) as %s with the %s call to action the notice shows, and ref %s',
		async ( canBuyCredits, canUpgrade, userRole, ctaType, ref ) => {
			fetchMock.mockResolvedValueOnce( response( low(), canBuyCredits, canUpgrade ) );
			renderCredits( freshScope() );
			await flush();
			expect( creditsEvents() ).toEqual( [
				[
					'calypso_agents_manager_credits_notice_shown',
					expect.objectContaining( { user_role: userRole, cta_type: ctaType, ref } ),
				],
			] );
		}
	);

	it.each( [ 'business', 'commerce' ] as const )(
		'records the Add credits call to action on %s',
		async ( plan_tier ) => {
			fetchMock.mockResolvedValueOnce( response( { ...low(), plan_tier }, true, false ) );
			renderCredits( freshScope() );
			await flush();
			expect( creditsEvents() ).toEqual( [
				[
					'calypso_agents_manager_credits_notice_shown',
					expect.objectContaining( {
						plan_tier,
						user_role: 'admin',
						cta_type: 'top_up',
						ref: 'wp_ai_credits',
					} ),
				],
			] );
		}
	);

	it( 'sends the client context environment unchanged and the tier as none when unknown', async () => {
		fetchMock.mockResolvedValueOnce( response( { ...low(), plan_tier: undefined } ) );
		renderCredits(
			freshScope( {
				contextProvider: { getClientContext: () => ( { environment: 'site-editor' } ) },
			} )
		);
		await flush();
		expect( creditsEvents()[ 0 ][ 1 ] ).toMatchObject( {
			agent_environment: 'site-editor',
			plan_tier: 'none',
		} );
	} );

	it( 'sends the editor’s site type when the page sets it', async () => {
		window._currentSiteType = 'atomic';
		try {
			fetchMock.mockResolvedValueOnce( response( low() ) );
			renderCredits( freshScope() );
			await flush();
			expect( creditsEvents()[ 0 ][ 1 ] ).toMatchObject( { site_type: 'atomic' } );
		} finally {
			delete window._currentSiteType;
		}
	} );

	describe( 'the top-ups balance', () => {
		const lowOnBusiness = () => ( { ...low(), plan_tier: 'business' as const } );
		const withPacks = ( snapshot: ReturnType< typeof creditSnapshot >, remaining: number ) => ( {
			...snapshot,
			credits_available: snapshot.credits_remaining + remaining,
			top_up_credits_purchased: 100000,
			top_up_credits_used: 100000 - remaining,
			top_up_credits_remaining: remaining,
		} );
		const topUpsLeft = () =>
			creditsEvents().map( ( [ name, eventProps ] ) => [ name, eventProps?.top_up_credits_left ] );

		it.each( [
			[ 'the packs left', withPacks( lowOnBusiness(), 3000 ), 3000 ],
			[ '0 for used-up packs', withPacks( lowOnBusiness(), 0 ), 0 ],
			[ 'none without packs', lowOnBusiness(), 'none' ],
			[
				'none when purchases are unreadable',
				{
					...lowOnBusiness(),
					top_up_credits_purchased: null,
					top_up_credits_used: 0,
					top_up_credits_remaining: null,
				},
				'none',
			],
		] )( 'sends %s on every credits event', async ( _case, snapshot, topUpCreditsLeft ) => {
			fetchMock.mockResolvedValueOnce( response( snapshot ) );
			const { result } = renderCredits( freshScope() );
			await flush();
			act( () => result.current.notice?.action?.onClick?.() );
			act( () => result.current.notice?.onDismiss?.() );
			act( () => props( result.current ).onToggle( true ) );
			expect( topUpsLeft() ).toEqual( [
				[ 'calypso_agents_manager_credits_notice_shown', topUpCreditsLeft ],
				[ 'calypso_agents_manager_credits_cta_clicked', topUpCreditsLeft ],
				[ 'calypso_agents_manager_credits_notice_dismissed', topUpCreditsLeft ],
				[ 'calypso_agents_manager_credits_meter_opened', topUpCreditsLeft ],
			] );
		} );

		it( 'sends 0 when the popover opens at zero after the plan and the packs run out', async () => {
			fetchMock.mockResolvedValueOnce( response( withPacks( lowOnBusiness(), 3000 ) ) );
			const { result } = renderCredits( freshScope() );
			await flush();
			await receive( withPacks( { ...exhausted(), plan_tier: 'business' }, 0 ) );
			act( () => expect( result.current.beforeSubmit() ).toBe( false ) );
			expect(
				creditsEvents()
					.filter( ( [ name ] ) => name === 'calypso_agents_manager_credits_meter_opened' )
					.map( ( [ , eventProps ] ) => [ eventProps?.trigger, eventProps?.top_up_credits_left ] )
			).toEqual( [
				[ 'exhausted', 0 ],
				[ 'submit_blocked', 0 ],
			] );
		} );
	} );

	it( 'records a dismissal once, and nothing from a previous site’s handler', async () => {
		const scope = freshScope();
		fetchMock.mockResolvedValueOnce( response( low() ) );
		const view = renderCredits( scope );
		await flush();
		const oldDismiss = view.result.current.notice?.onDismiss;
		act( () => oldDismiss?.() );
		expect( creditsEvents().at( -1 ) ).toEqual( [
			'calypso_agents_manager_credits_notice_dismissed',
			{ ...base, state: 'low', credits_left: 5, plan_tier: 'personal' },
		] );
		view.rerender( {
			...defaultOptions,
			siteKey: '456',
			userId: scope.userId,
			agentConfig: { ...agentConfig, authenticationScope: { siteId: 456, userId: scope.userId } },
		} );
		await receive( { ...low(), blog_id: 456 } );
		const count = creditsEvents().length;
		act( () => oldDismiss?.() );
		expect( creditsEvents() ).toHaveLength( count );
		expect(
			creditsEvents().filter(
				( [ name ] ) => name === 'calypso_agents_manager_credits_notice_dismissed'
			)
		).toHaveLength( 1 );
	} );

	it( 'records a click on the meter as ok on a healthy balance, only when it opens', async () => {
		fetchMock.mockResolvedValueOnce( response( healthy() ) );
		const { result } = renderCredits( freshScope() );
		await flush();
		expect( result.current.notice ).toBeUndefined();
		act( () => props( result.current ).onToggle( true ) );
		act( () => props( result.current ).onToggle( true ) );
		act( () => props( result.current ).onToggle( false ) );
		expect( creditsEvents() ).toEqual( [
			[
				'calypso_agents_manager_credits_meter_opened',
				{
					...base,
					state: 'ok',
					credits_left: CREDITS_LOW_BALANCE,
					plan_tier: 'business',
					trigger: 'click',
				},
			],
		] );
	} );

	it( 'records every blocked send, even with the popover already open', async () => {
		fetchMock.mockResolvedValueOnce( response( { ...exhausted(), plan_tier: 'personal' } ) );
		const { result } = renderCredits( freshScope() );
		await flush();
		act( () => expect( result.current.beforeSubmit() ).toBe( false ) );
		expect( props( result.current ).isOpen ).toBe( true );
		act( () => expect( result.current.beforeSubmit() ).toBe( false ) );
		const opened = creditsEvents().filter(
			( [ name ] ) => name === 'calypso_agents_manager_credits_meter_opened'
		);
		expect( opened ).toEqual( [
			[
				'calypso_agents_manager_credits_meter_opened',
				{
					...base,
					state: 'zero',
					credits_left: 0,
					plan_tier: 'personal',
					trigger: 'submit_blocked',
				},
			],
			[
				'calypso_agents_manager_credits_meter_opened',
				expect.objectContaining( { trigger: 'submit_blocked' } ),
			],
		] );
	} );

	describe( 'the popover opening by itself', () => {
		const meterOpened = 'calypso_agents_manager_credits_meter_opened';
		const opened = () => creditsEvents().filter( ( [ name ] ) => name === meterOpened );
		const zero = () => ( { ...exhausted(), plan_tier: 'business' } );
		const byItself = [
			meterOpened,
			{ ...base, state: 'zero', credits_left: 0, plan_tier: 'business', trigger: 'exhausted' },
		];
		const byClick = [ meterOpened, expect.objectContaining( { trigger: 'click', state: 'ok' } ) ];
		// A visit that knows a healthy balance, with the chat showing.
		const renderHealthy = async () => {
			const scope = freshScope();
			fetchMock.mockResolvedValueOnce( response( healthy() ) );
			const view = renderCredits( scope );
			await flush();
			const showChat = ( isOpen: boolean, overrides = {} ) =>
				view.rerender( { ...defaultOptions, ...scope, ...overrides, isOpen } );
			const isPopoverOpen = () => props( view.result.current )?.isOpen;
			return { scope, view, showChat, isPopoverOpen };
		};

		it( 'records once when a reply uses the last credits with the chat showing', async () => {
			const { showChat, isPopoverOpen } = await renderHealthy();
			await receive( zero() );
			expect( isPopoverOpen() ).toBe( true );
			expect( opened() ).toEqual( [ byItself ] );
			showChat( false );
			showChat( true );
			expect( opened() ).toEqual( [ byItself ] );
		} );

		it( 'keeps the chat’s config while the popover opens by itself, by a click and closes', async () => {
			const { view, isPopoverOpen } = await renderHealthy();
			const config = mockConfig;
			act( () => props( view.result.current ).onToggle( true ) );
			act( () => props( view.result.current ).onToggle( false ) );
			await receive( zero() );
			expect( isPopoverOpen() ).toBe( true );
			expect( mockConfig ).toBe( config );
		} );

		it.each( [ 'chat opening', 'window focus' ] )(
			'records once when the check run on %s finds 0, after credits were used elsewhere',
			async ( when ) => {
				const { showChat, isPopoverOpen } = await renderHealthy();
				if ( when === 'chat opening' ) {
					showChat( false );
					fetchMock.mockResolvedValueOnce( response( zero() ) );
					showChat( true );
				} else {
					fetchMock.mockResolvedValueOnce( response( zero() ) );
					act( () => window.dispatchEvent( new Event( 'focus' ) ) );
				}
				await flush();
				expect( isPopoverOpen() ).toBe( true );
				expect( opened() ).toEqual( [ byItself ] );
			}
		);

		it( 'waits while a reply’s 0 opens it with the chat hidden, then records once when the opening read confirms it', async () => {
			const { view, showChat, isPopoverOpen } = await renderHealthy();
			showChat( false );
			await receive( zero() );
			expect( isPopoverOpen() ).toBe( true );
			expect( opened() ).toEqual( [] );
			fetchMock.mockResolvedValueOnce( response( zero() ) );
			showChat( true );
			expect( view.result.current.trailingActions ).toBeUndefined();
			expect( view.result.current.notice ).toBeUndefined();
			expect( opened() ).toEqual( [] );
			await flush();
			expect( isPopoverOpen() ).toBe( true );
			expect( view.result.current.notice?.message ).toBe( 'You’ve used all your site credits.' );
			expect( opened() ).toEqual( [ byItself ] );
			showChat( false );
			showChat( true );
			await flush();
			expect( opened() ).toEqual( [ byItself ] );
		} );

		it( 'draws credits bought elsewhere on reopening, with no popover and no event', async () => {
			const { view, showChat, isPopoverOpen } = await renderHealthy();
			showChat( false );
			await receive( zero() );
			fetchMock.mockResolvedValueOnce( response( healthy() ) );
			showChat( true );
			await flush();
			expect( isPopoverOpen() ).toBe( false );
			expect( view.result.current.notice ).toBeUndefined();
			expect( props( view.result.current ).status.remaining ).toBe( CREDITS_LOW_BALANCE );
			expect( opened() ).toEqual( [] );
		} );

		it( 'records nothing when the opening read fails after a reply’s 0 while hidden', async () => {
			const { view, showChat } = await renderHealthy();
			showChat( false );
			await receive( zero() );
			fetchMock.mockRejectedValueOnce( new TypeError( 'Failed to fetch' ) );
			showChat( true );
			await flush();
			expect( view.result.current.trailingActions ).toBeUndefined();
			expect( opened() ).toEqual( [] );
		} );

		it( 'records again when credits return and a later reply uses them up', async () => {
			const { isPopoverOpen } = await renderHealthy();
			await receive( zero() );
			await receive( healthy() );
			expect( isPopoverOpen() ).toBe( false );
			await receive( zero() );
			expect( opened() ).toEqual( [ byItself, byItself ] );
		} );

		it.each( [
			[ 'closes a popover that opened by itself', false ],
			[ 'keeps a popover opened by a click', true ],
		] )( '%s once a read finds credits again', async ( _case, openedByClick ) => {
			const { view, isPopoverOpen } = await renderHealthy();
			if ( openedByClick ) {
				act( () => props( view.result.current ).onToggle( true ) );
			}
			await receive( zero() );
			expect( isPopoverOpen() ).toBe( true );
			fetchMock.mockResolvedValueOnce( response( healthy() ) );
			act( () => window.dispatchEvent( new Event( 'focus' ) ) );
			await flush();
			expect( isPopoverOpen() ).toBe( openedByClick );
		} );

		it.each( [ 'a reply without a balance', 'the period resetting' ] )(
			'records nothing when %s closes it before the chat is shown',
			async ( cause ) => {
				const { view, showChat, isPopoverOpen } = await renderHealthy();
				showChat( false );
				await receive( zero() );
				expect( isPopoverOpen() ).toBe( true );
				if ( cause === 'a reply without a balance' ) {
					await receive( undefined );
				} else {
					act( () => jest.advanceTimersByTime( 10 * 24 * 60 * 60 * 1000 ) );
				}
				expect( view.result.current.trailingActions ).toBeUndefined();
				showChat( true );
				expect( opened() ).toEqual( [] );
			}
		);

		it.each( [ 'site', 'user', 'agent' ] )(
			'records nothing when the %s changes before the chat is shown',
			async ( changed ) => {
				const { scope, showChat, isPopoverOpen } = await renderHealthy();
				const other = freshScope();
				const overrides = {
					site: {
						siteKey: '456',
						agentConfig: {
							...scope.agentConfig,
							authenticationScope: { siteId: 456, userId: scope.userId },
						},
					},
					user: other,
					agent: { agentConfig: { ...scope.agentConfig, agentId: 'other-agent' } },
				}[ changed ];
				showChat( false );
				await receive( zero() );
				expect( isPopoverOpen() ).toBe( true );
				showChat( false, overrides );
				await receive( { ...healthy(), blog_id: changed === 'site' ? 456 : 123 } );
				showChat( true, overrides );
				// Only the orchestrator has live credits, so another agent draws no meter at all.
				expect( isPopoverOpen() ).not.toBe( true );
				// Returning to the first site, user or agent starts a new visit, so the old opening can't come back.
				showChat( false );
				showChat( true );
				expect( opened() ).toEqual( [] );
			}
		);

		it.each( [ 'showing', 'hidden' ] )(
			'records nothing when the popover was already open as a reply used the last credits, with the chat %s',
			async ( chat ) => {
				const { view, showChat, isPopoverOpen } = await renderHealthy();
				act( () => props( view.result.current ).onToggle( true ) );
				showChat( chat === 'showing' );
				await receive( zero() );
				fetchMock.mockResolvedValueOnce( response( zero() ) );
				showChat( true );
				await flush();
				expect( isPopoverOpen() ).toBe( true );
				expect( opened() ).toEqual( [ byClick ] );
			}
		);

		it( 'records nothing for a visit that starts at 0', async () => {
			const scope = freshScope();
			fetchMock.mockResolvedValueOnce( response( zero() ) );
			const view = renderCredits( scope );
			await flush();
			await receive( zero() );
			fetchMock.mockResolvedValueOnce( response( zero() ) );
			view.rerender( { ...defaultOptions, ...scope, isOpen: false } );
			view.rerender( { ...defaultOptions, ...scope, isOpen: true } );
			await flush();
			expect( props( view.result.current ).isOpen ).toBe( false );
			expect( opened() ).toEqual( [] );
		} );

		// Deciding on the render's closed popover would drop the opening queued after the close.
		it.each( [ 'showing', 'hidden' ] )(
			'records an opening queued in the same batch that closed the popover, with the chat %s',
			async ( chat ) => {
				const { view, showChat, isPopoverOpen } = await renderHealthy();
				act( () => props( view.result.current ).onToggle( true ) );
				showChat( chat === 'showing' );
				act( () => {
					props( view.result.current ).onToggle( false );
					void mockConfig.onTaskUpdate?.( terminal( zero() ) );
				} );
				expect( isPopoverOpen() ).toBe( true );
				fetchMock.mockResolvedValue( response( zero() ) );
				showChat( true );
				await flush();
				showChat( false );
				showChat( true );
				await flush();
				expect( opened() ).toEqual( [ byClick, byItself ] );
			}
		);
	} );

	it( 'records nothing without a live balance', async () => {
		const { result } = renderCredits( { ...freshScope(), siteKey: '456' } );
		await flush();
		expect( result.current.trailingActions ).toBeUndefined();
		act( () => expect( result.current.beforeSubmit() ).toBe( true ) );
		expect( creditsEvents() ).toEqual( [] );
	} );

	describe( 'purchase clicks', () => {
		const clicked = 'calypso_agents_manager_credits_cta_clicked';
		const clicks = () => creditsEvents().filter( ( [ name ] ) => name === clicked );
		const upgrade = { cta_type: 'upgrade', ref: 'wp_ai_credits', placement: 'none' };

		it( 'records every click on the notice’s link with the balance’s state at the click', async () => {
			fetchMock.mockResolvedValueOnce( response( low() ) );
			const { result } = renderCredits( freshScope() );
			await flush();
			act( () => result.current.notice?.action?.onClick?.() );
			act( () => result.current.notice?.action?.onClick?.() );
			await receive( { ...exhausted(), plan_tier: 'personal' } );
			act( () => result.current.notice?.action?.onClick?.() );
			const lowClick = {
				...base,
				state: 'low',
				credits_left: 5,
				plan_tier: 'personal',
				...upgrade,
			};
			expect( clicks() ).toEqual( [
				[ clicked, lowClick ],
				[ clicked, lowClick ],
				[ clicked, { ...lowClick, state: 'zero', credits_left: 0 } ],
			] );
		} );

		it( 'records an Add credits click on the notice as a top-up', async () => {
			fetchMock.mockResolvedValueOnce( response( { ...low(), plan_tier: 'commerce' } ) );
			const { result } = renderCredits( freshScope() );
			await flush();
			expect( result.current.notice?.action?.label ).toBe( 'Add credits' );
			act( () => result.current.notice?.action?.onClick?.() );
			expect( clicks() ).toEqual( [
				[
					clicked,
					{
						...base,
						state: 'low',
						credits_left: 5,
						plan_tier: 'commerce',
						cta_type: 'top_up',
						ref: 'wp_ai_credits',
						placement: 'none',
					},
				],
			] );
		} );

		it.each( [
			[ 'Upgrade', 'premium', 'upgrade' ],
			[ 'Add credits', 'business', 'top_up' ],
		] as const )(
			'records a click on the popover’s %s link, as ok on a healthy balance',
			async ( label, plan_tier, ctaType ) => {
				fetchMock.mockResolvedValueOnce( response( { ...healthy(), plan_tier } ) );
				const { result } = renderCredits( freshScope() );
				await flush();
				expect( result.current.notice ).toBeUndefined();
				expect( props( result.current ).action?.label ).toBe( label );
				act( () => props( result.current ).action?.onClick?.() );
				expect( clicks() ).toEqual( [
					[
						clicked,
						{
							...base,
							state: 'ok',
							credits_left: CREDITS_LOW_BALANCE,
							plan_tier,
							cta_type: ctaType,
							ref: 'wp_ai_credits',
							placement: 'none',
						},
					],
				] );
			}
		);

		describe( 'after a refusal', () => {
			const zeroClick = {
				...base,
				state: 'zero',
				credits_left: 0,
				plan_tier: 'business',
				cta_type: 'top_up',
				ref: 'wp_ai_credits',
			};
			const refused = async () => {
				fetchMock.mockResolvedValueOnce( response( low( 'business' ) ) );
				const { result } = renderCredits( freshScope() );
				await flush();
				await refuse( { ...exhausted( true ), plan_tier: 'business' } );
				return result;
			};

			it( 'records a click on the refusal notice’s link with its placement', async () => {
				const result = await refused();
				act( () => result.current.refusalNotice?.action?.onClick?.() );
				expect( clicks() ).toEqual( [ [ clicked, { ...zeroClick, placement: 'refusal' } ] ] );
			} );

			it( 'records a click on the held refusal notice’s link with the balance it last showed', async () => {
				const result = await refused();
				fetchMock.mockResolvedValueOnce( { ok: false, json: async () => ( {} ) } );
				act( () => window.dispatchEvent( new Event( 'focus' ) ) );
				await flush();
				expect( result.current.trailingActions ).toBeUndefined();
				act( () => result.current.refusalNotice?.action?.onClick?.() );
				expect( clicks() ).toEqual( [ [ clicked, { ...zeroClick, placement: 'refusal' } ] ] );
			} );

			it( 'records clicks on the notice’s and popover’s links with placement none', async () => {
				const result = await refused();
				act( () => result.current.notice?.action?.onClick?.() );
				act( () => props( result.current ).action?.onClick?.() );
				expect( clicks() ).toEqual( [
					[ clicked, { ...zeroClick, placement: 'none' } ],
					[ clicked, { ...zeroClick, placement: 'none' } ],
				] );
			} );
		} );

		it( 'records the exhausted notice once when a refusal drains the balance', async () => {
			const scope = freshScope();
			fetchMock.mockResolvedValueOnce( response( low( 'business' ) ) );
			const view = renderCredits( scope );
			await flush();
			await refuse( { ...exhausted( true ), plan_tier: 'business' } );
			view.rerender( { ...defaultOptions, ...scope } );
			expect(
				creditsEvents()
					.filter( ( [ name ] ) => name === 'calypso_agents_manager_credits_notice_shown' )
					.map( ( [ , eventProps ] ) => ( eventProps as { state: string } ).state )
			).toEqual( [ 'low', 'zero' ] );
		} );

		it( 'records the low notice once it shows, not while the credits-back notice covers it', async () => {
			const scope = freshScope();
			const shownStates = () =>
				creditsEvents()
					.filter( ( [ name ] ) => name === 'calypso_agents_manager_credits_notice_shown' )
					.map( ( [ , eventProps ] ) => ( eventProps as { state: string } ).state );
			fetchMock.mockResolvedValueOnce( response( healthy() ) );
			const view = renderCredits( scope );
			await flush();
			await refuse( { ...exhausted( true ), plan_tier: 'business' } );
			fetchMock.mockResolvedValueOnce( response( low( 'business' ) ) );
			act( () => window.dispatchEvent( new Event( 'focus' ) ) );
			await flush();
			expect( view.result.current.notice?.message ).toBe( 'Your site has credits again.' );
			expect( view.result.current.refusalNotice?.title ).toBe( 'Your message wasn’t sent' );
			expect( shownStates() ).toEqual( [ 'zero' ] );
			mockIsProcessing = true;
			view.rerender( { ...defaultOptions, ...scope } );
			expect( shownStates() ).toEqual( [ 'zero', 'low' ] );
		} );

		it( 'records nothing from a previous site’s links', async () => {
			const scope = freshScope();
			fetchMock.mockResolvedValueOnce( response( low() ) );
			const view = renderCredits( scope );
			await flush();
			const oldNoticeClick = view.result.current.notice?.action?.onClick;
			const oldMeterClick = props( view.result.current ).action?.onClick;
			expect( oldNoticeClick ).toBeDefined();
			expect( oldMeterClick ).toBeDefined();
			view.rerender( {
				...defaultOptions,
				siteKey: '456',
				userId: scope.userId,
				agentConfig: { ...agentConfig, authenticationScope: { siteId: 456, userId: scope.userId } },
			} );
			await receive( { ...low(), blog_id: 456 } );
			act( () => {
				oldNoticeClick?.();
				oldMeterClick?.();
			} );
			expect( clicks() ).toEqual( [] );
		} );
	} );
} );

describe( 'refusal code', () => {
	const refusal = failed( [
		{ type: 'text', text: 'You’ve used all your site credits.' },
		{ type: 'data', data: { code: 'ai_credit_allowance_exhausted' } },
	] );

	it( 'keeps the failed reply’s code for one read', async () => {
		const { result } = renderCredits();
		await act( async () => mockConfig.onTaskUpdate?.( refusal ) );
		expect( result.current.takeRefusalCode() ).toBe( 'ai_credit_allowance_exhausted' );
		expect( result.current.takeRefusalCode() ).toBeUndefined();
	} );

	it( 'drops the code once a later reply finishes without one', async () => {
		const { result } = renderCredits();
		await act( async () => mockConfig.onTaskUpdate?.( refusal ) );
		await act( async () =>
			mockConfig.onTaskUpdate?.( { ...refusal, status: { state: 'working' }, final: false } )
		);
		await receive( creditSnapshot() );
		expect( result.current.takeRefusalCode() ).toBeUndefined();
		await act( async () =>
			mockConfig.onTaskUpdate?.( failed( [ { type: 'text', text: 'Oops' } ] ) )
		);
		expect( result.current.takeRefusalCode() ).toBeUndefined();
	} );

	it( 'drops the code when the next turn starts', async () => {
		const view = renderCredits();
		await act( async () => mockConfig.onTaskUpdate?.( refusal ) );
		mockIsProcessing = true;
		view.rerender( defaultOptions );
		expect( view.result.current.takeRefusalCode() ).toBeUndefined();
	} );

	it( 'keeps the code without a live balance, since every chat shows the error', async () => {
		const { result } = renderCredits( { siteKey: '456' } );
		await act( async () => mockConfig.onTaskUpdate?.( refusal ) );
		expect( result.current.takeRefusalCode() ).toBe( 'ai_credit_allowance_exhausted' );
	} );

	describe( 'refusal notice', () => {
		const openThenRefuse = async (
			plan_tier: CreditsPlanTier,
			canBuyCredits?: boolean,
			canUpgrade?: boolean
		) => {
			fetchMock.mockResolvedValueOnce( response( low( plan_tier ), canBuyCredits, canUpgrade ) );
			const view = renderCredits();
			await flush();
			await refuse( { ...exhausted( true ), plan_tier } );
			return view;
		};

		it.each( [
			[ 'business', 'Add credits', ADD_CREDITS_URL, 'Add credits to keep working.' ],
			[ 'personal', 'Upgrade', UPGRADE_URL, 'Upgrade to keep working.' ],
		] as const )(
			'offers the exhausted notice’s action for a %s site the reply was refused for',
			async ( plan_tier, label, href, message ) => {
				const { result } = await openThenRefuse( plan_tier );
				expect( result.current.refusalNotice ).toEqual( {
					icon: false,
					title: 'Your message wasn’t sent',
					message,
					action: {
						label,
						href,
						target: '_blank',
						rel: 'noopener noreferrer',
						onClick: expect.any( Function ),
					},
					dismissible: false,
				} );
			}
		);

		it( 'keeps the composer’s zero notice and its button while the card shows', async () => {
			const { result } = await openThenRefuse( 'business' );
			expect( result.current.notice ).toEqual( {
				icon: false,
				message: 'You’ve used all your site credits.',
				action: expect.objectContaining( { label: 'Add credits', href: ADD_CREDITS_URL } ),
				dismissible: false,
			} );
		} );

		it( 'leaves who to ask to the composer’s notice, and gives the card no link', async () => {
			const { result } = await openThenRefuse( 'business', false );
			expect( result.current.refusalNotice?.message ).toBe( '' );
			expect( result.current.refusalNotice?.action ).toBeUndefined();
			expect( result.current.notice?.message ).toBe(
				'You’ve used all your site credits. Ask a site admin to add more.'
			);
		} );

		it( 'gives the card no link for an admin who didn’t buy the plan', async () => {
			const { result } = await openThenRefuse( 'personal', true, false );
			expect( result.current.refusalNotice?.message ).toBe( '' );
			expect( result.current.refusalNotice?.action ).toBeUndefined();
			expect( result.current.notice?.message ).toBe(
				'You’ve used all your site credits. Ask the plan owner to upgrade.'
			);
		} );

		it.each( [ 'ai_credit_allowance_not_included', 'ai_credit_allowance_unavailable' ] )(
			'leaves a %s refusal to the error text',
			async ( code ) => {
				fetchMock.mockResolvedValueOnce( response( low( 'business' ) ) );
				const { result } = renderCredits();
				await flush();
				await refuse( { ...exhausted( true ), plan_tier: 'business' }, code );
				expect( result.current.notice?.message ).toBe( 'You’ve used all your site credits.' );
				expect( result.current.refusalNotice ).toBeUndefined();
			}
		);

		it( 'has none for a reply that drains the balance without a refusal', async () => {
			fetchMock.mockResolvedValueOnce( response( low( 'business' ) ) );
			const { result } = renderCredits();
			await flush();
			await receive( { ...exhausted(), plan_tier: 'business' } );
			expect( result.current.notice?.message ).toBe( 'You’ve used all your site credits.' );
			expect( result.current.refusalNotice ).toBeUndefined();
		} );

		it( 'has none where credits are off, as in Reader Chat', async () => {
			const { result } = renderCredits( { enabled: false } );
			await refuse( { ...exhausted( true ), plan_tier: 'business' } );
			expect( result.current.refusalNotice ).toBeUndefined();
		} );

		it( 'has none without a live balance', async () => {
			const { result } = renderCredits( { siteKey: '456' } );
			await refuse( { ...exhausted( true ), plan_tier: 'business' } );
			expect( result.current.refusalNotice ).toBeUndefined();
		} );

		it( 'keeps the notice after the code is read, and the code for one read', async () => {
			const { result } = await openThenRefuse( 'business' );
			expect( result.current.takeRefusalCode() ).toBe( 'ai_credit_allowance_exhausted' );
			expect( result.current.takeRefusalCode() ).toBeUndefined();
			expect( result.current.refusalNotice?.action?.label ).toBe( 'Add credits' );
		} );

		it( 'drops the notice when the next turn starts', async () => {
			const view = await openThenRefuse( 'business' );
			expect( view.result.current.refusalNotice ).toBeDefined();
			mockIsProcessing = true;
			view.rerender( defaultOptions );
			expect( view.result.current.refusalNotice ).toBeUndefined();
		} );

		describe( 'once credits are back', () => {
			const backNotice = {
				icon: false,
				message: 'Your site has credits again.',
				action: undefined,
				dismissible: false,
			};
			const question = ( ...content: Array< { type: string; text?: string } > ) => [
				{ id: 'q', role: 'user', content },
			];
			const read = async ( answer: unknown ) => {
				fetchMock.mockResolvedValueOnce( answer );
				act( () => window.dispatchEvent( new Event( 'focus' ) ) );
				await flush();
			};
			const topUp = () => read( response( creditSnapshot( { plan_tier: 'business' } ) ) );

			it( 'says so in the composer’s notice, and keeps the card in the thread', async () => {
				const { result } = await openThenRefuse( 'business' );
				await topUp();
				expect( props( result.current ).status.remaining ).toBe( 2450 );
				expect( result.current.notice ).toEqual( backNotice );
				expect( result.current.refusalNotice?.title ).toBe( 'Your message wasn’t sent' );
				expect( result.current.refusalNotice?.action?.label ).toBe( 'Add credits' );
			} );

			it( 'says so over the low notice on a low balance', async () => {
				const { result } = await openThenRefuse( 'business' );
				await read( response( low( 'business' ) ) );
				expect( result.current.notice ).toEqual( backNotice );
			} );

			it( 'offers Continue, which resends the refused question', async () => {
				const onTryAgain = jest.fn();
				mockMessages = question( { type: 'text', text: 'Make it shorter' } );
				fetchMock.mockResolvedValueOnce( response( low( 'business' ) ) );
				const { result } = renderCredits( { onTryAgain } );
				await flush();
				await refuse( { ...exhausted( true ), plan_tier: 'business' } );
				await topUp();
				expect( result.current.notice?.message ).toBe( 'Your site has credits again.' );
				expect( result.current.notice?.action?.label ).toBe( 'Continue' );
				act( () => result.current.notice?.action?.onClick?.() );
				expect( onTryAgain ).toHaveBeenCalledWith( 'Make it shorter' );
			} );

			it( 'offers no Continue for a question with images, which is asked again by hand', async () => {
				mockMessages = question( { type: 'text', text: 'Match this' }, { type: 'component' } );
				fetchMock.mockResolvedValueOnce( response( low( 'business' ) ) );
				const { result } = renderCredits( { onTryAgain: jest.fn() } );
				await flush();
				await refuse( { ...exhausted( true ), plan_tier: 'business' } );
				await topUp();
				expect( result.current.notice ).toEqual( backNotice );
			} );

			it( 'offers no Continue where the chat can’t resend', async () => {
				mockMessages = question( { type: 'text', text: 'Make it shorter' } );
				const { result } = await openThenRefuse( 'business' );
				await topUp();
				expect( result.current.notice ).toEqual( backNotice );
			} );

			it( 'leaves the popover closed', async () => {
				const { result } = await openThenRefuse( 'business' );
				await topUp();
				expect( props( result.current ).isOpen ).toBe( false );
			} );

			it( 'drops the card when the next turn starts, and the composer shows the balance', async () => {
				const view = await openThenRefuse( 'business' );
				await topUp();
				mockIsProcessing = true;
				view.rerender( defaultOptions );
				expect( view.result.current.refusalNotice ).toBeUndefined();
				expect( view.result.current.notice?.message ).toBe( '2.4k credits left.' );
			} );

			it( 'offers the card again for the next refusal', async () => {
				const view = await openThenRefuse( 'business' );
				await topUp();
				mockIsProcessing = true;
				view.rerender( defaultOptions );
				mockIsProcessing = false;
				view.rerender( defaultOptions );
				await refuse( { ...exhausted( true ), plan_tier: 'business' } );
				expect( view.result.current.refusalNotice?.title ).toBe( 'Your message wasn’t sent' );
				expect( view.result.current.notice?.message ).toBe( 'You’ve used all your site credits.' );
			} );

			it( 'holds nothing over for a next refusal that brings no balance', async () => {
				const view = await openThenRefuse( 'business' );
				await topUp();
				mockIsProcessing = true;
				view.rerender( defaultOptions );
				mockIsProcessing = false;
				view.rerender( defaultOptions );
				await refuse( undefined );
				expect( view.result.current.trailingActions ).toBeUndefined();
				expect( view.result.current.refusalNotice ).toBeUndefined();
			} );

			it( 'drops the notice when the thread empties', async () => {
				const view = await openThenRefuse( 'business' );
				await topUp();
				mockMessages = [];
				view.rerender( defaultOptions );
				expect( view.result.current.refusalNotice ).toBeUndefined();
			} );

			it( 'drops the notice on another site visit', async () => {
				const view = await openThenRefuse( 'business' );
				await topUp();
				view.rerender( {
					...defaultOptions,
					siteKey: '456',
					agentConfig: { ...agentConfig, authenticationScope: { siteId: 456, userId: 1 } },
				} );
				expect( view.result.current.refusalNotice ).toBeUndefined();
			} );

			it.each( [ 'ai_credit_allowance_not_included', 'ai_credit_allowance_unavailable' ] )(
				'still leaves a %s refusal to the error text',
				async ( code ) => {
					fetchMock.mockResolvedValueOnce( response( low( 'business' ) ) );
					const { result } = renderCredits();
					await flush();
					await refuse( { ...exhausted( true ), plan_tier: 'business' }, code );
					await topUp();
					expect( result.current.refusalNotice ).toBeUndefined();
				}
			);

			it( 'keeps the card, and its link, while a read fails', async () => {
				const { result } = await openThenRefuse( 'business' );
				const card = result.current.refusalNotice;
				await read( { ok: false, json: async () => ( {} ) } );
				expect( result.current.trailingActions ).toBeUndefined();
				expect( result.current.refusalNotice ).toBe( card );
				expect( card?.action?.label ).toBe( 'Add credits' );
			} );

			it( 'keeps the card while a read fails, and the composer follows the next read', async () => {
				const { result } = await openThenRefuse( 'business' );
				await topUp();
				const card = result.current.refusalNotice;
				await read( { ok: false, json: async () => ( {} ) } );
				expect( result.current.trailingActions ).toBeUndefined();
				expect( result.current.refusalNotice ).toBe( card );
				expect( result.current.notice ).toBeUndefined();
				await read( response( { ...exhausted(), plan_tier: 'business' } ) );
				expect( result.current.notice?.message ).toBe( 'You’ve used all your site credits.' );
				expect( result.current.notice?.action?.label ).toBe( 'Add credits' );
			} );

			it( 'keeps the card while the period resets, then says so in the composer', async () => {
				fetchMock.mockResolvedValueOnce( response( low( 'business' ) ) );
				const { result } = renderCredits();
				await flush();
				await refuse( {
					...exhausted( true ),
					plan_tier: 'business',
					resets_at: '2026-09-21T12:00:01Z',
				} );
				const reset = deferred< unknown >();
				fetchMock.mockReturnValueOnce( reset.promise );
				await act( async () => jest.advanceTimersByTime( 1000 ) );
				expect( result.current.trailingActions ).toBeUndefined();
				expect( result.current.refusalNotice?.title ).toBe( 'Your message wasn’t sent' );
				reset.resolve( response( creditSnapshot( { plan_tier: 'business' } ) ) );
				await flush();
				expect( result.current.notice ).toEqual( backNotice );
				expect( result.current.refusalNotice?.title ).toBe( 'Your message wasn’t sent' );
			} );
		} );

		it( 'drops the notice on another site visit', async () => {
			const view = await openThenRefuse( 'business' );
			expect( view.result.current.refusalNotice ).toBeDefined();
			view.rerender( {
				...defaultOptions,
				siteKey: '456',
				agentConfig: { ...agentConfig, authenticationScope: { siteId: 456, userId: 1 } },
			} );
			expect( view.result.current.refusalNotice ).toBeUndefined();
		} );

		it( 'keeps the notice when a reply from the previous site ends late', async () => {
			const view = renderCredits();
			const previousSiteConfig = mockConfig;
			view.rerender( {
				...defaultOptions,
				siteKey: '456',
				agentConfig: { ...agentConfig, authenticationScope: { siteId: 456, userId: 1 } },
			} );
			await refuse( { ...exhausted( true ), plan_tier: 'business', blog_id: 456 } );
			expect( view.result.current.refusalNotice ).toBeDefined();

			await act( async () => previousSiteConfig.onTaskUpdate?.( terminal( creditSnapshot() ) ) );
			expect( view.result.current.refusalNotice ).toBeDefined();
		} );

		it( 'drops the notice when the thread empties, leaving the composer’s', async () => {
			const view = await openThenRefuse( 'business' );
			expect( view.result.current.refusalNotice ).toBeDefined();
			mockMessages = [];
			view.rerender( defaultOptions );
			expect( view.result.current.refusalNotice ).toBeUndefined();
			expect( view.result.current.notice?.message ).toBe( 'You’ve used all your site credits.' );
		} );

		it( 'leaves the popover closed when a refusal drains the balance', async () => {
			const { result } = await openThenRefuse( 'business' );
			expect( props( result.current ).status.remaining ).toBe( 0 );
			expect( props( result.current ).isOpen ).toBe( false );
		} );

		it( 'keeps the popover closed once the refusal clears with the balance still 0', async () => {
			const view = await openThenRefuse( 'business' );
			mockIsProcessing = true;
			view.rerender( defaultOptions );
			expect( view.result.current.refusalNotice ).toBeUndefined();
			expect( props( view.result.current ).status.remaining ).toBe( 0 );
			expect( props( view.result.current ).isOpen ).toBe( false );
		} );

		it( 'still opens the popover when a reply drains the balance without a refusal', async () => {
			fetchMock.mockResolvedValueOnce( response( low( 'business' ) ) );
			const { result } = renderCredits();
			await flush();
			await receive( { ...exhausted(), plan_tier: 'business' } );
			expect( props( result.current ).isOpen ).toBe( true );
		} );
	} );
} );
