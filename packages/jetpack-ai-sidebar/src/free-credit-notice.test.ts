/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import {
	formatRemainingPercentage,
	getJetpackAiStatus,
	type JetpackAiStatusRequester,
	useJetpackFreeCreditChatNotice,
} from './free-credit-notice';

const LOCAL_API_ROOT = 'http://localhost/wp-json/';
const STATUS_PATH = '/wpcom/v2/jetpack-ai/ai-assistant-feature';
const UPGRADE_URL = 'http://localhost/wp-admin/admin.php?page=my-jetpack#/add-jetpack-ai';
const QUOTA_ERROR = 'Protocol request error: ai_credit_allowance_exhausted.';
const mockOpen = jest.fn();

type HookProps = Parameters< typeof useJetpackFreeCreditChatNotice >[ 0 ];
type TestWindow = Window & {
	JetpackScriptData?: { site?: { is_wpcom_platform?: unknown } };
	wpApiSettings?: { root?: unknown };
};

const testWindow = window as TestWindow;
const originalJetpackScriptData = testWindow.JetpackScriptData;
const originalWpApiSettings = testWindow.wpApiSettings;

beforeAll( () => {
	Object.defineProperty( window, 'open', {
		configurable: true,
		value: mockOpen,
	} );
} );

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

const creditSnapshot = ( used = 0, limit = 15_000 ) => {
	const remaining = Math.max( 0, limit - used );
	return {
		credits_limit: limit,
		credits_used: used,
		credits_remaining: remaining,
		blocked: remaining === 0,
		exhausted: remaining === 0,
		resets_at: '2026-10-01T00:00:00+00:00',
		upgrade_url: null,
	};
};

function makeProps(
	requestStatus: JetpackAiStatusRequester,
	overrides: Partial< HookProps > = {}
): HookProps {
	return {
		error: null,
		enabled: true,
		isWpcomPlatform: false,
		requestStatus,
		settledRequestCount: 0,
		siteId: 123,
		...overrides,
	};
}

beforeEach( () => {
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
	it( 'prefers a valid terminal cost snapshot over legacy request fields', () => {
		expect(
			getJetpackAiStatus( { ...featureResponse(), 'requests-count': 19 }, creditSnapshot( 3_000 ) )
		).toEqual( {
			kind: 'cost',
			limit: 15_000,
			used: 3_000,
			remaining: 12_000,
			resetsAt: '2026-10-01T00:00:00+00:00',
			isExhausted: false,
			upgradeUrl: null,
		} );
	} );

	it.each( [
		[ 'positive limit', { credits_limit: 0 } ],
		[ 'integer usage', { credits_used: 1.5 } ],
		[ 'internally consistent balance', { credits_remaining: 1 } ],
		[ 'required blocked state', { blocked: undefined } ],
		[ 'boolean blocked state', { blocked: 'yes' } ],
		[ 'blocked only at exhaustion', { blocked: true } ],
		[ 'boolean exhaustion state', { exhausted: 'yes' } ],
		[ 'exhaustion matching the balance', { exhausted: true } ],
		[ 'UTC reset boundary', { resets_at: '2026-10-01T00:00:00-05:00' } ],
		[ 'first-of-month reset boundary', { resets_at: '2026-10-02T00:00:00Z' } ],
	] )( 'falls back to legacy requests when the snapshot has an invalid %s', ( _name, override ) => {
		expect(
			getJetpackAiStatus( featureResponse( 3 ), { ...creditSnapshot(), ...override } )
		).toMatchObject( { kind: 'legacy', requestsRemaining: 17 } );
	} );

	it( 'does not invent a balance from a malformed snapshot without a valid legacy fallback', () => {
		expect(
			getJetpackAiStatus( {}, { ...creditSnapshot(), credits_used: '3000' } )
		).toBeUndefined();
	} );

	it( 'separates exhausted allowance from backend admission', () => {
		expect(
			getJetpackAiStatus( {}, { ...creditSnapshot( 15_000 ), blocked: false } )
		).toMatchObject( {
			kind: 'cost',
			remaining: 0,
			isExhausted: true,
		} );
	} );

	it( 'uses the legacy request tier only when no valid cost snapshot exists', () => {
		expect( getJetpackAiStatus( featureResponse( 21 ) ) ).toEqual( {
			kind: 'legacy',
			requestsRemaining: 0,
			isExhausted: true,
			upgradeUrl: UPGRADE_URL,
		} );
	} );

	it( 'does not reinterpret a paid legacy tier as credits', () => {
		expect(
			getJetpackAiStatus( {
				...featureResponse(),
				'current-tier': { slug: 'jetpack_ai_yearly', value: 1, limit: 100 },
			} )
		).toBeNull();
	} );
} );

describe( 'formatRemainingPercentage', () => {
	it.each( [
		[ 15_000, 15_000, '100%' ],
		[ 14_999, 15_000, '99%' ],
		[ 150, 15_000, '1%' ],
		[ 149, 15_000, '<1%' ],
		[ 1, 15_000, '<1%' ],
		[ 0, 15_000, '0%' ],
	] )( 'formats %d of %d as %s', ( remaining, limit, expected ) => {
		expect( formatRemainingPercentage( remaining, limit ) ).toBe( expected );
	} );
} );

describe( 'useJetpackFreeCreditChatNotice', () => {
	beforeEach( () => {
		testWindow.wpApiSettings = { root: LOCAL_API_ROOT };
	} );

	it( 'excludes WordPress.com-hosted sites from fetching and display', () => {
		const requestStatus = jest.fn().mockResolvedValue( featureResponse() );
		const { result } = renderHook( () =>
			useJetpackFreeCreditChatNotice(
				makeProps( requestStatus, {
					aiCredits: creditSnapshot( 3_000 ),
					error: QUOTA_ERROR,
					isWpcomPlatform: true,
				} )
			)
		);

		expect( requestStatus ).not.toHaveBeenCalled();
		expect( result.current ).toBeUndefined();
	} );

	it( 'honors the WordPress.com platform signal when the explicit flag is absent', () => {
		testWindow.JetpackScriptData = { site: { is_wpcom_platform: true } };
		const requestStatus = jest.fn().mockResolvedValue( featureResponse() );
		const { result } = renderHook( () =>
			useJetpackFreeCreditChatNotice(
				makeProps( requestStatus, { isWpcomPlatform: undefined, error: QUOTA_ERROR } )
			)
		);

		expect( requestStatus ).not.toHaveBeenCalled();
		expect( result.current ).toBeUndefined();
	} );

	it( 'uses the injected requester for the self-hosted legacy fallback', async () => {
		const requestStatus = jest.fn().mockResolvedValue( featureResponse( 3 ) );
		const { result, unmount } = renderHook( () =>
			useJetpackFreeCreditChatNotice( makeProps( requestStatus ) )
		);

		await waitFor( () => expect( result.current?.message ).toBe( '17 free requests left' ) );
		expect( requestStatus ).toHaveBeenCalledWith( { path: STATUS_PATH } );
		unmount();
	} );

	it( 'keeps a valid terminal cost snapshot ahead of the fetched request count', async () => {
		const requestStatus = jest.fn().mockResolvedValue( featureResponse( 19 ) );
		const { result, unmount } = renderHook( () =>
			useJetpackFreeCreditChatNotice(
				makeProps( requestStatus, { aiCredits: creditSnapshot( 3_000 ), aiCreditsRevision: 1 } )
			)
		);

		await waitFor( () => expect( requestStatus ).toHaveBeenCalledTimes( 1 ) );
		expect( result.current ).toMatchObject( { dismissible: false } );
		expect( result.current?.message ).toContain( '80% of this month’s Jetpack AI allowance left.' );
		expect( result.current?.message ).not.toContain( 'free request' );
		unmount();
	} );

	it( 'renders terminal exhaustion as a persistent error notice', () => {
		const requestStatus = jest.fn().mockResolvedValue( featureResponse() );
		const { result, unmount } = renderHook( () =>
			useJetpackFreeCreditChatNotice(
				makeProps( requestStatus, { aiCredits: creditSnapshot( 15_000 ), aiCreditsRevision: 1 } )
			)
		);

		expect( result.current ).toMatchObject( {
			status: 'error',
			dismissible: false,
		} );
		expect( result.current?.message ).toContain( '(0% left)' );
		unmount();
	} );

	it( 'refreshes the legacy fallback after a request settles', async () => {
		const requestStatus = jest
			.fn()
			.mockResolvedValueOnce( featureResponse( 3 ) )
			.mockResolvedValueOnce( featureResponse( 4 ) );
		const initialProps = makeProps( requestStatus );
		const { result, rerender, unmount } = renderHook(
			( props: HookProps ) => useJetpackFreeCreditChatNotice( props ),
			{ initialProps }
		);

		await waitFor( () => expect( result.current?.message ).toBe( '17 free requests left' ) );

		rerender( { ...initialProps, settledRequestCount: 1 } );

		await waitFor( () => expect( result.current?.message ).toBe( '16 free requests left' ) );
		expect( requestStatus ).toHaveBeenNthCalledWith( 2, {
			path: `${ STATUS_PATH }?skip_cache=true`,
		} );
		unmount();
	} );

	it( 'keeps the delayed cached fallback after the immediate refresh', async () => {
		jest.useFakeTimers();
		try {
			const requestStatus = jest
				.fn()
				.mockResolvedValueOnce( featureResponse() )
				.mockResolvedValueOnce( featureResponse( 1 ) )
				.mockResolvedValueOnce( featureResponse( 1 ) );
			const initialProps = makeProps( requestStatus );
			const { result, rerender, unmount } = renderHook(
				( props: HookProps ) => useJetpackFreeCreditChatNotice( props ),
				{ initialProps }
			);

			await act( async () => Promise.resolve() );
			rerender( { ...initialProps, settledRequestCount: 1 } );
			await act( async () => Promise.resolve() );
			expect( requestStatus ).toHaveBeenCalledTimes( 2 );
			expect( requestStatus ).toHaveBeenNthCalledWith( 2, {
				path: `${ STATUS_PATH }?skip_cache=true`,
			} );
			expect( result.current?.message ).toBe( '19 free requests left' );

			act( () => jest.advanceTimersByTime( 60_999 ) );
			expect( requestStatus ).toHaveBeenCalledTimes( 2 );

			act( () => jest.advanceTimersByTime( 1 ) );
			await act( async () => Promise.resolve() );
			expect( requestStatus ).toHaveBeenNthCalledWith( 3, { path: STATUS_PATH } );
			expect( result.current?.message ).toBe( '19 free requests left' );
			unmount();
		} finally {
			jest.clearAllTimers();
			jest.useRealTimers();
		}
	} );

	it( 'retires the pre-upgrade snapshot after a focus refresh confirms a paid tier', async () => {
		const paidResponse = {
			...featureResponse(),
			'is-over-limit': false,
			'current-tier': { slug: 'jetpack_ai_yearly', value: 1, limit: 100 },
		};
		const requestStatus = jest
			.fn()
			.mockResolvedValueOnce( featureResponse( 20 ) )
			.mockResolvedValueOnce( paidResponse );
		const recordUpgradeClick = jest.fn();
		const initialProps = makeProps( requestStatus, {
			aiCredits: creditSnapshot( 15_000 ),
			aiCreditsRevision: 1,
			error: QUOTA_ERROR,
			recordUpgradeClick,
		} );
		const { result, rerender, unmount } = renderHook(
			( props: HookProps ) => useJetpackFreeCreditChatNotice( props ),
			{ initialProps }
		);

		await waitFor( () => expect( result.current?.action ).toMatchObject( { label: 'Upgrade' } ) );
		result.current?.action?.onClick();
		expect( recordUpgradeClick ).toHaveBeenCalledTimes( 1 );
		expect( mockOpen ).toHaveBeenCalledWith( UPGRADE_URL, '_blank', 'noopener,noreferrer' );
		expect( requestStatus ).toHaveBeenCalledTimes( 1 );

		act( () => window.dispatchEvent( new Event( 'focus' ) ) );

		await waitFor( () => {
			expect( requestStatus ).toHaveBeenNthCalledWith( 2, {
				path: `${ STATUS_PATH }?skip_cache=true`,
			} );
			expect( result.current ).toEqual( { suppressCurrentError: true } );
		} );

		rerender( {
			...initialProps,
			aiCredits: creditSnapshot( 3_000 ),
			aiCreditsRevision: 2,
		} );
		expect( result.current ).toMatchObject( { suppressCurrentError: true } );
		expect( result.current?.message ).toContain( '80% of this month’s Jetpack AI allowance left.' );
		unmount();
	} );

	it( 'does not fetch without a positive site ID or a trusted same-origin REST root', () => {
		const requestStatus = jest.fn().mockResolvedValue( featureResponse() );
		const { rerender } = renderHook(
			( props: HookProps ) => useJetpackFreeCreditChatNotice( props ),
			{ initialProps: makeProps( requestStatus, { siteId: 0 } ) }
		);

		expect( requestStatus ).not.toHaveBeenCalled();

		testWindow.wpApiSettings = { root: 'https://public-api.wordpress.com/' };
		rerender( makeProps( requestStatus, { siteId: 123 } ) );
		expect( requestStatus ).not.toHaveBeenCalled();

		testWindow.wpApiSettings = { root: 'blob:http://localhost/wp-json/' };
		rerender( makeProps( requestStatus, { siteId: 456 } ) );
		expect( requestStatus ).not.toHaveBeenCalled();
	} );

	it( 'coalesces settled-count changes while the injected request is in flight', async () => {
		let resolveRefresh: ( response: ReturnType< typeof featureResponse > ) => void = () => {};
		const requestStatus = jest
			.fn()
			.mockResolvedValueOnce( featureResponse() )
			.mockImplementationOnce(
				() =>
					new Promise( ( resolve ) => {
						resolveRefresh = resolve;
					} )
			)
			.mockResolvedValueOnce( featureResponse( 3 ) );
		const initialProps = makeProps( requestStatus );
		const { result, rerender, unmount } = renderHook(
			( props: HookProps ) => useJetpackFreeCreditChatNotice( props ),
			{ initialProps }
		);

		await waitFor( () => expect( result.current?.message ).toBe( '20 free requests left' ) );
		rerender( { ...initialProps, settledRequestCount: 1 } );
		await waitFor( () => expect( requestStatus ).toHaveBeenCalledTimes( 2 ) );

		rerender( { ...initialProps, settledRequestCount: 2 } );
		rerender( { ...initialProps, settledRequestCount: 3 } );
		expect( requestStatus ).toHaveBeenCalledTimes( 2 );

		await act( async () => resolveRefresh( featureResponse( 1 ) ) );
		await waitFor( () => expect( requestStatus ).toHaveBeenCalledTimes( 3 ) );
		expect( requestStatus ).toHaveBeenNthCalledWith( 3, {
			path: `${ STATUS_PATH }?skip_cache=true`,
		} );
		expect( result.current?.message ).toBe( '17 free requests left' );
		unmount();
	} );
} );
