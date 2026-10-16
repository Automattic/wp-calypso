/**
 * Tests for useAiCredits and its reader of the `ai_credits` snapshot that
 * WordPress.com sends for sites on AI credits.
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { ImageStudioMode } from '../types';
import {
	trackImageStudioCreditsMeterOpened,
	trackImageStudioUpgradeNoticeShown,
	trackImageStudioUpgradeNoticeClick,
} from '../utils/tracking';
import { getSiteCreditsLevel, useAiCredits } from './use-ai-credits';
import type { AuthProvider, TaskUpdate } from '@automattic/agenttic-client';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
	_n: ( single: string, plural: string, count: number ) => ( count === 1 ? single : plural ),
	sprintf: jest.requireActual( '@wordpress/i18n' ).sprintf,
} ) );

// The package root loads the whole chat; its credits helpers are all this hook uses.
jest.mock( '@automattic/agents-manager', () => ( {
	...jest.requireActual( '@automattic/agents-manager/src/utils/credits' ),
	...jest.requireActual( '@automattic/agents-manager/src/utils/live-credits' ),
	...jest.requireActual( '@automattic/agents-manager/src/utils/credits-access' ),
} ) );

jest.mock( '../utils/tracking', () => ( {
	getImageStudioBlogId: jest.requireActual( '../utils/tracking' ).getImageStudioBlogId,
	getImageStudioSiteType: jest.requireActual( '../utils/tracking' ).getImageStudioSiteType,
	getImageStudioIsDevMode: jest.requireActual( '../utils/tracking' ).getImageStudioIsDevMode,
	trackImageStudioCreditsMeterOpened: jest.fn(),
	trackImageStudioUpgradeNoticeShown: jest.fn(),
	trackImageStudioUpgradeNoticeClick: jest.fn(),
} ) );

const BLOG_ID = 123;
const NOTHING = { notice: undefined, isLimitReached: false, isLoading: false };

const planSnapshot = ( remaining: number, overrides: Record< string, unknown > = {} ) => ( {
	schema_version: 1,
	policy_id: 'wpcom-site-plan-period-v1',
	cost_version: 'provider-cost-v1',
	accounting_mode: 'provider_cost',
	reason: 'wpcom_site_plan',
	eligible: true,
	preview: true,
	enforcement: 'site_allowance',
	blog_id: BLOG_ID,
	plan_tier: 'premium',
	credits_limit: 40_000,
	credits_used: 40_000 - remaining,
	credits_remaining: remaining,
	exhausted: remaining === 0,
	blocked: false,
	resets_at: '2026-11-01T00:00:00Z',
	...overrides,
} );

/** The flags WordPress.com sends with the balance for the person who bought the plan. */
const PLAN_BUYER = { can_buy_credits: true, can_upgrade: true };
const SECOND_ADMIN = { can_buy_credits: true, can_upgrade: false };
const EDITOR = { can_buy_credits: false, can_upgrade: false };
const PLAN_OWNER_HINT =
	'This plan was purchased by a different WordPress.com account. To manage this plan, log in to that account or contact the account owner.';

const UPGRADE_URL = 'https://wordpress.com/plans/123?source=wp_ai_credits';
const ADD_CREDITS_URL =
	'https://wordpress.com/checkout/123/ai-credits-lifetime:-q-100000?source=wp_ai_credits';
/** The purchase link; the dot and the notice each add a click handler that records the click. */
const upgradeButton = {
	label: 'Upgrade',
	href: UPGRADE_URL,
	target: '_blank',
	rel: 'noopener noreferrer',
};
const upgradeAction = { ...upgradeButton, onClick: expect.any( Function ) };
const addCreditsButton = { ...upgradeButton, label: 'Add credits', href: ADD_CREDITS_URL };

/** The credit details sent with the notice events, so they join the Agent's credits events. */
const noticeCredits = ( state: 'low' | 'zero', creditsLeft: number ) => ( {
	meter: 'site_credits',
	state,
	planTier: 'premium',
	creditsLeft,
	ctaType: 'upgrade',
	ref: 'wp_ai_credits',
} );
/** The balance details sent when the credits dot's popover opens. */
const meterDetails = ( state: 'ok' | 'low' | 'zero', creditsLeft: number ) => ( {
	meter: 'site_credits',
	state,
	planTier: 'premium',
	creditsLeft,
} );
const meterAt = ( percent: number, isOpen = false ) => ( {
	status: expect.objectContaining( { plan: 'paid', percent } ),
	action: upgradeAction,
	isOpen,
	onToggle: expect.any( Function ),
} );

describe( 'getSiteCreditsLevel', () => {
	it.each( [
		{ name: 'low below 10,000', remaining: 9_999, level: 'low' },
		{ name: 'nothing from 10,000', remaining: 10_000, level: null },
	] )( '$name', ( { remaining, level } ) => {
		expect( getSiteCreditsLevel( remaining ) ).toBe( level );
	} );
} );

describe( 'useAiCredits', () => {
	const authProvider: AuthProvider = async () => ( { Authorization: 'Bearer token' } );
	let fetchMock: jest.Mock;

	const respondWith = ( body: unknown, ok = true ) =>
		fetchMock.mockResolvedValue( { ok, json: async () => body } );

	/** Holds the next credits request open; call the result to answer it. */
	const deferFetch = () => {
		let resolve: ( value: unknown ) => void = () => {};
		fetchMock.mockReturnValueOnce(
			new Promise( ( settle ) => {
				resolve = settle;
			} )
		);
		return ( body: unknown, ok = true ) => resolve( { ok, json: async () => body } );
	};

	const renderCredits = (
		mode = ImageStudioMode.Generate,
		auth: AuthProvider | undefined = authProvider
	) =>
		renderHook(
			( props: { mode: ImageStudioMode; authProvider?: AuthProvider } ) => useAiCredits( props ),
			{ initialProps: { mode, authProvider: auth } }
		);

	/** The hook's state without its callbacks, for whole-state assertions. */
	const stateOf = ( result: { current: ReturnType< typeof useAiCredits > } ) => {
		const { onTaskUpdate, beforeSubmit, ...state } = result.current;
		return state;
	};

	const finalUpdate = ( aiCredits: unknown ) =>
		( {
			id: 'task',
			final: true,
			status: { state: 'completed' },
			text: '',
			aiCredits,
		} ) as TaskUpdate;

	beforeEach( () => {
		jest.clearAllMocks();
		fetchMock = jest.fn();
		window.fetch = fetchMock;
		window.imageStudioData = { blogId: BLOG_ID, siteType: 'simple' };
	} );

	afterEach( () => {
		jest.useRealTimers();
		delete window.imageStudioData;
	} );

	it( 'waits for the agent credentials, then asks WordPress.com for the site balance', async () => {
		respondWith( { ai_credits: planSnapshot( 30_000 ), ...PLAN_BUYER } );

		const { result, rerender } = renderCredits( ImageStudioMode.Generate, undefined );
		expect( fetchMock ).not.toHaveBeenCalled();
		expect( stateOf( result ) ).toEqual( { ...NOTHING, isLoading: true } );

		rerender( { mode: ImageStudioMode.Generate, authProvider } );

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
		expect( fetchMock ).toHaveBeenCalledWith(
			'https://public-api.wordpress.com/wpcom/v2/sites/123/ai/credits',
			expect.objectContaining( { headers: { Authorization: 'Bearer token' } } )
		);
		// Above the low threshold only the dot shows, as in the Agent's chat.
		expect( stateOf( result ) ).toEqual( { ...NOTHING, meter: meterAt( 75 ) } );
	} );

	it( 'shows a persistent notice at zero, and Send opens the dot’s details instead', async () => {
		respondWith( { ai_credits: planSnapshot( 0 ), ...PLAN_BUYER } );

		const { result } = renderCredits( ImageStudioMode.Edit );

		await waitFor( () =>
			expect( stateOf( result ) ).toEqual( {
				notice: {
					icon: false,
					message: 'You’ve used all your site credits.',
					dismissible: false,
					onDismiss: expect.any( Function ),
					action: upgradeAction,
				},
				isLimitReached: true,
				isLoading: false,
				meter: meterAt( 0 ),
			} )
		);
		expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledWith( {
			mode: ImageStudioMode.Edit,
			trigger: 'open',
			...noticeCredits( 'zero', 0 ),
		} );

		result.current.notice?.action?.onClick?.();
		expect( trackImageStudioUpgradeNoticeClick ).toHaveBeenCalledWith( {
			mode: ImageStudioMode.Edit,
			trigger: 'open',
			...noticeCredits( 'zero', 0 ),
		} );

		let canSubmit = true;
		act( () => {
			canSubmit = result.current.beforeSubmit();
		} );
		expect( canSubmit ).toBe( false );
		expect( result.current.meter ).toEqual( meterAt( 0, true ) );
		// The first read at zero stays quiet; only the blocked Send opens the popover.
		expect( trackImageStudioCreditsMeterOpened ).toHaveBeenCalledTimes( 1 );
		expect( trackImageStudioCreditsMeterOpened ).toHaveBeenCalledWith( {
			mode: ImageStudioMode.Edit,
			trigger: 'submit_blocked',
			...meterDetails( 'zero', 0 ),
		} );
	} );

	it( 'records a click on the popover’s Upgrade link as a popover click', async () => {
		respondWith( { ai_credits: planSnapshot( 0 ), ...PLAN_BUYER } );
		const { result } = renderCredits( ImageStudioMode.Edit );
		await waitFor( () => expect( result.current.notice ).toBeDefined() );

		result.current.meter?.action?.onClick?.();
		expect( trackImageStudioUpgradeNoticeClick ).toHaveBeenCalledTimes( 1 );
		expect( trackImageStudioUpgradeNoticeClick ).toHaveBeenCalledWith( {
			mode: ImageStudioMode.Edit,
			trigger: 'popover',
			...noticeCredits( 'zero', 0 ),
		} );
	} );

	it( 'records a popover Upgrade click on a healthy balance as ok', async () => {
		respondWith( { ai_credits: planSnapshot( 30_000 ), ...PLAN_BUYER } );
		const { result } = renderCredits();
		await waitFor( () => expect( result.current.meter ).toBeDefined() );
		expect( result.current.notice ).toBeUndefined();

		result.current.meter?.action?.onClick?.();
		expect( trackImageStudioUpgradeNoticeClick ).toHaveBeenCalledWith( {
			mode: ImageStudioMode.Generate,
			trigger: 'popover',
			meter: 'site_credits',
			state: 'ok',
			planTier: 'premium',
			creditsLeft: 30_000,
			ctaType: 'upgrade',
			ref: 'wp_ai_credits',
		} );
	} );

	it( 'gives the popover no click handler when there is no Upgrade link', async () => {
		respondWith( { ai_credits: planSnapshot( 0 ), ...EDITOR } );
		const { result } = renderCredits();
		await waitFor( () => expect( result.current.notice ).toBeDefined() );

		expect( result.current.meter?.action ).toBeUndefined();
	} );

	it( 'lets Send through and shows the amount left when credits are low', async () => {
		respondWith( { ai_credits: planSnapshot( 6_000 ), ...PLAN_BUYER } );

		const { result } = renderCredits();

		await waitFor( () => expect( result.current.notice ).toBeDefined() );
		expect( result.current.notice ).toMatchObject( {
			message: '6k credits left.',
			dismissible: true,
		} );
		expect( result.current.isLimitReached ).toBe( false );
		expect( result.current.beforeSubmit() ).toBe( true );
		expect( result.current.meter?.isOpen ).toBe( false );
		expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledWith( {
			mode: ImageStudioMode.Generate,
			trigger: 'open',
			...noticeCredits( 'low', 6_000 ),
		} );
	} );

	it( 'uses the singular for the last credit', async () => {
		respondWith( { ai_credits: planSnapshot( 1 ), ...PLAN_BUYER } );

		const { result } = renderCredits();

		await waitFor( () => expect( result.current.notice?.message ).toBe( '1 credit left.' ) );
	} );

	it( 'hides a dismissed low notice until the credits run out', async () => {
		respondWith( { ai_credits: planSnapshot( 6_000 ), ...PLAN_BUYER } );
		const { result } = renderCredits();
		await waitFor( () => expect( result.current.notice ).toBeDefined() );

		act( () => {
			result.current.notice?.onDismiss?.();
		} );
		expect( result.current.notice ).toBeUndefined();

		act( () => {
			result.current.onTaskUpdate( finalUpdate( planSnapshot( 0 ) ) );
		} );
		expect( result.current.notice?.message ).toBe( 'You’ve used all your site credits.' );
		expect( result.current.isLimitReached ).toBe( true );
	} );

	describe.each( [ 'business', 'commerce' ] )( 'on %s', ( planTier ) => {
		it.each( [
			{ who: 'the plan buyer', flags: PLAN_BUYER },
			{ who: 'an admin who didn’t buy the plan', flags: SECOND_ADMIN },
		] )( 'offers $who Add credits and records it as a top-up', async ( { flags } ) => {
			respondWith( { ai_credits: planSnapshot( 0, { plan_tier: planTier } ), ...flags } );
			const { result } = renderCredits( ImageStudioMode.Edit );
			await waitFor( () => expect( result.current.notice ).toBeDefined() );

			expect( result.current.notice ).toMatchObject( {
				message: 'You’ve used all your site credits.',
				action: { ...addCreditsButton, onClick: expect.any( Function ) },
			} );
			expect( result.current.meter?.action ).toEqual( {
				...addCreditsButton,
				onClick: expect.any( Function ),
			} );
			expect( result.current.meter?.purchaseHint ).toBeUndefined();
			const credits = { ...noticeCredits( 'zero', 0 ), planTier, ctaType: 'top_up' };
			expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledWith( {
				mode: ImageStudioMode.Edit,
				trigger: 'open',
				...credits,
			} );

			result.current.notice?.action?.onClick?.();
			expect( trackImageStudioUpgradeNoticeClick ).toHaveBeenCalledWith( {
				mode: ImageStudioMode.Edit,
				trigger: 'open',
				...credits,
			} );

			result.current.meter?.action?.onClick?.();
			expect( trackImageStudioUpgradeNoticeClick ).toHaveBeenLastCalledWith( {
				mode: ImageStudioMode.Edit,
				trigger: 'popover',
				...credits,
			} );
		} );

		it( 'tells someone who can’t buy to ask a site admin, with no Add credits', async () => {
			respondWith( { ai_credits: planSnapshot( 0, { plan_tier: planTier } ), ...EDITOR } );
			const { result } = renderCredits();
			await waitFor( () => expect( result.current.notice ).toBeDefined() );

			expect( result.current.notice?.message ).toBe(
				'You’ve used all your site credits. Ask a site admin to add more.'
			);
			expect( result.current.notice?.action ).toBeUndefined();
			expect( result.current.meter?.action ).toBeUndefined();
			expect( result.current.meter?.purchaseHint ).toBe( 'Ask a site admin to add more.' );
			expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledWith(
				expect.objectContaining( { planTier, ctaType: 'contact_admin', ref: 'none' } )
			);
		} );
	} );

	describe( 'for people who can’t upgrade the plan', () => {
		it.each( [
			{
				who: 'an admin who didn’t buy the plan',
				flags: SECOND_ADMIN,
				zero: 'You’ve used all your site credits. Ask the plan owner to upgrade.',
				low: '6k credits left. Ask the plan owner to upgrade.',
				purchaseHint: PLAN_OWNER_HINT,
				ctaType: 'contact_plan_owner',
			},
			{
				who: 'someone who can’t buy',
				flags: EDITOR,
				zero: 'You’ve used all your site credits. Ask a site admin to add more.',
				low: '6k credits left. Ask a site admin to add more.',
				purchaseHint: 'Ask a site admin to add more.',
				ctaType: 'contact_admin',
			},
		] )(
			'tells $who who to ask, with no Upgrade',
			async ( { flags, zero, low, purchaseHint, ctaType } ) => {
				respondWith( { ai_credits: planSnapshot( 6_000 ), ...flags } );
				const { result } = renderCredits( ImageStudioMode.Edit );
				await waitFor( () => expect( result.current.notice ).toBeDefined() );

				expect( result.current.notice ).toMatchObject( { message: low, dismissible: true } );
				expect( result.current.notice?.action ).toBeUndefined();
				expect( result.current.meter ).toEqual( {
					status: expect.objectContaining( { plan: 'paid', percent: 15 } ),
					purchaseHint,
					isOpen: false,
					onToggle: expect.any( Function ),
				} );
				expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledWith( {
					mode: ImageStudioMode.Edit,
					trigger: 'open',
					...noticeCredits( 'low', 6_000 ),
					ctaType,
					ref: 'none',
				} );

				act( () => {
					result.current.onTaskUpdate( finalUpdate( planSnapshot( 0 ) ) );
				} );
				expect( result.current.notice ).toMatchObject( { message: zero, dismissible: false } );
				expect( result.current.notice?.action ).toBeUndefined();
				expect( result.current.meter?.purchaseHint ).toBe( purchaseHint );
				expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenLastCalledWith( {
					mode: ImageStudioMode.Edit,
					trigger: 'refresh',
					...noticeCredits( 'zero', 0 ),
					ctaType,
					ref: 'none',
				} );
			}
		);

		it.each( [
			{ name: 'sends no flags', flags: {} },
			{
				name: 'can’t tell who bought the plan',
				flags: { can_buy_credits: true, can_upgrade: null },
			},
		] )( 'offers neither Upgrade nor guidance when the server $name', async ( { flags } ) => {
			respondWith( { ai_credits: planSnapshot( 0 ), ...flags } );
			const { result } = renderCredits();
			await waitFor( () => expect( result.current.notice ).toBeDefined() );

			expect( result.current.notice?.message ).toBe( 'You’ve used all your site credits.' );
			expect( result.current.notice?.action ).toBeUndefined();
			expect( result.current.meter?.action ).toBeUndefined();
			expect( result.current.meter?.purchaseHint ).toBeUndefined();
		} );

		it( 'offers neither Add credits nor guidance on Business when the server sends no flags', async () => {
			respondWith( { ai_credits: planSnapshot( 0, { plan_tier: 'business' } ) } );
			const { result } = renderCredits();
			await waitFor( () => expect( result.current.notice ).toBeDefined() );

			expect( result.current.notice?.message ).toBe( 'You’ve used all your site credits.' );
			expect( result.current.notice?.action ).toBeUndefined();
			expect( result.current.meter?.action ).toBeUndefined();
			expect( result.current.meter?.purchaseHint ).toBeUndefined();
		} );

		it( 'keeps who may buy from an opening check that answers after a turn', async () => {
			let resolveFetch: ( value: unknown ) => void = () => {};
			fetchMock.mockReturnValue(
				new Promise( ( resolve ) => {
					resolveFetch = resolve;
				} )
			);
			const { result } = renderCredits();
			await waitFor( () => expect( fetchMock ).toHaveBeenCalled() );

			act( () => {
				result.current.onTaskUpdate( finalUpdate( planSnapshot( 0 ) ) );
			} );
			expect( result.current.notice?.action ).toBeUndefined();
			// Until the check says who may buy, the event can't say whether Upgrade shows.
			expect( trackImageStudioUpgradeNoticeShown ).not.toHaveBeenCalled();

			await act( async () => {
				resolveFetch( {
					ok: true,
					json: async () => ( { ai_credits: planSnapshot( 30_000 ), ...PLAN_BUYER } ),
				} );
			} );

			// The turn's balance stays, and the check still says who may buy.
			expect( result.current.isLimitReached ).toBe( true );
			expect( result.current.notice?.action ).toEqual( upgradeAction );
			expect( result.current.meter?.action?.href ).toBe( UPGRADE_URL );
			expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledTimes( 1 );
			expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledWith( {
				mode: ImageStudioMode.Generate,
				trigger: 'refresh',
				...noticeCredits( 'zero', 0 ),
			} );
		} );

		it( 'records Add credits as a top-up once an opening check answers after a turn', async () => {
			let resolveFetch: ( value: unknown ) => void = () => {};
			fetchMock.mockReturnValue(
				new Promise( ( resolve ) => {
					resolveFetch = resolve;
				} )
			);
			const { result } = renderCredits();
			await waitFor( () => expect( fetchMock ).toHaveBeenCalled() );

			act( () => {
				result.current.onTaskUpdate( finalUpdate( planSnapshot( 0, { plan_tier: 'business' } ) ) );
			} );
			expect( trackImageStudioUpgradeNoticeShown ).not.toHaveBeenCalled();

			await act( async () => {
				resolveFetch( {
					ok: true,
					json: async () => ( {
						ai_credits: planSnapshot( 30_000, { plan_tier: 'business' } ),
						...SECOND_ADMIN,
					} ),
				} );
			} );

			expect( result.current.notice?.action?.href ).toBe( ADD_CREDITS_URL );
			expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledTimes( 1 );
			expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledWith( {
				mode: ImageStudioMode.Generate,
				trigger: 'refresh',
				...noticeCredits( 'zero', 0 ),
				planTier: 'business',
				ctaType: 'top_up',
			} );
		} );

		it( 'records the notice with Upgrade when a slow opening check answers after 5 seconds', async () => {
			jest.useFakeTimers();
			let resolveFetch: ( value: unknown ) => void = () => {};
			fetchMock.mockReturnValue(
				new Promise( ( resolve ) => {
					resolveFetch = resolve;
				} )
			);
			const { result } = renderCredits();
			await act( async () => {} );

			act( () => {
				result.current.onTaskUpdate( finalUpdate( planSnapshot( 6_000 ) ) );
			} );
			act( () => {
				jest.advanceTimersByTime( 5000 );
			} );
			expect( trackImageStudioUpgradeNoticeShown ).not.toHaveBeenCalled();

			await act( async () => {
				resolveFetch( {
					ok: true,
					json: async () => ( { ai_credits: planSnapshot( 30_000 ), ...PLAN_BUYER } ),
				} );
			} );
			expect( result.current.notice?.action ).toEqual( upgradeAction );
			expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledTimes( 1 );
			expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledWith( {
				mode: ImageStudioMode.Generate,
				trigger: 'refresh',
				...noticeCredits( 'low', 6_000 ),
			} );
		} );

		it( 'records the notice with no Upgrade when the opening check fails', async () => {
			let resolveFetch: ( value: unknown ) => void = () => {};
			fetchMock.mockReturnValue(
				new Promise( ( resolve ) => {
					resolveFetch = resolve;
				} )
			);
			const { result } = renderCredits();
			await waitFor( () => expect( fetchMock ).toHaveBeenCalled() );

			act( () => {
				result.current.onTaskUpdate( finalUpdate( planSnapshot( 6_000 ) ) );
			} );
			await act( async () => {
				resolveFetch( { ok: false, json: async () => ( {} ) } );
			} );

			expect( result.current.notice?.action ).toBeUndefined();
			expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledWith( {
				mode: ImageStudioMode.Generate,
				trigger: 'refresh',
				...noticeCredits( 'low', 6_000 ),
				ctaType: 'none',
				ref: 'none',
			} );
		} );

		it( 'checks again after a turn when the opening check failed, and records what it finds', async () => {
			fetchMock.mockResolvedValueOnce( { ok: false, json: async () => ( {} ) } );
			const { result } = renderCredits();
			await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
			expect( fetchMock ).toHaveBeenCalledTimes( 1 );

			const answer = deferFetch();
			act( () => {
				result.current.onTaskUpdate( finalUpdate( planSnapshot( 6_000 ) ) );
			} );
			await waitFor( () => expect( fetchMock ).toHaveBeenCalledTimes( 2 ) );
			expect( trackImageStudioUpgradeNoticeShown ).not.toHaveBeenCalled();

			await act( async () => {
				answer( { ai_credits: planSnapshot( 6_000 ), ...PLAN_BUYER } );
			} );

			expect( result.current.notice?.action ).toEqual( upgradeAction );
			expect( result.current.meter?.action?.href ).toBe( UPGRADE_URL );
			expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledTimes( 1 );
			expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledWith( {
				mode: ImageStudioMode.Generate,
				trigger: 'refresh',
				...noticeCredits( 'low', 6_000 ),
			} );
		} );

		it( 'records the notice with no Upgrade when the check after a turn fails too', async () => {
			fetchMock.mockResolvedValue( { ok: false, json: async () => ( {} ) } );
			const { result } = renderCredits();
			await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

			act( () => {
				result.current.onTaskUpdate( finalUpdate( planSnapshot( 6_000 ) ) );
			} );
			await waitFor( () => expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalled() );

			expect( fetchMock ).toHaveBeenCalledTimes( 2 );
			expect( result.current.notice?.action ).toBeUndefined();
			expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledWith( {
				mode: ImageStudioMode.Generate,
				trigger: 'refresh',
				...noticeCredits( 'low', 6_000 ),
				ctaType: 'none',
				ref: 'none',
			} );
		} );

		it( 'records the latest balance when turns at the same level end before the opening check', async () => {
			const answer = deferFetch();
			const { result } = renderCredits();
			await waitFor( () => expect( fetchMock ).toHaveBeenCalled() );

			act( () => {
				result.current.onTaskUpdate( finalUpdate( planSnapshot( 6_000 ) ) );
			} );
			act( () => {
				result.current.onTaskUpdate( finalUpdate( planSnapshot( 5_000 ) ) );
			} );
			await act( async () => {
				answer( { ai_credits: planSnapshot( 30_000 ), ...PLAN_BUYER } );
			} );

			expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledTimes( 1 );
			expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledWith( {
				mode: ImageStudioMode.Generate,
				trigger: 'refresh',
				...noticeCredits( 'low', 5_000 ),
			} );
		} );

		it( 'records only the latest notice from turns that end before the opening check', async () => {
			let resolveFetch: ( value: unknown ) => void = () => {};
			fetchMock.mockReturnValue(
				new Promise( ( resolve ) => {
					resolveFetch = resolve;
				} )
			);
			const { result } = renderCredits();
			await waitFor( () => expect( fetchMock ).toHaveBeenCalled() );

			act( () => {
				result.current.onTaskUpdate( finalUpdate( planSnapshot( 6_000 ) ) );
			} );
			act( () => {
				result.current.onTaskUpdate( finalUpdate( planSnapshot( 30_000 ) ) );
			} );
			await act( async () => {
				resolveFetch( {
					ok: true,
					json: async () => ( { ai_credits: planSnapshot( 30_000 ), ...PLAN_BUYER } ),
				} );
			} );

			expect( trackImageStudioUpgradeNoticeShown ).not.toHaveBeenCalled();
		} );
	} );

	it.each( [
		{
			name: 'the site is not on AI credits',
			ok: false,
			body: { code: 'ai_credit_allowance_not_available' },
		},
		{ name: 'the answer is unreadable', ok: true, body: { ai_credits: 'nope' } },
		{
			name: 'the balance doesn’t match the Agent’s shape',
			ok: true,
			body: { ai_credits: planSnapshot( 0, { resets_at: 'soon' } ), ...PLAN_BUYER },
		},
		{
			name: 'the site’s plan includes no credits',
			ok: true,
			body: {
				ai_credits: planSnapshot( 0, {
					reason: 'wpcom_no_plan',
					eligible: false,
					plan_tier: 'free',
					credits_limit: 0,
				} ),
			},
		},
	] )( 'shows nothing when $name', async ( { ok, body } ) => {
		respondWith( body, ok );

		const { result } = renderCredits();
		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

		expect( stateOf( result ) ).toEqual( NOTHING );
		expect( trackImageStudioUpgradeNoticeShown ).not.toHaveBeenCalled();
	} );

	it( 'shows nothing and logs when the request fails', async () => {
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		fetchMock.mockRejectedValue( new Error( 'offline' ) );

		const { result } = renderCredits();
		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

		expect( stateOf( result ) ).toEqual( NOTHING );
		expect( consoleError ).toHaveBeenCalled();
		consoleError.mockRestore();
	} );

	describe( 'while the page says it isn’t in dev mode', () => {
		beforeEach( () => {
			window.imageStudioData = { blogId: BLOG_ID, siteType: 'simple', isDevMode: false };
		} );

		it( 'doesn’t ask or hold suggestions back, even before the credentials arrive', async () => {
			const { result, rerender } = renderCredits( ImageStudioMode.Generate, undefined );
			expect( stateOf( result ) ).toEqual( NOTHING );

			rerender( { mode: ImageStudioMode.Generate, authProvider } );
			await act( async () => {} );

			expect( fetchMock ).not.toHaveBeenCalled();
			expect( stateOf( result ) ).toEqual( NOTHING );
		} );

		it( 'shows a turn’s balance, and a turn’s zero blocks Send', async () => {
			const { result } = renderCredits();
			await act( async () => {} );

			act( () => {
				result.current.onTaskUpdate( finalUpdate( planSnapshot( 0 ) ) );
			} );

			expect( result.current.isLimitReached ).toBe( true );
			act( () => {
				expect( result.current.beforeSubmit() ).toBe( false );
			} );
			expect( result.current.meter?.isOpen ).toBe( true );
			expect( fetchMock ).not.toHaveBeenCalled();
		} );

		it( 'records a turn’s notice at once, with no Upgrade, since nobody says who may buy', async () => {
			const { result } = renderCredits();
			await act( async () => {} );

			act( () => {
				result.current.onTaskUpdate( finalUpdate( planSnapshot( 6_000 ) ) );
			} );

			expect( result.current.notice?.action ).toBeUndefined();
			expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledWith( {
				mode: ImageStudioMode.Generate,
				trigger: 'refresh',
				...noticeCredits( 'low', 6_000 ),
				ctaType: 'none',
				ref: 'none',
			} );
		} );

		it( 'keeps the choice it made on opening until it opens again', async () => {
			respondWith( { ai_credits: planSnapshot( 30_000 ), ...PLAN_BUYER } );
			const first = renderCredits();
			window.imageStudioData = { blogId: BLOG_ID, siteType: 'simple', isDevMode: true };
			first.rerender( { mode: ImageStudioMode.Generate, authProvider } );
			await act( async () => {} );
			expect( fetchMock ).not.toHaveBeenCalled();

			first.unmount();
			const second = renderCredits();

			await waitFor( () => expect( second.result.current.meter ).toEqual( meterAt( 75 ) ) );
			expect( fetchMock ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	it.each( [
		[ 'doesn’t ask outside dev mode', { isDevMode: false }, 0 ],
		[
			'doesn’t ask outside dev mode, even for an Automattician',
			{ isDevMode: false, isA11n: true },
			0,
		],
		[ 'asks in dev mode', { isDevMode: true }, 1 ],
		[
			'asks in dev mode for someone who isn’t an Automattician',
			{ isDevMode: true, isA11n: false },
			1,
		],
		[ 'asks when the page leaves the flag out', {}, 1 ],
	] )( '%s', async ( _name, flags, requests ) => {
		window.imageStudioData = { blogId: BLOG_ID, siteType: 'simple', ...flags };
		respondWith( { ai_credits: planSnapshot( 30_000 ) } );

		renderCredits();
		await act( async () => {} );

		expect( fetchMock ).toHaveBeenCalledTimes( requests );
	} );

	it( 'does not ask on a self-hosted site, which can’t be on AI credits', () => {
		window.imageStudioData = { blogId: BLOG_ID, siteType: 'jetpack' };

		const { result } = renderCredits();

		expect( fetchMock ).not.toHaveBeenCalled();
		expect( stateOf( result ) ).toEqual( NOTHING );
	} );

	it( 'does not ask when the page names no site', () => {
		delete window.imageStudioData;

		const { result } = renderCredits();

		expect( fetchMock ).not.toHaveBeenCalled();
		expect( stateOf( result ) ).toEqual( NOTHING );
	} );

	it( 'stops holding suggestions after 5 seconds, and still applies a late answer', async () => {
		jest.useFakeTimers();
		let resolveFetch: ( value: unknown ) => void = () => {};
		fetchMock.mockReturnValue(
			new Promise( ( resolve ) => {
				resolveFetch = resolve;
			} )
		);

		const { result } = renderCredits();
		// Lets the credentials resolve so the request is in flight.
		await act( async () => {} );
		expect( result.current.isLoading ).toBe( true );

		act( () => {
			jest.advanceTimersByTime( 5000 );
		} );
		expect( stateOf( result ) ).toEqual( NOTHING );

		await act( async () => {
			resolveFetch( {
				ok: true,
				json: async () => ( { ai_credits: planSnapshot( 0 ), ...PLAN_BUYER } ),
			} );
		} );

		await waitFor( () => expect( result.current.isLimitReached ).toBe( true ) );
	} );

	it( 'takes the new balance from a turn’s final update, and opens the dot’s details at zero', async () => {
		respondWith( { ai_credits: planSnapshot( 30_000 ), ...PLAN_BUYER } );
		const { result } = renderCredits();
		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

		act( () => {
			result.current.onTaskUpdate( finalUpdate( planSnapshot( 0 ) ) );
		} );

		expect( result.current.isLimitReached ).toBe( true );
		expect( result.current.meter ).toEqual( meterAt( 0, true ) );
		expect( fetchMock ).toHaveBeenCalledTimes( 1 );
		expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledWith( {
			mode: ImageStudioMode.Generate,
			trigger: 'refresh',
			...noticeCredits( 'zero', 0 ),
		} );
		expect( trackImageStudioCreditsMeterOpened ).toHaveBeenCalledWith( {
			mode: ImageStudioMode.Generate,
			trigger: 'exhausted',
			...meterDetails( 'zero', 0 ),
		} );
	} );

	it.each( [
		{ name: 'a running update', final: false, state: 'working' },
		{ name: 'an update that only names a running state', final: undefined, state: 'working' },
	] as const )( 'waits for the turn to end before using $name', async ( { final, state } ) => {
		respondWith( { ai_credits: planSnapshot( 30_000 ), ...PLAN_BUYER } );
		const { result } = renderCredits();
		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

		act( () => {
			result.current.onTaskUpdate( {
				...finalUpdate( planSnapshot( 0 ) ),
				final,
				status: { state },
			} );
		} );

		expect( result.current.isLimitReached ).toBe( false );
		expect( result.current.meter ).toEqual( meterAt( 75 ) );
	} );

	it( 'takes the balance from a failed turn that has no final flag', async () => {
		respondWith( { ai_credits: planSnapshot( 30_000 ), ...PLAN_BUYER } );
		const { result } = renderCredits();
		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

		act( () => {
			result.current.onTaskUpdate( {
				...finalUpdate( planSnapshot( 0 ) ),
				final: undefined,
				status: { state: 'failed' },
			} );
		} );

		expect( result.current.isLimitReached ).toBe( true );
	} );

	it.each( [
		{ name: 'carries no balance', aiCredits: undefined },
		{ name: 'carries an unreadable balance', aiCredits: { nope: true } },
	] )( 'keeps the last known balance when an update $name', async ( { aiCredits } ) => {
		respondWith( { ai_credits: planSnapshot( 6_000 ), ...PLAN_BUYER } );
		const { result } = renderCredits();
		await waitFor( () => expect( result.current.notice ).toBeDefined() );

		act( () => {
			result.current.onTaskUpdate( finalUpdate( aiCredits ) );
		} );

		expect( result.current.notice?.message ).toBe( '6k credits left.' );
	} );

	it( 'keeps a turn’s balance when the opening check answers after it', async () => {
		let resolveFetch: ( value: unknown ) => void = () => {};
		fetchMock.mockReturnValue(
			new Promise( ( resolve ) => {
				resolveFetch = resolve;
			} )
		);
		const { result } = renderCredits();
		await waitFor( () => expect( fetchMock ).toHaveBeenCalled() );

		act( () => {
			result.current.onTaskUpdate( finalUpdate( planSnapshot( 0 ) ) );
		} );
		await act( async () => {
			resolveFetch( {
				ok: true,
				json: async () => ( { ai_credits: planSnapshot( 30_000 ), ...PLAN_BUYER } ),
			} );
		} );

		expect( result.current.isLimitReached ).toBe( true );
		expect( result.current.isLoading ).toBe( false );
		// No balance was known before the turn, so the details stay closed.
		expect( result.current.meter?.isOpen ).toBe( false );
	} );

	it( 'opens the dot’s details when a known balance runs out in the same render', async () => {
		fetchMock.mockReturnValue( new Promise( () => {} ) );
		const { result } = renderCredits();
		await waitFor( () => expect( fetchMock ).toHaveBeenCalled() );

		act( () => {
			result.current.onTaskUpdate( finalUpdate( planSnapshot( 30_000 ) ) );
			result.current.onTaskUpdate( finalUpdate( planSnapshot( 0 ) ) );
		} );

		expect( result.current.meter?.isOpen ).toBe( true );
	} );

	it( 'opens the dot’s details only once when the credits run out', async () => {
		respondWith( { ai_credits: planSnapshot( 30_000 ), ...PLAN_BUYER } );
		const { result } = renderCredits();
		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

		act( () => {
			result.current.onTaskUpdate( finalUpdate( planSnapshot( 0 ) ) );
		} );
		act( () => {
			result.current.meter?.onToggle( false );
		} );
		act( () => {
			result.current.onTaskUpdate( finalUpdate( planSnapshot( 0 ) ) );
		} );

		expect( result.current.meter?.isOpen ).toBe( false );
		expect( trackImageStudioCreditsMeterOpened ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'records a click that opens the popover, but not a close or a repeat', async () => {
		respondWith( { ai_credits: planSnapshot( 30_000 ), ...PLAN_BUYER } );
		const { result } = renderCredits( ImageStudioMode.Edit );
		await waitFor( () => expect( result.current.meter ).toBeDefined() );

		act( () => {
			result.current.meter?.onToggle( true );
		} );
		expect( result.current.meter?.isOpen ).toBe( true );
		expect( trackImageStudioCreditsMeterOpened ).toHaveBeenCalledWith( {
			mode: ImageStudioMode.Edit,
			trigger: 'click',
			...meterDetails( 'ok', 30_000 ),
		} );

		act( () => {
			result.current.meter?.onToggle( true );
		} );
		act( () => {
			result.current.meter?.onToggle( false );
		} );
		expect( result.current.meter?.isOpen ).toBe( false );
		expect( trackImageStudioCreditsMeterOpened ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'records every blocked Send, even with the popover already open', async () => {
		respondWith( { ai_credits: planSnapshot( 0 ), ...PLAN_BUYER } );
		const { result } = renderCredits();
		await waitFor( () => expect( result.current.isLimitReached ).toBe( true ) );

		act( () => {
			result.current.beforeSubmit();
		} );
		act( () => {
			result.current.beforeSubmit();
		} );
		expect( result.current.meter?.isOpen ).toBe( true );
		expect( trackImageStudioCreditsMeterOpened ).toHaveBeenCalledTimes( 2 );
		expect( trackImageStudioCreditsMeterOpened ).toHaveBeenLastCalledWith( {
			mode: ImageStudioMode.Generate,
			trigger: 'submit_blocked',
			...meterDetails( 'zero', 0 ),
		} );
	} );

	it( 'returns the same result between renders, so the memoised chat doesn’t re-render', async () => {
		respondWith( { ai_credits: planSnapshot( 30_000 ), ...PLAN_BUYER } );
		const { result, rerender } = renderCredits();
		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

		const first = result.current;
		rerender( { mode: ImageStudioMode.Generate, authProvider } );

		expect( result.current ).toBe( first );
	} );

	it( 'ignores a late response after the modal closed', async () => {
		let resolveFetch: ( value: unknown ) => void = () => {};
		fetchMock.mockReturnValue(
			new Promise( ( resolve ) => {
				resolveFetch = resolve;
			} )
		);

		const { unmount } = renderCredits();
		await waitFor( () => expect( fetchMock ).toHaveBeenCalled() );
		unmount();

		await act( async () => {
			resolveFetch( {
				ok: true,
				json: async () => ( { ai_credits: planSnapshot( 0 ), ...PLAN_BUYER } ),
			} );
		} );

		expect( trackImageStudioUpgradeNoticeShown ).not.toHaveBeenCalled();
	} );
} );
