import { getAgentsManagerInlineData } from '@automattic/agents-manager';
import { renderHook, waitFor } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';
import { ImageStudioMode } from '../types';
import {
	trackImageStudioUpgradeNoticeClick,
	trackImageStudioUpgradeNoticeShown,
} from '../utils/tracking';
import { useJetpackAiCreditNotice } from './use-jetpack-ai-credit-notice';
import type { NoticeConfig } from '@automattic/agenttic-ui';

jest.mock( '@automattic/agents-manager', () => ( {
	getAgentsManagerInlineData: jest.fn(),
} ) );

jest.mock( '@wordpress/api-fetch', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	_n: ( singular: string, plural: string, count: number ) => ( count === 1 ? singular : plural ),
	sprintf: ( text: string, count: number ) => text.replace( '%d', String( count ) ),
} ) );

jest.mock( '../utils/tracking', () => ( {
	trackImageStudioUpgradeNoticeClick: jest.fn(),
	trackImageStudioUpgradeNoticeShown: jest.fn(),
} ) );

jest.mock( '@automattic/jetpack-ai-sidebar/src/utils/tracking', () => ( {
	trackJetpackAiUpgrade: jest.fn(),
} ) );

const mockGetAgentsManagerInlineData = getAgentsManagerInlineData as jest.Mock;
const mockApiFetch = apiFetch as jest.Mock;
const mockTrackUpgradeClick = trackImageStudioUpgradeNoticeClick as jest.Mock;
const mockTrackUpgradeShown = trackImageStudioUpgradeNoticeShown as jest.Mock;

function featureResponse( requestsCount = 8 ) {
	return {
		'is-over-limit': requestsCount >= 20,
		'requests-count': requestsCount,
		'requests-limit': 20,
		'upgrade-url': `${ window.location.origin }/wp-admin/admin.php?page=my-jetpack#/add-jetpack-ai`,
		'current-tier': { slug: 'jetpack_ai_free', value: 0, limit: 20 },
	};
}

describe( 'useJetpackAiCreditNotice', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockGetAgentsManagerInlineData.mockReturnValue( {
			isWpcomPlatform: false,
			site: { ID: 123 },
		} );
		( window as Window & { wpApiSettings?: { root: string } } ).wpApiSettings = {
			root: `${ window.location.origin }/wp-json/`,
		};
	} );

	it( 'shows the self-hosted balance and refreshes it after a request settles', async () => {
		mockApiFetch
			.mockResolvedValueOnce( featureResponse( 8 ) )
			.mockResolvedValueOnce( featureResponse( 9 ) );
		const initialProps = { settledRequestCount: 0 };
		const { result, rerender, unmount } = renderHook(
			( props: typeof initialProps ) =>
				useJetpackAiCreditNotice( {
					error: null,
					isVideoMode: false,
					mode: ImageStudioMode.Generate,
					settledRequestCount: props.settledRequestCount,
				} ),
			{ initialProps }
		);

		await waitFor( () => expect( result.current?.message ).toBe( '12 free credits left' ) );
		rerender( { settledRequestCount: 1 } );

		await waitFor( () => expect( result.current?.message ).toBe( '11 free credits left' ) );
		expect( mockApiFetch ).toHaveBeenNthCalledWith( 2, {
			path: '/wpcom/v2/jetpack-ai/ai-assistant-feature?skip_cache=true',
		} );
		unmount();
	} );

	it.each( [
		[ 'Simple or Atomic', { isWpcomPlatform: true, site: { ID: 123 } }, false ],
		[ 'unknown platform', { site: { ID: 123 } }, false ],
		[ 'video mode', { isWpcomPlatform: false, site: { ID: 123 } }, true ],
	] )( 'does not show or fetch the balance on %s', ( _label, inlineData, isVideoMode ) => {
		mockGetAgentsManagerInlineData.mockReturnValue( inlineData );
		mockApiFetch.mockResolvedValue( featureResponse() );

		const { result } = renderHook( () =>
			useJetpackAiCreditNotice( {
				error: null,
				isVideoMode,
				mode: ImageStudioMode.Generate,
				settledRequestCount: 0,
			} )
		);

		expect( result.current ).toBeUndefined();
		expect( mockApiFetch ).not.toHaveBeenCalled();
	} );

	it( 'keeps the Image Studio rejection notice while status refresh is unavailable', () => {
		mockApiFetch.mockRejectedValue( new Error( 'Status unavailable' ) );
		const rejectionNotice = {
			message: 'You’re out of free credits.',
			status: 'error' as const,
			dismissible: false,
		};

		const { result } = renderHook( () =>
			useJetpackAiCreditNotice( {
				error: 'Jetpack AI usage limit reached',
				isVideoMode: false,
				mode: ImageStudioMode.Edit,
				rejectionNotice,
				settledRequestCount: 0,
			} )
		);

		expect( result.current ).toBe( rejectionNotice );
	} );

	it( 'keeps the Image Studio rejection notice without a site ID', () => {
		mockGetAgentsManagerInlineData.mockReturnValue( { isWpcomPlatform: false } );
		const rejectionNotice = {
			message: 'You’re out of free credits.',
			status: 'error' as const,
			dismissible: false,
		};

		const { result } = renderHook( () =>
			useJetpackAiCreditNotice( {
				error: 'Jetpack AI usage limit reached',
				isVideoMode: false,
				mode: ImageStudioMode.Edit,
				rejectionNotice,
				settledRequestCount: 0,
			} )
		);

		expect( result.current ).toBe( rejectionNotice );
		expect( mockApiFetch ).not.toHaveBeenCalled();
	} );

	it( 'does not track an Agent rejection as a status-derived exhaustion', () => {
		mockApiFetch.mockRejectedValue( new Error( 'Status unavailable' ) );
		const initialProps = { rejectionNotice: undefined as NoticeConfig | undefined };
		const { rerender } = renderHook(
			( props: typeof initialProps ) =>
				useJetpackAiCreditNotice( {
					error: 'Jetpack AI usage limit reached',
					isVideoMode: false,
					mode: ImageStudioMode.Edit,
					rejectionNotice: props.rejectionNotice,
					settledRequestCount: 0,
				} ),
			{ initialProps }
		);

		rerender( {
			rejectionNotice: {
				message: 'You’re out of free credits.',
				status: 'error',
				dismissible: false,
			},
		} );

		expect( mockTrackUpgradeShown ).not.toHaveBeenCalled();
	} );

	it( 'does not retrack a continuous exhausted status across a transient request error', async () => {
		mockApiFetch.mockResolvedValue( featureResponse( 20 ) );
		const initialProps = { error: null as string | null };
		const { rerender } = renderHook(
			( props: typeof initialProps ) =>
				useJetpackAiCreditNotice( {
					error: props.error,
					isVideoMode: false,
					mode: ImageStudioMode.Generate,
					settledRequestCount: 0,
				} ),
			{ initialProps }
		);

		await waitFor( () => expect( mockTrackUpgradeShown ).toHaveBeenCalledTimes( 1 ) );
		rerender( { error: 'Network request failed' } );
		rerender( initialProps );

		expect( mockTrackUpgradeShown ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'tracks and opens a status-derived upgrade action as Image Studio', async () => {
		mockApiFetch.mockResolvedValue( featureResponse( 20 ) );
		const openedWindow = { opener: window };
		const openSpy = jest
			.spyOn( window, 'open' )
			.mockReturnValue( openedWindow as unknown as Window );
		const { result, unmount } = renderHook( () =>
			useJetpackAiCreditNotice( {
				error: null,
				isVideoMode: false,
				mode: ImageStudioMode.Generate,
				settledRequestCount: 0,
			} )
		);

		await waitFor( () => expect( result.current?.status ).toBe( 'error' ) );
		await waitFor( () =>
			expect( mockTrackUpgradeShown ).toHaveBeenCalledWith( {
				mode: ImageStudioMode.Generate,
			} )
		);
		result.current?.action?.onClick();

		expect( mockTrackUpgradeClick ).toHaveBeenCalledWith( {
			mode: ImageStudioMode.Generate,
		} );
		expect( openSpy ).toHaveBeenCalledWith(
			`${ window.location.origin }/wp-admin/admin.php?page=my-jetpack#/add-jetpack-ai`,
			'_blank'
		);
		expect( openedWindow.opener ).toBeNull();

		unmount();
		openSpy.mockRestore();
	} );
} );
