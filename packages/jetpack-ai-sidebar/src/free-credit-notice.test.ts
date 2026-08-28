/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';
import {
	formatRemainingPercentage,
	getJetpackAiStatus,
	useJetpackFreeCreditChatNotice,
} from './free-credit-notice';
import { trackJetpackAiUpgrade } from './utils/tracking';

jest.mock( '@wordpress/api-fetch', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );
jest.mock( './utils/tracking', () => ( {
	trackJetpackAiUpgrade: jest.fn(),
} ) );

const mockApiFetch = jest.mocked( apiFetch );
const mockTrackJetpackAiUpgrade = jest.mocked( trackJetpackAiUpgrade );
const mockOpen = jest.fn();
const UPGRADE_URL = 'http://localhost/wp-admin/admin.php?page=my-jetpack#/add-jetpack-ai';
const CURRENT_ENDPOINT_ERROR =
	'Protocol request error: You have reached your Jetpack AI usage limit.';
const PUBLIC_API_ROOT = 'https://public-api.wordpress.com/';
const LOCAL_API_ROOT = 'http://localhost/wp-json/';

type TestWindow = Window & {
	JetpackScriptData?: { site?: { is_wpcom_platform?: unknown } };
	wpApiSettings?: { root?: unknown };
};

const testWindow = window as TestWindow;
const originalJetpackScriptData = testWindow.JetpackScriptData;
const originalWpApiSettings = testWindow.wpApiSettings;

const featureResponse = ( requestsCount = 0 ) => ( {
	'is-over-limit': requestsCount >= 20,
	'requests-count': requestsCount,
	'requests-limit': 20,
	'upgrade-url': UPGRADE_URL,
	'current-tier': {
		slug: 'jetpack_ai_free',
		value: 0,
		limit: 20,
	},
} );

const aiCredits = ( used = 0, limit = 15_000 ) => {
	const remaining = Math.max( 0, limit - used );
	return {
		credits_limit: limit,
		credits_used: used,
		credits_remaining: remaining,
		blocked: remaining === 0,
		resets_at: '2026-10-01T00:00:00+00:00',
		upgrade_url: null,
	};
};

const defaultProps = {
	error: null,
	enabled: true,
	isWpcomPlatform: false,
	settledRequestCount: 0,
	siteId: 123,
};

beforeAll( () => {
	Object.defineProperty( window, 'open', {
		configurable: true,
		value: mockOpen,
	} );
} );

beforeEach( () => {
	mockApiFetch.mockReset();
	mockTrackJetpackAiUpgrade.mockReset();
	mockOpen.mockReset();
	delete testWindow.JetpackScriptData;
	delete testWindow.wpApiSettings;
} );

afterEach( () => {
	if ( originalJetpackScriptData === undefined ) {
		delete testWindow.JetpackScriptData;
	} else {
		testWindow.JetpackScriptData = originalJetpackScriptData;
	}
	if ( originalWpApiSettings === undefined ) {
		delete testWindow.wpApiSettings;
	} else {
		testWindow.wpApiSettings = originalWpApiSettings;
	}
} );

describe( 'getJetpackAiStatus', () => {
	it.each( [
		[ 3_000, 15_000, 12_000 ],
		[ 360, 1_000, 640 ],
	] as const )(
		'accepts a backend-owned cost allowance with %d used of %d',
		( used, limit, remaining ) => {
			expect( getJetpackAiStatus( featureResponse(), aiCredits( used, limit ) ) ).toEqual( {
				kind: 'cost',
				limit,
				used,
				remaining,
				resetsAt: '2026-10-01T00:00:00+00:00',
				isExhausted: false,
				upgradeUrl: null,
			} );
		}
	);

	it( 'accepts Z for the UTC reset boundary', () => {
		expect(
			getJetpackAiStatus( featureResponse(), {
				...aiCredits(),
				resets_at: '2026-10-01T00:00:00Z',
			} )
		).toMatchObject( { kind: 'cost', remaining: 15_000 } );
	} );

	it( 'prefers the terminal cost snapshot over legacy request fields', () => {
		expect(
			getJetpackAiStatus( { ...featureResponse(), 'requests-count': 19 }, aiCredits( 3_000 ) )
		).toMatchObject( { kind: 'cost', remaining: 12_000 } );
	} );

	it.each( [
		[ 'positive limit', { credits_limit: 0 } ],
		[ 'integer usage', { credits_used: '360' } ],
		[ 'balance', { credits_remaining: 999 } ],
		[ 'blocked state', { blocked: true } ],
		[ 'UTC reset', { resets_at: '2026-10-01T00:00:00-05:00' } ],
		[ 'sub-millisecond reset', { resets_at: '2026-10-01T00:00:00.0001Z' } ],
		[ 'calendar-month reset', { resets_at: '2026-10-02T00:00:00Z' } ],
	] )( 'falls back to legacy requests for an invalid %s', ( _field, override ) => {
		expect(
			getJetpackAiStatus( featureResponse( 3 ), { ...aiCredits(), ...override } )
		).toMatchObject( { kind: 'legacy', requestsRemaining: 17 } );
	} );

	it( 'does not turn malformed cost data into a balance without a valid fallback', () => {
		expect( getJetpackAiStatus( {}, { ...aiCredits(), credits_used: 1.5 } ) ).toBeUndefined();
	} );

	it( 'accepts a post-turn overshoot clamped to zero', () => {
		expect( getJetpackAiStatus( {}, aiCredits( 15_001 ) ) ).toMatchObject( {
			kind: 'cost',
			remaining: 0,
			isExhausted: true,
		} );
	} );

	it( 'rejects the WordPress.com plans URL from the terminal response', () => {
		expect(
			getJetpackAiStatus(
				{},
				{
					...aiCredits(),
					upgrade_url: 'https://wordpress.com/plans/example.com',
				}
			)
		).toMatchObject( { kind: 'cost', upgradeUrl: null } );
	} );

	it( 'uses the legacy all-time free request count and clamps remaining requests to zero', () => {
		expect( getJetpackAiStatus( featureResponse( 21 ) ) ).toEqual( {
			kind: 'legacy',
			requestsRemaining: 0,
			isExhausted: true,
			upgradeUrl: UPGRADE_URL,
		} );
	} );

	it( 'ignores a legacy paid tier without an authoritative cost allowance', () => {
		expect(
			getJetpackAiStatus( {
				...featureResponse(),
				'current-tier': { slug: 'jetpack_ai_yearly', value: 1, limit: 100 },
			} )
		).toBeNull();
	} );

	it( 'does not treat malformed free-tier data as a paid tier', () => {
		expect(
			getJetpackAiStatus( {
				...featureResponse(),
				'requests-count': '3',
			} )
		).toBeUndefined();
	} );

	it( 'uses the site-specific free limit before the tier default', () => {
		expect(
			getJetpackAiStatus( {
				...featureResponse( 20 ),
				'is-over-limit': false,
				'requests-limit': 1000,
			} )
		).toMatchObject( { kind: 'legacy', requestsRemaining: 980, isExhausted: false } );
	} );

	it( 'keeps the status but drops an untrusted upgrade URL', () => {
		expect(
			getJetpackAiStatus( {
				...featureResponse(),
				'upgrade-url': 'https://wordpress.com.evil.example/checkout',
			} )
		).toMatchObject( { kind: 'legacy', requestsRemaining: 20, upgradeUrl: null } );
	} );
} );

describe( 'formatRemainingPercentage', () => {
	it.each( [
		[ 15_000, 15_000, '100%' ],
		[ 14_999, 15_000, '99%' ],
		[ 7_500, 15_000, '50%' ],
		[ 150, 15_000, '1%' ],
		[ 149, 15_000, '<1%' ],
		[ 1, 15_000, '<1%' ],
		[ 0, 15_000, '0%' ],
	] )( 'formats %d of %d as %s', ( remaining, limit, expected ) => {
		expect( formatRemainingPercentage( remaining, limit ) ).toBe( expected );
	} );
} );

describe( 'WordPress.com-hosted status', () => {
	it.each( [
		[ 'Simple', PUBLIC_API_ROOT ],
		[ 'Atomic', LOCAL_API_ROOT ],
		[ 'Big Sky', LOCAL_API_ROOT ],
		[ 'Garden', LOCAL_API_ROOT ],
		[ 'Flex', LOCAL_API_ROOT ],
	] )( 'does not fetch or show the Jetpack AI notice on %s', ( _siteType, root ) => {
		testWindow.wpApiSettings = { root };
		mockApiFetch.mockResolvedValue( featureResponse() );
		const { result } = renderHook( () =>
			useJetpackFreeCreditChatNotice( {
				...defaultProps,
				error: CURRENT_ENDPOINT_ERROR,
				isWpcomPlatform: true,
				aiCredits: aiCredits( 3_000 ),
			} )
		);

		expect( mockApiFetch ).not.toHaveBeenCalled();
		expect( result.current ).toBeUndefined();
	} );
} );

describe( 'Self-hosted status', () => {
	beforeEach( () => {
		testWindow.wpApiSettings = { root: LOCAL_API_ROOT };
	} );

	it.each( [
		[ 3_000, 15_000, '80% of this month’s Jetpack AI allowance left' ],
		[ 250, 1_000, '75% of this month’s Jetpack AI allowance left' ],
	] as const )( 'shows a post-turn balance with %d used of %d', async ( used, limit, balance ) => {
		mockApiFetch.mockResolvedValue( featureResponse() );
		const { result, unmount } = renderHook( () =>
			useJetpackFreeCreditChatNotice( {
				...defaultProps,
				aiCredits: aiCredits( used, limit ),
			} )
		);

		await waitFor( () => {
			expect( result.current?.message ).toBe( `${ balance }. Resets on October 1, 2026 (UTC).` );
			expect( result.current?.action ).toMatchObject( { label: 'Upgrade' } );
		} );
		unmount();
	} );

	it( 'shows the authoritative exhausted state with the monthly reset', async () => {
		mockApiFetch.mockResolvedValue( featureResponse() );
		const { result, unmount } = renderHook( () =>
			useJetpackFreeCreditChatNotice( {
				...defaultProps,
				aiCredits: aiCredits( 15_000 ),
			} )
		);

		await waitFor( () =>
			expect( result.current ).toMatchObject( {
				message:
					'You’ve used this month’s Jetpack AI allowance (0% left). It resets on October 1, 2026 (UTC).',
				status: 'error',
				dismissible: false,
			} )
		);
		unmount();
	} );

	it( 'falls back to legacy request wording for a malformed terminal snapshot', async () => {
		mockApiFetch.mockResolvedValue( featureResponse( 3 ) );
		const { result, unmount } = renderHook( () =>
			useJetpackFreeCreditChatNotice( {
				...defaultProps,
				aiCredits: { ...aiCredits(), credits_remaining: 1 },
			} )
		);

		await waitFor( () => expect( result.current?.message ).toBe( '17 free requests left' ) );
		unmount();
	} );

	it( 'clears a stale cost balance when a later terminal result omits it', async () => {
		mockApiFetch.mockResolvedValue( featureResponse( 3 ) );
		const initialProps = { ...defaultProps, aiCredits: aiCredits( 3_000 ) };
		const { result, rerender, unmount } = renderHook(
			( props: typeof initialProps | typeof defaultProps ) =>
				useJetpackFreeCreditChatNotice( props ),
			{ initialProps }
		);

		await waitFor( () =>
			expect( result.current?.message ).toBe(
				'80% of this month’s Jetpack AI allowance left. Resets on October 1, 2026 (UTC).'
			)
		);
		rerender( defaultProps );
		expect( result.current?.message ).toBe( '17 free requests left' );
		unmount();
	} );

	it( 'retires the pre-upgrade balance after the local endpoint confirms a paid tier', async () => {
		const paidLegacyResponse = {
			...featureResponse(),
			'is-over-limit': false,
			'current-tier': { slug: 'jetpack_ai_yearly', value: 1, limit: 100 },
		};
		mockApiFetch
			.mockResolvedValueOnce( featureResponse( 20 ) )
			.mockResolvedValueOnce( paidLegacyResponse );
		const initialProps = {
			...defaultProps,
			error: CURRENT_ENDPOINT_ERROR as string | null,
			aiCredits: aiCredits( 15_000 ),
			aiCreditsRevision: 1,
		};
		const { result, rerender, unmount } = renderHook(
			( props: typeof initialProps ) => useJetpackFreeCreditChatNotice( props ),
			{ initialProps }
		);

		await waitFor( () =>
			expect( result.current ).toMatchObject( {
				message:
					'You’ve used this month’s Jetpack AI allowance (0% left). It resets on October 1, 2026 (UTC).',
				status: 'error',
				action: { label: 'Upgrade' },
			} )
		);
		mockOpen.mockImplementationOnce( () => {
			window.dispatchEvent( new Event( 'focus' ) );
			return null;
		} );
		result.current?.action?.onClick();
		expect( mockApiFetch ).toHaveBeenCalledTimes( 1 );
		expect( mockTrackJetpackAiUpgrade ).toHaveBeenCalledWith();
		expect( mockOpen ).toHaveBeenCalledWith( UPGRADE_URL, '_blank', 'noopener,noreferrer' );

		act( () => window.dispatchEvent( new Event( 'focus' ) ) );

		await waitFor( () => {
			expect( mockApiFetch ).toHaveBeenNthCalledWith( 2, {
				path: '/wpcom/v2/jetpack-ai/ai-assistant-feature?skip_cache=true',
			} );
			expect( result.current ).toEqual( { suppressCurrentError: true } );
		} );
		rerender( {
			...initialProps,
			aiCredits: aiCredits( 3_000 ),
			aiCreditsRevision: 2,
		} );
		await waitFor( () =>
			expect( result.current ).toMatchObject( {
				message: '80% of this month’s Jetpack AI allowance left. Resets on October 1, 2026 (UTC).',
				suppressCurrentError: true,
			} )
		);
		act( () => window.dispatchEvent( new Event( 'focus' ) ) );
		expect( mockApiFetch ).toHaveBeenCalledTimes( 2 );
		unmount();
	} );

	it( 'does not reuse upgrade context after its cached fallback completes', async () => {
		jest.useFakeTimers();
		try {
			const paidLegacyResponse = {
				...featureResponse(),
				'is-over-limit': false,
				'current-tier': { slug: 'jetpack_ai_yearly', value: 1, limit: 100 },
			};
			mockApiFetch
				.mockResolvedValueOnce( featureResponse() )
				.mockResolvedValueOnce( featureResponse() )
				.mockResolvedValueOnce( featureResponse() )
				.mockResolvedValueOnce( featureResponse() )
				.mockResolvedValueOnce( paidLegacyResponse );
			const initialProps = {
				...defaultProps,
				aiCredits: aiCredits( 15_000 ),
				aiCreditsRevision: 1,
			};
			const { result, rerender, unmount } = renderHook(
				( props: typeof initialProps ) => useJetpackFreeCreditChatNotice( props ),
				{ initialProps }
			);

			await act( async () => Promise.resolve() );
			result.current?.action?.onClick();
			act( () => window.dispatchEvent( new Event( 'focus' ) ) );
			await act( async () => Promise.resolve() );

			act( () => jest.advanceTimersByTime( 61_000 ) );
			await act( async () => Promise.resolve() );
			rerender( { ...initialProps, settledRequestCount: 1 } );
			await act( async () => Promise.resolve() );
			act( () => jest.advanceTimersByTime( 61_000 ) );
			await act( async () => Promise.resolve() );

			expect( mockApiFetch ).toHaveBeenCalledTimes( 5 );
			expect( result.current?.message ).toBe(
				'You’ve used this month’s Jetpack AI allowance (0% left). It resets on October 1, 2026 (UTC).'
			);
			unmount();
		} finally {
			jest.clearAllTimers();
			jest.useRealTimers();
		}
	} );

	it( 'refreshes after returning from a rejection-only upgrade action', async () => {
		const paidLegacyResponse = {
			...featureResponse(),
			'current-tier': { slug: 'jetpack_ai_yearly', value: 1, limit: 100 },
		};
		mockApiFetch
			.mockResolvedValueOnce( paidLegacyResponse )
			.mockResolvedValueOnce( paidLegacyResponse );
		const { result, unmount } = renderHook( () =>
			useJetpackFreeCreditChatNotice( {
				...defaultProps,
				error: `${ CURRENT_ENDPOINT_ERROR } Upgrade at ${ UPGRADE_URL }`,
			} )
		);

		await waitFor( () => expect( mockApiFetch ).toHaveBeenCalledTimes( 1 ) );
		expect( result.current ).toMatchObject( {
			message: 'You’ve reached your Jetpack AI usage limit.',
			status: 'error',
			dismissible: false,
			suppressCurrentError: true,
			action: { label: 'Upgrade' },
		} );
		result.current?.action?.onClick();
		expect( mockApiFetch ).toHaveBeenCalledTimes( 1 );

		act( () => window.dispatchEvent( new Event( 'focus' ) ) );

		await waitFor( () => {
			expect( mockApiFetch ).toHaveBeenNthCalledWith( 2, {
				path: '/wpcom/v2/jetpack-ai/ai-assistant-feature?skip_cache=true',
			} );
			expect( result.current ).toEqual( { suppressCurrentError: true } );
		} );
		unmount();
	} );

	it( 'uses the local endpoint without polling an idle session', async () => {
		jest.useFakeTimers();
		try {
			mockApiFetch.mockResolvedValue( featureResponse() );
			const { result, unmount } = renderHook( () =>
				useJetpackFreeCreditChatNotice( defaultProps )
			);

			await act( async () => Promise.resolve() );
			expect( result.current?.message ).toBe( '20 free requests left' );
			expect( mockApiFetch ).toHaveBeenCalledWith( {
				path: '/wpcom/v2/jetpack-ai/ai-assistant-feature',
			} );

			act( () => jest.advanceTimersByTime( 61_000 ) );
			await act( async () => Promise.resolve() );
			expect( mockApiFetch ).toHaveBeenCalledTimes( 1 );
			unmount();
		} finally {
			jest.clearAllTimers();
			jest.useRealTimers();
		}
	} );

	it( 'shows the exhausted state and opens the trusted upgrade URL', async () => {
		mockApiFetch.mockResolvedValue( featureResponse( 20 ) );
		const { result, unmount } = renderHook( () => useJetpackFreeCreditChatNotice( defaultProps ) );

		await waitFor( () =>
			expect( result.current ).toMatchObject( {
				message: 'You’re out of free requests.',
				status: 'error',
				dismissible: false,
				action: { label: 'Upgrade' },
			} )
		);

		result.current?.action?.onClick();
		expect( mockTrackJetpackAiUpgrade ).toHaveBeenCalledWith();
		expect( mockOpen ).toHaveBeenCalledWith( UPGRADE_URL, '_blank', 'noopener,noreferrer' );
		unmount();
	} );

	it( 'requires a positive site ID', () => {
		mockApiFetch.mockResolvedValue( featureResponse() );
		const { result } = renderHook( () =>
			useJetpackFreeCreditChatNotice( { ...defaultProps, siteId: 0 } )
		);

		expect( mockApiFetch ).not.toHaveBeenCalled();
		expect( result.current ).toBeUndefined();
	} );

	it( 'accepts a relative same-origin REST root', async () => {
		testWindow.wpApiSettings = { root: '/wp-json/' };
		mockApiFetch.mockResolvedValue( featureResponse() );
		const { result, unmount } = renderHook( () =>
			useJetpackFreeCreditChatNotice( { ...defaultProps, isWpcomPlatform: false } )
		);

		await waitFor( () => expect( result.current?.message ).toBe( '20 free requests left' ) );
		expect( mockApiFetch ).toHaveBeenCalledTimes( 1 );
		unmount();
	} );

	it( 'refreshes immediately with a cache bypass and keeps the delayed cached fallback', async () => {
		jest.useFakeTimers();
		try {
			mockApiFetch
				.mockResolvedValueOnce( featureResponse() )
				.mockResolvedValueOnce( featureResponse( 1 ) )
				.mockResolvedValueOnce( featureResponse( 1 ) );
			const { result, rerender, unmount } = renderHook(
				( props: typeof defaultProps ) => useJetpackFreeCreditChatNotice( props ),
				{ initialProps: defaultProps }
			);

			await act( async () => Promise.resolve() );
			rerender( { ...defaultProps, settledRequestCount: 1 } );
			await act( async () => Promise.resolve() );
			expect( mockApiFetch ).toHaveBeenCalledTimes( 2 );
			expect( mockApiFetch ).toHaveBeenNthCalledWith( 2, {
				path: '/wpcom/v2/jetpack-ai/ai-assistant-feature?skip_cache=true',
			} );
			expect( result.current?.message ).toBe( '19 free requests left' );

			act( () => jest.advanceTimersByTime( 60_999 ) );
			expect( mockApiFetch ).toHaveBeenCalledTimes( 2 );

			act( () => jest.advanceTimersByTime( 1 ) );
			await act( async () => Promise.resolve() );
			expect( mockApiFetch ).toHaveBeenCalledTimes( 3 );
			expect( mockApiFetch ).toHaveBeenNthCalledWith( 3, {
				path: '/wpcom/v2/jetpack-ai/ai-assistant-feature',
			} );
			expect( result.current?.message ).toBe( '19 free requests left' );
			unmount();
		} finally {
			jest.clearAllTimers();
			jest.useRealTimers();
		}
	} );

	it( 'restarts the cached fallback delay after an immediate refresh', async () => {
		jest.useFakeTimers();
		try {
			mockApiFetch
				.mockResolvedValueOnce( featureResponse() )
				.mockResolvedValueOnce( featureResponse( 1 ) )
				.mockResolvedValueOnce( featureResponse( 1 ) );
			const { rerender, unmount } = renderHook(
				( props: typeof defaultProps ) => useJetpackFreeCreditChatNotice( props ),
				{ initialProps: defaultProps }
			);

			await act( async () => Promise.resolve() );
			act( () => jest.advanceTimersByTime( 30_000 ) );
			rerender( { ...defaultProps, settledRequestCount: 1 } );
			await act( async () => Promise.resolve() );
			expect( mockApiFetch ).toHaveBeenCalledTimes( 2 );

			act( () => jest.advanceTimersByTime( 30_999 ) );
			expect( mockApiFetch ).toHaveBeenCalledTimes( 2 );
			act( () => jest.advanceTimersByTime( 1 ) );
			expect( mockApiFetch ).toHaveBeenCalledTimes( 2 );

			act( () => jest.advanceTimersByTime( 29_999 ) );
			expect( mockApiFetch ).toHaveBeenCalledTimes( 2 );
			act( () => jest.advanceTimersByTime( 1 ) );
			await act( async () => Promise.resolve() );
			expect( mockApiFetch ).toHaveBeenCalledTimes( 3 );
			expect( mockApiFetch ).toHaveBeenNthCalledWith( 3, {
				path: '/wpcom/v2/jetpack-ai/ai-assistant-feature',
			} );
			unmount();
		} finally {
			jest.clearAllTimers();
			jest.useRealTimers();
		}
	} );

	it( 'coalesces changes during an in-flight request into one immediate follow-up', async () => {
		let resolveRefresh: ( response: ReturnType< typeof featureResponse > ) => void = () => {};
		mockApiFetch
			.mockResolvedValueOnce( featureResponse() )
			.mockImplementationOnce(
				() =>
					new Promise( ( resolve ) => {
						resolveRefresh = resolve;
					} )
			)
			.mockResolvedValueOnce( featureResponse( 3 ) );
		const { result, rerender, unmount } = renderHook(
			( props: typeof defaultProps ) => useJetpackFreeCreditChatNotice( props ),
			{ initialProps: defaultProps }
		);

		await act( async () => Promise.resolve() );
		rerender( { ...defaultProps, settledRequestCount: 1 } );
		expect( mockApiFetch ).toHaveBeenCalledTimes( 2 );

		rerender( { ...defaultProps, settledRequestCount: 2 } );
		rerender( { ...defaultProps, settledRequestCount: 3 } );
		expect( mockApiFetch ).toHaveBeenCalledTimes( 2 );

		await act( async () => resolveRefresh( featureResponse( 1 ) ) );
		expect( mockApiFetch ).toHaveBeenCalledTimes( 3 );
		expect( mockApiFetch ).toHaveBeenNthCalledWith( 3, {
			path: '/wpcom/v2/jetpack-ai/ai-assistant-feature?skip_cache=true',
		} );
		expect( result.current?.message ).toBe( '17 free requests left' );
		unmount();
	} );

	it( 'preserves the displayed status when the immediate refresh fails', async () => {
		jest.useFakeTimers();
		try {
			mockApiFetch
				.mockResolvedValueOnce( featureResponse( 4 ) )
				.mockRejectedValueOnce( new Error( 'Status unavailable' ) )
				.mockResolvedValueOnce( featureResponse( 5 ) );
			const { result, rerender, unmount } = renderHook(
				( props: typeof defaultProps ) => useJetpackFreeCreditChatNotice( props ),
				{ initialProps: defaultProps }
			);

			await act( async () => Promise.resolve() );
			expect( result.current?.message ).toBe( '16 free requests left' );

			rerender( { ...defaultProps, settledRequestCount: 1 } );
			await act( async () => Promise.resolve() );
			expect( mockApiFetch ).toHaveBeenCalledTimes( 2 );
			expect( result.current?.message ).toBe( '16 free requests left' );

			act( () => jest.advanceTimersByTime( 61_000 ) );
			await act( async () => Promise.resolve() );
			expect( mockApiFetch ).toHaveBeenCalledTimes( 3 );
			expect( result.current?.message ).toBe( '15 free requests left' );
			unmount();
		} finally {
			jest.clearAllTimers();
			jest.useRealTimers();
		}
	} );

	it( 'uses the delayed cached fallback when cache bypass is unsupported', async () => {
		jest.useFakeTimers();
		try {
			mockApiFetch
				.mockResolvedValueOnce( featureResponse() )
				.mockResolvedValueOnce( featureResponse() )
				.mockResolvedValueOnce( featureResponse( 1 ) );
			const { result, rerender, unmount } = renderHook(
				( props: typeof defaultProps ) => useJetpackFreeCreditChatNotice( props ),
				{ initialProps: defaultProps }
			);

			await act( async () => Promise.resolve() );
			rerender( { ...defaultProps, settledRequestCount: 1 } );
			await act( async () => Promise.resolve() );
			expect( result.current?.message ).toBe( '20 free requests left' );

			act( () => jest.advanceTimersByTime( 61_000 ) );
			await act( async () => Promise.resolve() );
			expect( result.current?.message ).toBe( '19 free requests left' );
			unmount();
		} finally {
			jest.clearAllTimers();
			jest.useRealTimers();
		}
	} );

	it.each( [ 'site change', 'unmount' ] as const )(
		'drops a queued immediate follow-up after %s',
		async ( transition ) => {
			let resolveInitial: ( response: ReturnType< typeof featureResponse > ) => void = () => {};
			mockApiFetch
				.mockImplementationOnce(
					() =>
						new Promise( ( resolve ) => {
							resolveInitial = resolve;
						} )
				)
				.mockResolvedValueOnce( featureResponse() );
			const { rerender, unmount } = renderHook(
				( props: typeof defaultProps ) => useJetpackFreeCreditChatNotice( props ),
				{ initialProps: defaultProps }
			);

			rerender( { ...defaultProps, settledRequestCount: 1 } );
			expect( mockApiFetch ).toHaveBeenCalledTimes( 1 );
			if ( transition === 'site change' ) {
				rerender( { ...defaultProps, settledRequestCount: 1, siteId: 456 } );
				await act( async () => Promise.resolve() );
			} else {
				unmount();
			}

			await act( async () => resolveInitial( featureResponse() ) );
			expect( mockApiFetch ).toHaveBeenCalledTimes( transition === 'site change' ? 2 : 1 );

			if ( transition !== 'unmount' ) {
				unmount();
			}
		}
	);

	it( 'stops retrying persistent failures until another request settles', async () => {
		jest.useFakeTimers();
		try {
			mockApiFetch.mockRejectedValue( new Error( 'Status unavailable' ) );
			const { rerender, unmount } = renderHook(
				( props: typeof defaultProps ) => useJetpackFreeCreditChatNotice( props ),
				{ initialProps: defaultProps }
			);

			await act( async () => Promise.resolve() );
			expect( mockApiFetch ).toHaveBeenCalledTimes( 1 );

			act( () => jest.advanceTimersByTime( 61_000 ) );
			await act( async () => Promise.resolve() );
			expect( mockApiFetch ).toHaveBeenCalledTimes( 2 );

			act( () => jest.advanceTimersByTime( 5 * 61_000 ) );
			await act( async () => Promise.resolve() );
			expect( mockApiFetch ).toHaveBeenCalledTimes( 2 );

			rerender( { ...defaultProps, settledRequestCount: 1 } );
			await act( async () => Promise.resolve() );
			expect( mockApiFetch ).toHaveBeenCalledTimes( 3 );

			act( () => jest.advanceTimersByTime( 61_000 ) );
			await act( async () => Promise.resolve() );
			expect( mockApiFetch ).toHaveBeenCalledTimes( 4 );

			act( () => jest.advanceTimersByTime( 5 * 61_000 ) );
			await act( async () => Promise.resolve() );
			expect( mockApiFetch ).toHaveBeenCalledTimes( 4 );
			unmount();
		} finally {
			jest.clearAllTimers();
			jest.useRealTimers();
		}
	} );

	it( 'clears a pending refresh when the notice is disabled', async () => {
		jest.useFakeTimers();
		try {
			mockApiFetch.mockRejectedValue( new Error( 'Status unavailable' ) );
			const { rerender, unmount } = renderHook(
				( props: typeof defaultProps ) => useJetpackFreeCreditChatNotice( props ),
				{ initialProps: defaultProps }
			);

			await act( async () => Promise.resolve() );
			rerender( { ...defaultProps, enabled: false } );
			act( () => jest.advanceTimersByTime( 61_000 ) );
			expect( mockApiFetch ).toHaveBeenCalledTimes( 1 );
			unmount();
		} finally {
			jest.clearAllTimers();
			jest.useRealTimers();
		}
	} );

	it.each( [ 'site change', 'unmount' ] as const )(
		'clears the old pending refresh on %s',
		async ( transition ) => {
			jest.useFakeTimers();
			try {
				mockApiFetch
					.mockRejectedValueOnce( new Error( 'Status unavailable' ) )
					.mockResolvedValue( featureResponse() );
				const { rerender, unmount } = renderHook(
					( props: typeof defaultProps ) => useJetpackFreeCreditChatNotice( props ),
					{ initialProps: defaultProps }
				);

				await act( async () => Promise.resolve() );
				if ( transition === 'site change' ) {
					rerender( { ...defaultProps, siteId: 456 } );
					await act( async () => Promise.resolve() );
				} else {
					unmount();
				}

				act( () => jest.advanceTimersByTime( 61_000 ) );
				await act( async () => Promise.resolve() );
				expect( mockApiFetch ).toHaveBeenCalledTimes( transition === 'site change' ? 2 : 1 );

				if ( transition !== 'unmount' ) {
					unmount();
				}
			} finally {
				jest.clearAllTimers();
				jest.useRealTimers();
			}
		}
	);
} );

describe( 'routing and compatibility fallbacks', () => {
	it( 'shows a terminal cost snapshot without a local status endpoint', () => {
		const { result } = renderHook( () =>
			useJetpackFreeCreditChatNotice( {
				...defaultProps,
				aiCredits: aiCredits( 3_000 ),
			} )
		);

		expect( mockApiFetch ).not.toHaveBeenCalled();
		expect( result.current?.message ).toBe(
			'80% of this month’s Jetpack AI allowance left. Resets on October 1, 2026 (UTC).'
		);
		expect( result.current?.action ).toBeUndefined();
	} );

	it.each( [
		[ 'missing', undefined ],
		[ 'non-string', 123 ],
		[ 'malformed', 'http://[' ],
		[ 'cross-origin', 'https://example.com/wp-json/' ],
		[ 'lookalike Public API', 'https://public-api.wordpress.com.evil.example/' ],
		[ 'insecure Public API', 'http://public-api.wordpress.com/' ],
		[ 'alternate Public API port', 'https://public-api.wordpress.com:444/' ],
		[ 'credentialed local root', 'http://user:password@localhost/wp-json/' ],
		[ 'credentialed Public API', 'https://user:password@public-api.wordpress.com/' ],
	] )( 'fails closed for a %s root', ( _label, root ) => {
		testWindow.wpApiSettings = { root };
		mockApiFetch.mockResolvedValue( featureResponse() );
		const { result } = renderHook( () => useJetpackFreeCreditChatNotice( defaultProps ) );

		expect( mockApiFetch ).not.toHaveBeenCalled();
		expect( result.current ).toBeUndefined();
	} );

	it( 'fails closed when the host identity is unknown', () => {
		testWindow.wpApiSettings = { root: LOCAL_API_ROOT };
		const { result } = renderHook( () =>
			useJetpackFreeCreditChatNotice( {
				error: CURRENT_ENDPOINT_ERROR,
				enabled: true,
				settledRequestCount: 0,
				siteId: 123,
			} )
		);

		expect( mockApiFetch ).not.toHaveBeenCalled();
		expect( result.current ).toBeUndefined();
	} );

	it( 'uses the self-hosted Jetpack platform signal', async () => {
		testWindow.wpApiSettings = { root: LOCAL_API_ROOT };
		testWindow.JetpackScriptData = { site: { is_wpcom_platform: false } };
		mockApiFetch.mockResolvedValue( featureResponse() );
		const { result, unmount } = renderHook( () =>
			useJetpackFreeCreditChatNotice( {
				error: null,
				enabled: true,
				settledRequestCount: 0,
				siteId: 123,
			} )
		);

		await waitFor( () => expect( result.current?.message ).toBe( '20 free requests left' ) );
		expect( mockApiFetch ).toHaveBeenCalledTimes( 1 );
		unmount();
	} );

	it( 'excludes the WordPress.com Jetpack platform signal', () => {
		testWindow.wpApiSettings = { root: LOCAL_API_ROOT };
		testWindow.JetpackScriptData = { site: { is_wpcom_platform: true } };
		mockApiFetch.mockResolvedValue( featureResponse() );
		const { result } = renderHook( () =>
			useJetpackFreeCreditChatNotice( {
				error: CURRENT_ENDPOINT_ERROR,
				enabled: true,
				settledRequestCount: 0,
				siteId: 123,
			} )
		);

		expect( mockApiFetch ).not.toHaveBeenCalled();
		expect( result.current ).toBeUndefined();
	} );

	it( 'keeps the rejection notice with an old shell and a new provider', () => {
		testWindow.wpApiSettings = { root: LOCAL_API_ROOT };
		testWindow.JetpackScriptData = { site: { is_wpcom_platform: false } };
		const { result, rerender } = renderHook(
			( { error }: { error: string | null } ) => useJetpackFreeCreditChatNotice( { error } ),
			{ initialProps: { error: CURRENT_ENDPOINT_ERROR } }
		);

		expect( mockApiFetch ).not.toHaveBeenCalled();
		expect( result.current ).toMatchObject( {
			message: 'You’ve reached your Jetpack AI usage limit.',
			suppressCurrentError: true,
		} );

		rerender( { error: null } );
		expect( result.current ).toMatchObject( {
			message: 'You’ve reached your Jetpack AI usage limit.',
			suppressCurrentError: false,
		} );
	} );

	it( 'does not fetch or show a notice when disabled', () => {
		testWindow.wpApiSettings = { root: LOCAL_API_ROOT };
		const { result } = renderHook( () =>
			useJetpackFreeCreditChatNotice( {
				...defaultProps,
				enabled: false,
				error: CURRENT_ENDPOINT_ERROR,
			} )
		);

		expect( mockApiFetch ).not.toHaveBeenCalled();
		expect( result.current ).toBeUndefined();
	} );
} );

describe( 'notice composition', () => {
	beforeEach( () => {
		testWindow.wpApiSettings = { root: LOCAL_API_ROOT };
	} );

	it( 'does not recover a new quota rejection from an older positive snapshot', async () => {
		mockApiFetch.mockResolvedValue( featureResponse() );
		const initialProps: Parameters< typeof useJetpackFreeCreditChatNotice >[ 0 ] = {
			...defaultProps,
			aiCredits: aiCredits( 3_000 ),
			aiCreditsRevision: 1,
		};
		const { result, rerender, unmount } = renderHook(
			( props: typeof initialProps ) => useJetpackFreeCreditChatNotice( props ),
			{ initialProps }
		);

		await waitFor( () =>
			expect( result.current?.message ).toBe(
				'80% of this month’s Jetpack AI allowance left. Resets on October 1, 2026 (UTC).'
			)
		);
		rerender( { ...initialProps, error: CURRENT_ENDPOINT_ERROR } );
		expect( result.current ).toMatchObject( {
			message: 'You’ve reached your Jetpack AI usage limit.',
			suppressCurrentError: true,
		} );

		rerender( {
			...initialProps,
			aiCredits: undefined,
			aiCreditsRevision: 2,
			error: CURRENT_ENDPOINT_ERROR,
			settledRequestCount: 1,
		} );
		expect( result.current ).toMatchObject( {
			message: 'You’re out of free requests.',
			suppressCurrentError: true,
		} );
		unmount();
	} );

	it( 'keeps suppressing a recovered rejection if a later status is exhausted', async () => {
		mockApiFetch.mockResolvedValue( featureResponse() );
		const initialProps = {
			...defaultProps,
			error: null as string | null,
			isWpcomPlatform: false,
			aiCredits: aiCredits( 15_000 ),
			aiCreditsRevision: 1,
		};
		const { result, rerender, unmount } = renderHook(
			( props: typeof initialProps ) => useJetpackFreeCreditChatNotice( props ),
			{ initialProps }
		);

		await act( async () => Promise.resolve() );
		rerender( { ...initialProps, error: CURRENT_ENDPOINT_ERROR } );
		rerender( {
			...initialProps,
			error: CURRENT_ENDPOINT_ERROR,
			aiCredits: aiCredits( 1_500 ),
			aiCreditsRevision: 2,
		} );
		await waitFor( () =>
			expect( result.current ).toMatchObject( {
				message: '90% of this month’s Jetpack AI allowance left. Resets on October 1, 2026 (UTC).',
				suppressCurrentError: true,
			} )
		);

		rerender( {
			...initialProps,
			error: CURRENT_ENDPOINT_ERROR,
			aiCredits: aiCredits( 15_000 ),
			aiCreditsRevision: 3,
		} );
		expect( result.current ).toMatchObject( {
			message:
				'You’ve used this month’s Jetpack AI allowance (0% left). It resets on October 1, 2026 (UTC).',
			suppressCurrentError: true,
		} );
		unmount();
	} );

	it( 'keeps the exhausted state when the cached count still has one request', async () => {
		mockApiFetch.mockResolvedValue( featureResponse( 19 ) );
		const initialProps = {
			...defaultProps,
			error: null as string | null,
			isWpcomPlatform: false,
		};
		const { result, rerender, unmount } = renderHook(
			( props: typeof initialProps ) => useJetpackFreeCreditChatNotice( props ),
			{ initialProps }
		);

		await waitFor( () => expect( result.current?.message ).toBe( '1 free request left' ) );
		rerender( { ...initialProps, error: CURRENT_ENDPOINT_ERROR } );

		expect( result.current ).toMatchObject( {
			message: 'You’re out of free requests.',
			status: 'error',
			suppressCurrentError: true,
		} );

		rerender( initialProps );
		expect( result.current ).toMatchObject( {
			message: 'You’re out of free requests.',
			status: 'error',
			suppressCurrentError: false,
		} );
		unmount();
	} );

	it( 'clears a latched rejection after the delayed status read confirms recovery', async () => {
		jest.useFakeTimers();
		try {
			mockApiFetch
				.mockResolvedValueOnce( featureResponse( 19 ) )
				.mockResolvedValueOnce( featureResponse( 19 ) )
				.mockResolvedValueOnce( featureResponse( 19 ) );
			const initialProps = {
				...defaultProps,
				error: null as string | null,
				isWpcomPlatform: false,
			};
			const { result, rerender, unmount } = renderHook(
				( props: typeof initialProps ) => useJetpackFreeCreditChatNotice( props ),
				{ initialProps }
			);

			await act( async () => Promise.resolve() );
			expect( result.current?.message ).toBe( '1 free request left' );

			rerender( { ...initialProps, error: CURRENT_ENDPOINT_ERROR } );
			expect( result.current?.message ).toBe( 'You’re out of free requests.' );

			rerender( {
				...initialProps,
				error: CURRENT_ENDPOINT_ERROR,
				settledRequestCount: 1,
			} );
			await act( async () => Promise.resolve() );
			expect( result.current?.message ).toBe( 'You’re out of free requests.' );

			act( () => jest.advanceTimersByTime( 61_000 ) );
			await act( async () => Promise.resolve() );
			expect( result.current?.message ).toBe( '1 free request left' );
			expect( result.current?.suppressCurrentError ).toBe( true );
			unmount();
		} finally {
			jest.clearAllTimers();
			jest.useRealTimers();
		}
	} );

	it( 'clears a latched rejection after the delayed status read confirms a paid tier', async () => {
		jest.useFakeTimers();
		try {
			const paidResponse = {
				...featureResponse(),
				'current-tier': { slug: 'jetpack_ai_yearly', value: 1, limit: 100 },
			};
			mockApiFetch
				.mockResolvedValueOnce( featureResponse( 19 ) )
				.mockResolvedValueOnce( paidResponse )
				.mockResolvedValueOnce( paidResponse );
			const initialProps = {
				...defaultProps,
				error: null as string | null,
				isWpcomPlatform: false,
			};
			const { result, rerender, unmount } = renderHook(
				( props: typeof initialProps ) => useJetpackFreeCreditChatNotice( props ),
				{ initialProps }
			);

			await act( async () => Promise.resolve() );
			rerender( { ...initialProps, error: CURRENT_ENDPOINT_ERROR } );
			expect( result.current?.message ).toBe( 'You’re out of free requests.' );

			rerender( {
				...initialProps,
				error: CURRENT_ENDPOINT_ERROR,
				settledRequestCount: 1,
			} );
			await act( async () => Promise.resolve() );
			expect( result.current?.message ).toBe( 'You’ve reached your Jetpack AI usage limit.' );

			act( () => jest.advanceTimersByTime( 61_000 ) );
			await act( async () => Promise.resolve() );
			expect( result.current ).toEqual( { suppressCurrentError: true } );
			unmount();
		} finally {
			jest.clearAllTimers();
			jest.useRealTimers();
		}
	} );

	it( 'keeps a paid-tier rejection when the delayed status still reports exhaustion', async () => {
		jest.useFakeTimers();
		try {
			const paidExhaustedResponse = {
				...featureResponse(),
				'is-over-limit': true,
				'current-tier': { slug: 'jetpack_ai_yearly', value: 1, limit: 100 },
			};
			mockApiFetch
				.mockResolvedValueOnce( featureResponse( 19 ) )
				.mockResolvedValueOnce( paidExhaustedResponse )
				.mockResolvedValueOnce( paidExhaustedResponse );
			const initialProps = {
				...defaultProps,
				error: null as string | null,
				isWpcomPlatform: false,
			};
			const { result, rerender, unmount } = renderHook(
				( props: typeof initialProps ) => useJetpackFreeCreditChatNotice( props ),
				{ initialProps }
			);

			await act( async () => Promise.resolve() );
			rerender( { ...initialProps, error: CURRENT_ENDPOINT_ERROR } );
			rerender( {
				...initialProps,
				error: CURRENT_ENDPOINT_ERROR,
				settledRequestCount: 1,
			} );
			await act( async () => Promise.resolve() );

			act( () => jest.advanceTimersByTime( 61_000 ) );
			await act( async () => Promise.resolve() );
			expect( result.current?.message ).toBe( 'You’ve reached your Jetpack AI usage limit.' );
			unmount();
		} finally {
			jest.clearAllTimers();
			jest.useRealTimers();
		}
	} );

	it( 'does not carry a latched rejection to another site', async () => {
		mockApiFetch
			.mockResolvedValueOnce( featureResponse( 19 ) )
			.mockResolvedValueOnce( featureResponse( 5 ) );
		const initialProps = {
			...defaultProps,
			error: null as string | null,
			isWpcomPlatform: false,
		};
		const { result, rerender, unmount } = renderHook(
			( props: typeof initialProps ) => useJetpackFreeCreditChatNotice( props ),
			{ initialProps }
		);

		await waitFor( () => expect( result.current?.message ).toBe( '1 free request left' ) );
		rerender( { ...initialProps, error: CURRENT_ENDPOINT_ERROR } );
		expect( result.current?.message ).toBe( 'You’re out of free requests.' );

		rerender( { ...initialProps, siteId: 456 } );
		await waitFor( () => expect( result.current?.message ).toBe( '15 free requests left' ) );
		unmount();
	} );

	it( 'does not show a proactive notice for a paid tier', async () => {
		mockApiFetch.mockResolvedValue( {
			...featureResponse(),
			'current-tier': { slug: 'jetpack_ai_yearly', value: 1, limit: 100 },
		} );
		const { result, unmount } = renderHook( () =>
			useJetpackFreeCreditChatNotice( { ...defaultProps, isWpcomPlatform: false } )
		);

		await waitFor( () => expect( mockApiFetch ).toHaveBeenCalledTimes( 1 ) );
		expect( result.current ).toBeUndefined();
		unmount();
	} );

	it( 'preserves the generic usage-limit notice for a paid tier rejection', async () => {
		mockApiFetch.mockResolvedValue( {
			...featureResponse(),
			'current-tier': { slug: 'jetpack_ai_yearly', value: 1, limit: 100 },
		} );
		const { result, unmount } = renderHook( () =>
			useJetpackFreeCreditChatNotice( {
				...defaultProps,
				error: CURRENT_ENDPOINT_ERROR,
				isWpcomPlatform: false,
			} )
		);

		await waitFor( () =>
			expect( result.current ).toMatchObject( {
				message: 'You’ve reached your Jetpack AI usage limit.',
				suppressCurrentError: true,
			} )
		);
		unmount();
	} );

	it( 'keeps the backend rejection when the status request fails', async () => {
		mockApiFetch.mockRejectedValue( new Error( 'Status unavailable' ) );
		const { result, unmount } = renderHook( () =>
			useJetpackFreeCreditChatNotice( {
				...defaultProps,
				error: CURRENT_ENDPOINT_ERROR,
				isWpcomPlatform: false,
			} )
		);

		await waitFor( () =>
			expect( result.current ).toMatchObject( {
				message: 'You’ve reached your Jetpack AI usage limit.',
				status: 'error',
				suppressCurrentError: true,
			} )
		);
		unmount();
	} );
} );
