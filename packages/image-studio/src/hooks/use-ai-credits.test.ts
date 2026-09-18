/**
 * Tests for useAiCredits and the credit rules it mirrors from the backend's
 * `Image_Usage` class.
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';
import { ImageStudioMode } from '../types';
import {
	trackImageStudioUpgradeNoticeShown,
	trackImageStudioUpgradeNoticeClick,
} from '../utils/tracking';
import {
	AI_CREDITS_LOW_THRESHOLD,
	getAiCreditsNoticeLevel,
	mapAiAssistantFeatureResponse,
	useAiCredits,
} from './use-ai-credits';

jest.mock( '@wordpress/api-fetch' );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

jest.mock( '../utils/tracking', () => ( {
	trackImageStudioUpgradeNoticeShown: jest.fn(),
	trackImageStudioUpgradeNoticeClick: jest.fn(),
} ) );

const apiFetchMock = apiFetch as unknown as jest.Mock;

const UPGRADE_URL = 'https://jetpack.com/redirect/?source=jetpack-ai-yearly-tier-upgrade-nudge';
const NOTHING = { notice: undefined, isLimitReached: false, isLoading: false };

const freeTierResponse = ( requestsCount: number ) => ( {
	'site-require-upgrade': false,
	'current-tier': { value: 0, limit: 20 },
	'requests-count': requestsCount,
	'requests-limit': 20,
	'upgrade-url': UPGRADE_URL,
} );

const outOfCreditsResponse = { ...freeTierResponse( 20 ), 'site-require-upgrade': true };

const upgradeAction = { label: 'Upgrade plan', onClick: expect.any( Function ) };

describe( 'mapAiAssistantFeatureResponse', () => {
	it.each( [
		{
			name: 'uses all-time counts against the free limit on the free tier',
			response: {
				'current-tier': { value: 0, limit: 20 },
				'requests-count': 17,
				'requests-limit': 20,
				'usage-period': { 'requests-count': 3 },
			},
			remaining: 3,
		},
		{
			name: 'uses the current period against the tier limit on paid tiers',
			response: {
				'current-tier': { value: 100, limit: 100 },
				'requests-count': 500,
				'requests-limit': 20,
				'usage-period': { 'requests-count': 96 },
			},
			remaining: 4,
		},
		{
			name: 'reports unlimited plans as null remaining',
			response: {
				'current-tier': { value: 1, limit: 1 },
				'requests-count': 5000,
				'requests-limit': 20,
				'usage-period': { 'requests-count': 3000 },
			},
			remaining: null,
		},
		{
			name: 'never reports negative remaining',
			response: {
				'current-tier': { value: 0, limit: 20 },
				'requests-count': 25,
				'requests-limit': 20,
			},
			remaining: 0,
		},
	] )( '$name', ( { response, remaining } ) => {
		expect( mapAiAssistantFeatureResponse( response ).remaining ).toBe( remaining );
	} );

	it( 'maps the upgrade requirement and upgrade URL', () => {
		const credits = mapAiAssistantFeatureResponse( {
			'site-require-upgrade': true,
			'upgrade-url': UPGRADE_URL,
		} );

		expect( credits.requireUpgrade ).toBe( true );
		expect( credits.upgradeUrl ).toBe( UPGRADE_URL );
	} );

	it( 'defaults a missing upgrade requirement, counts, and URL', () => {
		expect( mapAiAssistantFeatureResponse( {} ) ).toEqual( {
			requireUpgrade: false,
			remaining: null,
			upgradeUrl: null,
		} );
	} );
} );

describe( 'getAiCreditsNoticeLevel', () => {
	it.each( [
		{
			name: 'out when the site requires an upgrade, whatever remains',
			requireUpgrade: true,
			remaining: 3,
			level: 'out',
		},
		{ name: 'low at 1 remaining', requireUpgrade: false, remaining: 1, level: 'low' },
		{
			name: 'low at the threshold',
			requireUpgrade: false,
			remaining: AI_CREDITS_LOW_THRESHOLD,
			level: 'low',
		},
		{
			name: 'nothing above the threshold',
			requireUpgrade: false,
			remaining: AI_CREDITS_LOW_THRESHOLD + 1,
			level: null,
		},
		{
			name: 'nothing at zero remaining on a soft limit that needs no upgrade',
			requireUpgrade: false,
			remaining: 0,
			level: null,
		},
		{ name: 'nothing for unlimited plans', requireUpgrade: false, remaining: null, level: null },
	] )( '$name', ( { requireUpgrade, remaining, level } ) => {
		expect( getAiCreditsNoticeLevel( { requireUpgrade, remaining, upgradeUrl: null } ) ).toBe(
			level
		);
	} );
} );

describe( 'useAiCredits', () => {
	const renderCredits = ( mode = ImageStudioMode.Generate, isProcessing = false ) =>
		renderHook(
			( props: { mode: ImageStudioMode; isProcessing: boolean } ) => useAiCredits( props ),
			{ initialProps: { mode, isProcessing } }
		);

	/** Waits for the check to settle. */
	async function waitForCheck( result: { current: { isLoading: boolean } } ) {
		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
	}

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'requests the endpoint, reports loading, and fails open after 5 seconds', () => {
		jest.useFakeTimers();
		apiFetchMock.mockReturnValue( new Promise( () => {} ) );

		const { result } = renderCredits();

		expect( apiFetchMock ).toHaveBeenCalledWith( {
			path: '/wpcom/v2/jetpack-ai/ai-assistant-feature',
		} );
		expect( result.current ).toEqual( { ...NOTHING, isLoading: true } );

		act( () => {
			jest.advanceTimersByTime( 5000 );
		} );

		expect( result.current ).toEqual( NOTHING );
	} );

	it( 'still applies an answer that arrives after the timeout', async () => {
		jest.useFakeTimers();
		let resolveFetch: ( value: unknown ) => void = () => {};
		apiFetchMock.mockReturnValue(
			new Promise( ( resolve ) => {
				resolveFetch = resolve;
			} )
		);

		const { result } = renderCredits();
		act( () => {
			jest.advanceTimersByTime( 5000 );
		} );
		expect( result.current ).toEqual( NOTHING );

		await act( async () => {
			resolveFetch( outOfCreditsResponse );
		} );

		await waitFor( () => expect( result.current.isLimitReached ).toBe( true ) );
	} );

	it( 'locks the input and shows a persistent upgrade notice when out of credits', async () => {
		const openSpy = jest.spyOn( window, 'open' ).mockReturnValue( null );
		apiFetchMock.mockResolvedValue( outOfCreditsResponse );

		const { result } = renderCredits( ImageStudioMode.Edit );

		await waitFor( () =>
			expect( result.current ).toEqual( {
				notice: {
					message: "You're out of free credits.",
					status: 'warning',
					dismissible: false,
					action: upgradeAction,
				},
				isLimitReached: true,
				isLoading: false,
			} )
		);
		expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledWith( {
			mode: ImageStudioMode.Edit,
			trigger: 'open',
		} );

		result.current.notice?.action?.onClick();

		expect( trackImageStudioUpgradeNoticeClick ).toHaveBeenCalledWith( {
			mode: ImageStudioMode.Edit,
			trigger: 'open',
		} );
		expect( openSpy ).toHaveBeenCalledWith( UPGRADE_URL, '_blank', 'noopener,noreferrer' );
		openSpy.mockRestore();
	} );

	it( 'keeps the input open and shows a persistent notice when credits are low', async () => {
		apiFetchMock.mockResolvedValue( freeTierResponse( 17 ) );

		const { result } = renderCredits();

		await waitFor( () =>
			expect( result.current ).toEqual( {
				notice: {
					message: "You're almost out of free credits.",
					status: 'warning',
					dismissible: false,
					action: upgradeAction,
				},
				isLimitReached: false,
				isLoading: false,
			} )
		);
	} );

	it( 'returns nothing and logs when the request fails', async () => {
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		apiFetchMock.mockRejectedValue( new Error( 'rest_forbidden' ) );

		const { result } = renderCredits();
		await waitForCheck( result );

		expect( result.current ).toEqual( NOTHING );
		expect( trackImageStudioUpgradeNoticeShown ).not.toHaveBeenCalled();
		expect( consoleError ).toHaveBeenCalled();
		consoleError.mockRestore();
	} );

	it( 'omits the action when there is no upgrade URL', async () => {
		apiFetchMock.mockResolvedValue( { ...outOfCreditsResponse, 'upgrade-url': null } );

		const { result } = renderCredits();

		await waitFor( () => expect( result.current.notice ).toBeDefined() );
		expect( result.current.notice?.action ).toBeUndefined();
	} );

	it( 'ignores a late response after the modal closed', async () => {
		let resolveFetch: ( value: unknown ) => void = () => {};
		apiFetchMock.mockReturnValue(
			new Promise( ( resolve ) => {
				resolveFetch = resolve;
			} )
		);

		const { unmount } = renderCredits();
		await waitFor( () => expect( apiFetchMock ).toHaveBeenCalled() );
		unmount();

		await act( async () => {
			resolveFetch( outOfCreditsResponse );
		} );

		expect( trackImageStudioUpgradeNoticeShown ).not.toHaveBeenCalled();
	} );

	it( 'does not check again when the mode changes', async () => {
		apiFetchMock.mockResolvedValue( freeTierResponse( 17 ) );

		const { result, rerender } = renderCredits( ImageStudioMode.Generate );
		await waitForCheck( result );
		// The first generation moves the studio from generate to edit mode.
		rerender( { mode: ImageStudioMode.Edit, isProcessing: false } );
		await act( async () => {} );

		expect( apiFetchMock ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'checks again when a turn ends and applies the new balance', async () => {
		apiFetchMock
			.mockResolvedValueOnce( freeTierResponse( 5 ) )
			.mockResolvedValueOnce( outOfCreditsResponse );

		const { result, rerender } = renderCredits();
		await waitForCheck( result );
		expect( result.current ).toEqual( NOTHING );

		rerender( { mode: ImageStudioMode.Generate, isProcessing: true } );
		rerender( { mode: ImageStudioMode.Generate, isProcessing: false } );

		await waitFor( () => expect( result.current.isLimitReached ).toBe( true ) );
		expect( apiFetchMock ).toHaveBeenCalledTimes( 2 );
		expect( trackImageStudioUpgradeNoticeShown ).toHaveBeenCalledWith( {
			mode: ImageStudioMode.Generate,
			trigger: 'refresh',
		} );
	} );

	it( 'does not check again while a turn is running', async () => {
		apiFetchMock.mockResolvedValue( freeTierResponse( 5 ) );

		const { result, rerender } = renderCredits();
		await waitForCheck( result );
		rerender( { mode: ImageStudioMode.Generate, isProcessing: true } );
		await act( async () => {} );

		expect( apiFetchMock ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'keeps the last known balance when a later check fails', async () => {
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		apiFetchMock
			.mockResolvedValueOnce( freeTierResponse( 17 ) )
			.mockRejectedValueOnce( new Error( 'down' ) );

		const { result, rerender } = renderCredits();
		await waitFor( () => expect( result.current.notice ).toBeDefined() );
		rerender( { mode: ImageStudioMode.Generate, isProcessing: true } );
		rerender( { mode: ImageStudioMode.Generate, isProcessing: false } );
		await waitFor( () => expect( consoleError ).toHaveBeenCalled() );

		expect( result.current.notice ).toBeDefined();
		consoleError.mockRestore();
	} );
} );
