/**
 * Tests for useAiCredits and its reader of the `ai_credits` snapshot that
 * WordPress.com sends for sites on AI credits.
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { ImageStudioMode } from '../types';
import {
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
} ) );

jest.mock( '../utils/tracking', () => ( {
	getImageStudioBlogId: jest.requireActual( '../utils/tracking' ).getImageStudioBlogId,
	getImageStudioSiteType: jest.requireActual( '../utils/tracking' ).getImageStudioSiteType,
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

const UPGRADE_URL = 'https://wordpress.com/plans/123?source=wp_ai_credits';
const upgradeAction = {
	label: 'Upgrade',
	href: UPGRADE_URL,
	target: '_blank',
	rel: 'noopener noreferrer',
	onClick: expect.any( Function ),
};

/** The credit details sent with the notice events, so they join the Agent's credits events. */
const noticeCredits = ( state: 'low' | 'zero', creditsLeft: number ) => ( {
	meter: 'site_credits',
	state,
	planTier: 'premium',
	creditsLeft,
	ctaType: 'upgrade',
	ref: 'wp_ai_credits',
} );
const meterAt = ( percent: number, isOpen = false ) => ( {
	status: expect.objectContaining( { plan: 'paid', percent } ),
	upgradeUrl: UPGRADE_URL,
	isOpen,
	onToggle: expect.any( Function ),
} );

describe( 'getSiteCreditsLevel', () => {
	it.each( [
		{ name: 'low below 20,000', remaining: 19_999, level: 'low' },
		{ name: 'nothing from 20,000', remaining: 20_000, level: null },
	] )( '$name', ( { remaining, level } ) => {
		expect( getSiteCreditsLevel( remaining ) ).toBe( level );
	} );
} );

describe( 'useAiCredits', () => {
	const authProvider: AuthProvider = async () => ( { Authorization: 'Bearer token' } );
	let fetchMock: jest.Mock;

	const respondWith = ( body: unknown, ok = true ) =>
		fetchMock.mockResolvedValue( { ok, json: async () => body } );

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
		respondWith( { ai_credits: planSnapshot( 30_000 ) } );

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
		respondWith( { ai_credits: planSnapshot( 0 ) } );

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
	} );

	it( 'lets Send through and shows the amount left when credits are low', async () => {
		respondWith( { ai_credits: planSnapshot( 6_000 ) } );

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
		respondWith( { ai_credits: planSnapshot( 1 ) } );

		const { result } = renderCredits();

		await waitFor( () => expect( result.current.notice?.message ).toBe( '1 credit left.' ) );
	} );

	it( 'hides a dismissed low notice until the credits run out', async () => {
		respondWith( { ai_credits: planSnapshot( 6_000 ) } );
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

	it( 'offers no upgrade on the top plan', async () => {
		respondWith( { ai_credits: planSnapshot( 0, { plan_tier: 'commerce' } ) } );

		const { result } = renderCredits();

		await waitFor( () => expect( result.current.notice ).toBeDefined() );
		expect( result.current.notice?.action ).toBeUndefined();
		expect( result.current.meter?.upgradeUrl ).toBeUndefined();
		expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledWith(
			expect.objectContaining( { planTier: 'commerce', ctaType: 'none', ref: 'none' } )
		);
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
			body: { ai_credits: planSnapshot( 0, { resets_at: 'soon' } ) },
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
			resolveFetch( { ok: true, json: async () => ( { ai_credits: planSnapshot( 0 ) } ) } );
		} );

		await waitFor( () => expect( result.current.isLimitReached ).toBe( true ) );
	} );

	it( 'takes the new balance from a turn’s final update, and opens the dot’s details at zero', async () => {
		respondWith( { ai_credits: planSnapshot( 30_000 ) } );
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
	} );

	it.each( [
		{ name: 'a running update', final: false, state: 'working' },
		{ name: 'an update that only names a running state', final: undefined, state: 'working' },
	] as const )( 'waits for the turn to end before using $name', async ( { final, state } ) => {
		respondWith( { ai_credits: planSnapshot( 30_000 ) } );
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
		respondWith( { ai_credits: planSnapshot( 30_000 ) } );
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
		respondWith( { ai_credits: planSnapshot( 6_000 ) } );
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
			resolveFetch( { ok: true, json: async () => ( { ai_credits: planSnapshot( 30_000 ) } ) } );
		} );

		expect( result.current.isLimitReached ).toBe( true );
		expect( result.current.isLoading ).toBe( false );
		// No balance was known before the turn, so the details stay closed.
		expect( result.current.meter?.isOpen ).toBe( false );
	} );

	it( 'opens the dot’s details only once when the credits run out', async () => {
		respondWith( { ai_credits: planSnapshot( 30_000 ) } );
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
	} );

	it( 'returns the same result between renders, so the memoised chat doesn’t re-render', async () => {
		respondWith( { ai_credits: planSnapshot( 30_000 ) } );
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
			resolveFetch( { ok: true, json: async () => ( { ai_credits: planSnapshot( 0 ) } ) } );
		} );

		expect( trackImageStudioUpgradeNoticeShown ).not.toHaveBeenCalled();
	} );
} );
