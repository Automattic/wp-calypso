/**
 * @jest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';
import { getFreeCreditStatus, useJetpackFreeCreditChatNotice } from './free-credit-notice';
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
const mockAssign = jest.fn();
const UPGRADE_URL = 'https://wordpress.com/checkout/example.com/ai-monthly';
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

const defaultProps = {
	error: null,
	enabled: true,
	isWpcomPlatform: true,
	settledRequestCount: 0,
	siteId: 123,
};

beforeAll( () => {
	Object.defineProperty( window, 'location', {
		configurable: true,
		value: { ...window.location, assign: mockAssign },
	} );
} );

beforeEach( () => {
	mockApiFetch.mockReset();
	mockTrackJetpackAiUpgrade.mockReset();
	mockAssign.mockReset();
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

describe( 'getFreeCreditStatus', () => {
	it( 'uses the all-time free request count and clamps remaining credits to zero', () => {
		expect( getFreeCreditStatus( featureResponse( 21 ) ) ).toEqual( {
			remaining: 0,
			isExhausted: true,
			upgradeUrl: UPGRADE_URL,
		} );
	} );

	it( 'ignores a paid tier', () => {
		expect(
			getFreeCreditStatus( {
				...featureResponse(),
				'current-tier': { slug: 'jetpack_ai_yearly', value: 1, limit: 100 },
			} )
		).toBeNull();
	} );

	it( 'does not treat malformed free-tier data as a paid tier', () => {
		expect(
			getFreeCreditStatus( {
				...featureResponse(),
				'requests-count': '3',
			} )
		).toBeUndefined();
	} );

	it( 'uses the site-specific free limit before the tier default', () => {
		expect(
			getFreeCreditStatus( {
				...featureResponse( 20 ),
				'is-over-limit': false,
				'requests-limit': 1000,
			} )
		).toMatchObject( { remaining: 980, isExhausted: false } );
	} );

	it( 'keeps the status but drops an untrusted upgrade URL', () => {
		expect(
			getFreeCreditStatus( {
				...featureResponse(),
				'upgrade-url': 'https://wordpress.com.evil.example/checkout',
			} )
		).toMatchObject( { remaining: 20, upgradeUrl: null } );
	} );
} );

describe( 'Simple status', () => {
	beforeEach( () => {
		testWindow.wpApiSettings = { root: PUBLIC_API_ROOT };
	} );

	it.each( [
		[ 0, '20 free credits left' ],
		[ 19, '1 free credit left' ],
	] )( 'always shows the remaining free credits for %d requests used', async ( used, message ) => {
		mockApiFetch.mockResolvedValue( featureResponse( used ) );
		const { result } = renderHook( () => useJetpackFreeCreditChatNotice( defaultProps ) );

		await waitFor( () => expect( result.current?.message ).toBe( message ) );
		expect( result.current ).toMatchObject( {
			dismissible: false,
			action: { label: 'Upgrade' },
		} );
		expect( result.current ).not.toHaveProperty( 'status' );
		expect( mockApiFetch ).toHaveBeenCalledWith( {
			path: '/wpcom/v2/sites/123/jetpack-ai/ai-assistant-feature?force=wpcom',
		} );
	} );

	it( 'shows the exhausted free-credit state and keeps Upgrade available', async () => {
		mockApiFetch.mockResolvedValue( featureResponse( 20 ) );
		const { result } = renderHook( () => useJetpackFreeCreditChatNotice( defaultProps ) );

		await waitFor( () =>
			expect( result.current ).toMatchObject( {
				message: 'You’re out of free credits.',
				status: 'error',
				dismissible: false,
				action: { label: 'Upgrade' },
			} )
		);

		result.current?.action?.onClick();
		expect( mockTrackJetpackAiUpgrade ).toHaveBeenCalledWith();
		expect( mockAssign ).toHaveBeenCalledWith( UPGRADE_URL );
	} );

	it( 'refetches immediately after the submitted request settles', async () => {
		mockApiFetch
			.mockResolvedValueOnce( featureResponse() )
			.mockResolvedValueOnce( featureResponse( 1 ) );
		const { result, rerender } = renderHook(
			( props: typeof defaultProps ) => useJetpackFreeCreditChatNotice( props ),
			{ initialProps: defaultProps }
		);

		await waitFor( () => expect( result.current?.message ).toBe( '20 free credits left' ) );
		rerender( { ...defaultProps, settledRequestCount: 1 } );

		await waitFor( () => expect( result.current?.message ).toBe( '19 free credits left' ) );
		expect( mockApiFetch ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'keeps a usable older response when the newer request fails', async () => {
		let resolveInitial: ( value: ReturnType< typeof featureResponse > ) => void = () => {};
		mockApiFetch
			.mockImplementationOnce(
				() =>
					new Promise( ( resolve ) => {
						resolveInitial = resolve;
					} )
			)
			.mockRejectedValueOnce( new Error( 'Status unavailable' ) );
		const { result, rerender } = renderHook(
			( props: typeof defaultProps ) => useJetpackFreeCreditChatNotice( props ),
			{ initialProps: defaultProps }
		);

		await waitFor( () => expect( mockApiFetch ).toHaveBeenCalledTimes( 1 ) );
		rerender( { ...defaultProps, settledRequestCount: 1 } );
		await waitFor( () => expect( mockApiFetch ).toHaveBeenCalledTimes( 2 ) );
		await act( async () => resolveInitial( featureResponse() ) );

		await waitFor( () => expect( result.current?.message ).toBe( '20 free credits left' ) );
	} );

	it( 'does not let an older response replace a newer post-turn count', async () => {
		let resolveInitial: ( value: ReturnType< typeof featureResponse > ) => void = () => {};
		let resolveRefresh: ( value: ReturnType< typeof featureResponse > ) => void = () => {};
		mockApiFetch
			.mockImplementationOnce(
				() =>
					new Promise( ( resolve ) => {
						resolveInitial = resolve;
					} )
			)
			.mockImplementationOnce(
				() =>
					new Promise( ( resolve ) => {
						resolveRefresh = resolve;
					} )
			);
		const { result, rerender } = renderHook(
			( props: typeof defaultProps ) => useJetpackFreeCreditChatNotice( props ),
			{ initialProps: defaultProps }
		);

		await waitFor( () => expect( mockApiFetch ).toHaveBeenCalledTimes( 1 ) );
		rerender( { ...defaultProps, settledRequestCount: 1 } );
		await waitFor( () => expect( mockApiFetch ).toHaveBeenCalledTimes( 2 ) );
		await act( async () => resolveRefresh( featureResponse( 10 ) ) );
		await waitFor( () => expect( result.current?.message ).toBe( '10 free credits left' ) );
		await act( async () => resolveInitial( featureResponse() ) );

		expect( result.current?.message ).toBe( '10 free credits left' );
	} );

	it( 'requires a positive site ID for the Public API route', () => {
		mockApiFetch.mockResolvedValue( featureResponse() );
		const { result } = renderHook( () =>
			useJetpackFreeCreditChatNotice( { ...defaultProps, siteId: 0 } )
		);

		expect( mockApiFetch ).not.toHaveBeenCalled();
		expect( result.current ).toBeUndefined();
	} );
} );

describe( 'Atomic and self-hosted status', () => {
	beforeEach( () => {
		testWindow.wpApiSettings = { root: LOCAL_API_ROOT };
	} );

	it.each( [
		[ 'Atomic', true ],
		[ 'self-hosted', false ],
	] as const )( 'uses the local endpoint on %s', async ( _siteType, isWpcomPlatform ) => {
		mockApiFetch.mockResolvedValue( featureResponse() );
		const { result, unmount } = renderHook( () =>
			useJetpackFreeCreditChatNotice( { ...defaultProps, isWpcomPlatform } )
		);

		await waitFor( () => expect( result.current?.message ).toBe( '20 free credits left' ) );
		expect( mockApiFetch ).toHaveBeenCalledWith( {
			path: '/wpcom/v2/jetpack-ai/ai-assistant-feature',
		} );
		unmount();
	} );

	it( 'accepts a relative same-origin REST root', async () => {
		testWindow.wpApiSettings = { root: '/wp-json/' };
		mockApiFetch.mockResolvedValue( featureResponse() );
		const { result, unmount } = renderHook( () =>
			useJetpackFreeCreditChatNotice( { ...defaultProps, isWpcomPlatform: false } )
		);

		await waitFor( () => expect( result.current?.message ).toBe( '20 free credits left' ) );
		expect( mockApiFetch ).toHaveBeenCalledTimes( 1 );
		unmount();
	} );

	it( 'refreshes only after the Jetpack cache expires', async () => {
		jest.useFakeTimers();
		try {
			mockApiFetch
				.mockResolvedValueOnce( featureResponse() )
				.mockResolvedValueOnce( featureResponse( 1 ) );
			const { result, rerender, unmount } = renderHook(
				( props: typeof defaultProps ) => useJetpackFreeCreditChatNotice( props ),
				{ initialProps: defaultProps }
			);

			await act( async () => Promise.resolve() );
			rerender( { ...defaultProps, settledRequestCount: 1 } );
			expect( mockApiFetch ).toHaveBeenCalledTimes( 1 );

			act( () => jest.advanceTimersByTime( 61_000 ) );
			await act( async () => Promise.resolve() );
			expect( mockApiFetch ).toHaveBeenCalledTimes( 2 );
			expect( result.current?.message ).toBe( '19 free credits left' );
			unmount();
		} finally {
			jest.clearAllTimers();
			jest.useRealTimers();
		}
	} );

	it( 'keeps the first refresh deadline across later turns', async () => {
		jest.useFakeTimers();
		try {
			mockApiFetch
				.mockResolvedValueOnce( featureResponse() )
				.mockResolvedValueOnce( featureResponse( 2 ) );
			const { result, rerender, unmount } = renderHook(
				( props: typeof defaultProps ) => useJetpackFreeCreditChatNotice( props ),
				{ initialProps: defaultProps }
			);

			await act( async () => Promise.resolve() );
			rerender( { ...defaultProps, settledRequestCount: 1 } );
			act( () => jest.advanceTimersByTime( 30_000 ) );
			rerender( { ...defaultProps, settledRequestCount: 2 } );
			act( () => jest.advanceTimersByTime( 30_999 ) );
			expect( mockApiFetch ).toHaveBeenCalledTimes( 1 );

			act( () => jest.advanceTimersByTime( 1 ) );
			await act( async () => Promise.resolve() );
			expect( mockApiFetch ).toHaveBeenCalledTimes( 2 );
			expect( result.current?.message ).toBe( '18 free credits left' );
			unmount();
		} finally {
			jest.clearAllTimers();
			jest.useRealTimers();
		}
	} );

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
			mockApiFetch.mockResolvedValue( featureResponse() );
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
				mockApiFetch.mockResolvedValue( featureResponse() );
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
				expect( mockApiFetch ).toHaveBeenCalledTimes( transition === 'site change' ? 3 : 1 );

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
		expect( result.current ).toMatchObject( {
			message: 'You’ve reached your Jetpack AI usage limit.',
			suppressCurrentError: true,
		} );
	} );

	it.each( [ false, true ] )( 'uses the Jetpack platform signal when it is %s', async ( value ) => {
		testWindow.wpApiSettings = { root: LOCAL_API_ROOT };
		testWindow.JetpackScriptData = { site: { is_wpcom_platform: value } };
		mockApiFetch.mockResolvedValue( featureResponse() );
		const { result, unmount } = renderHook( () =>
			useJetpackFreeCreditChatNotice( {
				error: null,
				enabled: true,
				settledRequestCount: 0,
				siteId: 123,
			} )
		);

		await waitFor( () => expect( result.current?.message ).toBe( '20 free credits left' ) );
		expect( mockApiFetch ).toHaveBeenCalledTimes( 1 );
		unmount();
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

	it( 'keeps the exhausted state when the cached count still has one credit', async () => {
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

		await waitFor( () => expect( result.current?.message ).toBe( '1 free credit left' ) );
		rerender( { ...initialProps, error: CURRENT_ENDPOINT_ERROR } );

		expect( result.current ).toMatchObject( {
			message: 'You’re out of free credits.',
			status: 'error',
			suppressCurrentError: true,
		} );

		rerender( initialProps );
		expect( result.current ).toMatchObject( {
			message: 'You’re out of free credits.',
			status: 'error',
			suppressCurrentError: false,
		} );
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
