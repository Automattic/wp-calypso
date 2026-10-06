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
import {
	formatCreditsLeft,
	getSiteCreditsLevel,
	parseSiteCredits,
	useAiCredits,
} from './use-ai-credits';
import type { AuthProvider, TaskUpdate } from '@automattic/agenttic-client';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
	sprintf: jest.requireActual( '@wordpress/i18n' ).sprintf,
} ) );

// The package root loads the whole chat; the ring's balance helpers are all this hook uses.
jest.mock( '@automattic/agents-manager', () =>
	jest.requireActual( '@automattic/agents-manager/src/utils/live-credits' )
);

jest.mock( '../utils/tracking', () => ( {
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

const noPlanSnapshot = {
	reason: 'wpcom_no_plan',
	eligible: false,
	blog_id: BLOG_ID,
	plan_tier: 'free',
	credits_limit: 0,
	credits_remaining: 0,
};

const UPGRADE_URL = 'https://wordpress.com/plans/123?source=wp_ai_credits';
const upgradeAction = { label: 'Upgrade', onClick: expect.any( Function ) };
const meterAt = ( percent: number ) => ( {
	status: expect.objectContaining( { plan: 'paid', percent } ),
	upgradeUrl: UPGRADE_URL,
} );

describe( 'parseSiteCredits', () => {
	it( 'reads a paid plan balance', () => {
		expect( parseSiteCredits( planSnapshot( 8_000 ), BLOG_ID ) ).toEqual( {
			hasPlan: true,
			remaining: 8_000,
			planTier: 'premium',
		} );
	} );

	it( 'prefers the combined balance once the endpoint sends purchased credits too', () => {
		expect(
			parseSiteCredits( planSnapshot( 8_000, { credits_available: 50_000 } ), BLOG_ID )
		).toMatchObject( { remaining: 50_000 } );
	} );

	it( 'reads a plan that includes no credits', () => {
		expect( parseSiteCredits( noPlanSnapshot, BLOG_ID ) ).toEqual( {
			hasPlan: false,
			remaining: 0,
		} );
	} );

	it.each( [
		{ name: 'a missing snapshot', value: undefined },
		{ name: 'a snapshot for another site', value: planSnapshot( 8_000, { blog_id: 456 } ) },
		{
			name: 'a balance that is not a number',
			value: planSnapshot( 8_000, { credits_remaining: '8000' } ),
		},
		{ name: 'an unknown reason', value: planSnapshot( 8_000, { reason: 'something_new' } ) },
		{ name: 'a paid plan with a zero limit', value: planSnapshot( 0, { credits_limit: 0 } ) },
	] )( 'treats $name as unknown, never as a zero balance', ( { value } ) => {
		expect( parseSiteCredits( value, BLOG_ID ) ).toBeNull();
	} );
} );

describe( 'getSiteCreditsLevel', () => {
	it.each( [
		{ name: 'none when the plan includes no credits', hasPlan: false, remaining: 0, level: 'none' },
		{ name: 'out at zero', hasPlan: true, remaining: 0, level: 'out' },
		{ name: 'low below 20,000', hasPlan: true, remaining: 19_999, level: 'low' },
		{ name: 'nothing from 20,000', hasPlan: true, remaining: 20_000, level: null },
	] )( '$name', ( { hasPlan, remaining, level } ) => {
		expect( getSiteCreditsLevel( { hasPlan, remaining } ) ).toBe( level );
	} );
} );

describe( 'formatCreditsLeft', () => {
	it.each( [
		{ remaining: 800, message: '800 credits left.' },
		{ remaining: 1_000, message: '1k credits left.' },
		{ remaining: 8_500, message: '8.5k credits left.' },
		{ remaining: 19_999, message: '19.9k credits left.' },
		{ remaining: 67_000, message: '67k credits left.' },
	] )( 'reads $remaining as "$message"', ( { remaining, message } ) => {
		expect( formatCreditsLeft( remaining ) ).toBe( message );
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

	/** The hook's state without its callback, for whole-state assertions. */
	const stateOf = ( result: { current: ReturnType< typeof useAiCredits > } ) => {
		const { onTaskUpdate, ...state } = result.current;
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
		window.imageStudioData = { blogId: BLOG_ID };
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

	it( 'locks the input and shows a persistent notice when the site is out of credits', async () => {
		const openSpy = jest.spyOn( window, 'open' ).mockReturnValue( null );
		respondWith( { ai_credits: planSnapshot( 0 ) } );

		const { result } = renderCredits( ImageStudioMode.Edit );

		await waitFor( () =>
			expect( stateOf( result ) ).toEqual( {
				notice: {
					message: 'You’ve used all your site credits.',
					status: 'warning',
					dismissible: false,
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
		} );

		result.current.notice?.action?.onClick?.();

		expect( trackImageStudioUpgradeNoticeClick ).toHaveBeenCalledWith( {
			mode: ImageStudioMode.Edit,
			trigger: 'open',
		} );
		expect( openSpy ).toHaveBeenCalledWith( UPGRADE_URL, '_blank', 'noopener,noreferrer' );
		openSpy.mockRestore();
	} );

	it( 'keeps the input open and shows the amount left when credits are low', async () => {
		respondWith( { ai_credits: planSnapshot( 6_000 ) } );

		const { result } = renderCredits();

		await waitFor( () => expect( result.current.notice ).toBeDefined() );
		expect( result.current.notice ).toMatchObject( {
			message: '6k credits left.',
			dismissible: true,
		} );
		expect( result.current.isLimitReached ).toBe( false );
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

	it( 'locks the input and shows no ring when the plan includes no credits', async () => {
		respondWith( { ai_credits: noPlanSnapshot } );

		const { result } = renderCredits();

		await waitFor( () => expect( result.current.isLimitReached ).toBe( true ) );
		expect( result.current.notice?.message ).toBe( 'This site’s plan doesn’t include AI credits.' );
		expect( result.current.meter ).toBeUndefined();
	} );

	it( 'offers no upgrade on the top plan', async () => {
		respondWith( { ai_credits: planSnapshot( 0, { plan_tier: 'commerce' } ) } );

		const { result } = renderCredits();

		await waitFor( () => expect( result.current.notice ).toBeDefined() );
		expect( result.current.notice?.action ).toBeUndefined();
		expect( result.current.meter ).toEqual( { status: expect.anything(), upgradeUrl: undefined } );
	} );

	it( 'shows the notice but no ring when the balance doesn’t match the Agent’s shape', async () => {
		respondWith( { ai_credits: planSnapshot( 6_000, { resets_at: 'soon' } ) } );

		const { result } = renderCredits();

		await waitFor( () => expect( result.current.notice ).toBeDefined() );
		expect( result.current.meter ).toBeUndefined();
	} );

	it.each( [
		{
			name: 'the site is not on AI credits',
			ok: false,
			body: { code: 'ai_credit_allowance_not_available' },
		},
		{ name: 'the answer is unreadable', ok: true, body: { ai_credits: 'nope' } },
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

	it( 'takes the new balance from a turn’s final update', async () => {
		respondWith( { ai_credits: planSnapshot( 30_000 ) } );
		const { result } = renderCredits();
		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

		act( () => {
			result.current.onTaskUpdate( finalUpdate( planSnapshot( 0 ) ) );
		} );

		expect( result.current.isLimitReached ).toBe( true );
		expect( result.current.meter ).toEqual( meterAt( 0 ) );
		expect( fetchMock ).toHaveBeenCalledTimes( 1 );
		expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledWith( {
			mode: ImageStudioMode.Generate,
			trigger: 'refresh',
		} );
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
