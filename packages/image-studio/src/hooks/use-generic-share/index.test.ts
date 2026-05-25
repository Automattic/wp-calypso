import { act, renderHook } from '@testing-library/react';
import { useGenericShare } from './index';

const mockTrackClicked = jest.fn();
const mockTrackCompleted = jest.fn();
const mockTrackFailed = jest.fn();
const mockAddNotice = jest.fn();
const mockCreateCoreNotice = jest.fn();

let mockState: {
	currentVideoUrl: string | null;
	currentAttachmentId: number | null;
	entryPoint: string;
	isAiProcessing: boolean;
};

jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn( ( selector ) => {
		return selector( ( storeName: string ) => {
			if ( storeName === 'video-studio' ) {
				return {
					getCurrentVideoUrl: () => mockState.currentVideoUrl,
					getCurrentAttachmentId: () => mockState.currentAttachmentId,
				};
			}
			if ( storeName === 'image-studio' ) {
				return {
					getEntryPoint: () => mockState.entryPoint,
					getImageStudioAiProcessing: () => mockState.isAiProcessing,
				};
			}
			return {};
		} );
	} ),
	useDispatch: jest.fn( ( storeName: string ) => {
		if ( storeName === 'image-studio' ) {
			return { addNotice: mockAddNotice };
		}
		if ( storeName === 'core/notices' ) {
			return { createNotice: mockCreateCoreNotice };
		}
		return {};
	} ),
} ) );

jest.mock( '@wordpress/element', () => {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const React = require( 'react' );
	return {
		useCallback: ( fn: ( ...args: unknown[] ) => unknown ) => fn,
		useRef: React.useRef,
		useState: React.useState,
	};
} );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

jest.mock( '../../store', () => ( {
	store: 'image-studio',
	ImageStudioEntryPoint: {
		MediaLibrary: 'media_library',
		PostEditorFeatureClip: 'post_editor_feature_clip',
	},
} ) );

jest.mock( '../../stores/video-studio', () => ( {
	store: 'video-studio',
} ) );

jest.mock( '../../utils/tracking', () => ( {
	trackImageStudioGenericShareClicked: ( ...args: unknown[] ) => mockTrackClicked( ...args ),
	trackImageStudioGenericShareCompleted: ( ...args: unknown[] ) => mockTrackCompleted( ...args ),
	trackImageStudioGenericShareFailed: ( ...args: unknown[] ) => mockTrackFailed( ...args ),
} ) );

const originalNavigator = global.navigator;
const originalFetch = global.fetch;
const originalWindowOpen = window.open;

function setNavigatorShare( opts: {
	share?: ( ...args: unknown[] ) => Promise< void >;
	canShare?: ( data: { files?: File[] } ) => boolean;
} ): void {
	Object.defineProperty( global, 'navigator', {
		value: {
			...( originalNavigator as object ),
			...opts,
		},
		writable: true,
		configurable: true,
	} );
}

function fetchReturning( blob: Blob ): typeof fetch {
	return jest.fn().mockResolvedValue( {
		ok: true,
		status: 200,
		blob: () => Promise.resolve( blob ),
	} ) as unknown as typeof fetch;
}

const NOTICE_RE = /could not share the video/i;

afterEach( () => {
	Object.defineProperty( global, 'navigator', {
		value: originalNavigator,
		writable: true,
		configurable: true,
	} );
	global.fetch = originalFetch;
	window.open = originalWindowOpen;
} );

describe( 'useGenericShare', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockState = {
			currentVideoUrl: 'https://example.com/clip.mp4',
			currentAttachmentId: 555,
			entryPoint: 'post_editor_feature_clip',
			isAiProcessing: false,
		};
		mockAddNotice.mockResolvedValue( undefined );
		// The share button must never open a tab or download anything itself —
		// spy so any such attempt fails the test.
		window.open = jest.fn() as unknown as typeof window.open;
	} );

	describe( 'isVisible', () => {
		it( 'is true with video state, correct entry point, and not processing', () => {
			const { result } = renderHook( () => useGenericShare( 'modal' ) );
			expect( result.current.isVisible ).toBe( true );
		} );

		it( 'is false on a different entry point', () => {
			mockState.entryPoint = 'media_library';
			const { result } = renderHook( () => useGenericShare( 'modal' ) );
			expect( result.current.isVisible ).toBe( false );
		} );

		it( 'is false without a video URL', () => {
			mockState.currentVideoUrl = null;
			const { result } = renderHook( () => useGenericShare( 'modal' ) );
			expect( result.current.isVisible ).toBe( false );
		} );

		it( 'is false without an attachment ID', () => {
			mockState.currentAttachmentId = null;
			const { result } = renderHook( () => useGenericShare( 'modal' ) );
			expect( result.current.isVisible ).toBe( false );
		} );

		it( 'is false while AI is regenerating', () => {
			mockState.isAiProcessing = true;
			const { result } = renderHook( () => useGenericShare( 'modal' ) );
			expect( result.current.isVisible ).toBe( false );
		} );
	} );

	describe( 'handleShare — Web Share (files) path', () => {
		it( 'fetches the file and invokes navigator.share, opening nothing else', async () => {
			const mockShare = jest.fn().mockResolvedValue( undefined );
			setNavigatorShare( { share: mockShare, canShare: jest.fn().mockReturnValue( true ) } );
			global.fetch = fetchReturning( new Blob( [ 'video' ], { type: 'video/mp4' } ) );

			const { result } = renderHook( () => useGenericShare( 'modal' ) );
			await act( async () => {
				await result.current.handleShare();
			} );

			expect( global.fetch ).toHaveBeenCalledWith( 'https://example.com/clip.mp4' );
			expect( mockShare ).toHaveBeenCalledWith(
				expect.objectContaining( { files: expect.arrayContaining( [ expect.any( File ) ] ) } )
			);
			expect( window.open ).not.toHaveBeenCalled();
			expect( mockAddNotice ).not.toHaveBeenCalled();
			expect( mockTrackClicked ).toHaveBeenCalledWith( { surface: 'modal', method: 'web-share' } );
			expect( mockTrackCompleted ).toHaveBeenCalledWith( {
				surface: 'modal',
				method: 'web-share',
			} );
		} );

		it( 'silently exits when the user dismisses the share sheet', async () => {
			const mockShare = jest.fn().mockRejectedValue( new DOMException( 'cancel', 'AbortError' ) );
			setNavigatorShare( { share: mockShare, canShare: jest.fn().mockReturnValue( true ) } );
			global.fetch = fetchReturning( new Blob( [ 'v' ], { type: 'video/mp4' } ) );

			const { result } = renderHook( () => useGenericShare( 'modal' ) );
			await act( async () => {
				await result.current.handleShare();
			} );

			expect( window.open ).not.toHaveBeenCalled();
			expect( mockAddNotice ).not.toHaveBeenCalled();
			// clicked fires before the work starts, so the funnel still records the attempt
			// even though the silent-dismiss path emits no failed/completed.
			expect( mockTrackClicked ).toHaveBeenCalledWith( { surface: 'modal', method: 'web-share' } );
			expect( mockTrackFailed ).not.toHaveBeenCalled();
			expect( mockTrackCompleted ).not.toHaveBeenCalled();
		} );

		it( 'shows an error notice — never downloads or opens a tab — when navigator.share throws', async () => {
			const mockShare = jest.fn().mockRejectedValue( new Error( 'NotAllowedError' ) );
			setNavigatorShare( { share: mockShare, canShare: jest.fn().mockReturnValue( true ) } );
			global.fetch = fetchReturning( new Blob( [ 'v' ], { type: 'video/mp4' } ) );

			const { result } = renderHook( () => useGenericShare( 'modal' ) );
			await act( async () => {
				await result.current.handleShare();
			} );

			expect( window.open ).not.toHaveBeenCalled();
			expect( mockAddNotice ).toHaveBeenCalledWith( expect.stringMatching( NOTICE_RE ), 'error' );
			expect( mockTrackFailed ).toHaveBeenCalledWith(
				expect.objectContaining( {
					surface: 'modal',
					method: 'web-share',
					message: 'NotAllowedError',
				} )
			);
			expect( mockTrackCompleted ).not.toHaveBeenCalled();
		} );

		it( 'tags an HTTP fetch failure as failureKind=http and shows the error notice', async () => {
			setNavigatorShare( { share: jest.fn(), canShare: jest.fn().mockReturnValue( true ) } );
			global.fetch = jest
				.fn()
				.mockResolvedValue( { ok: false, status: 404 } ) as unknown as typeof fetch;

			const { result } = renderHook( () => useGenericShare( 'modal' ) );
			await act( async () => {
				await result.current.handleShare();
			} );

			expect( window.open ).not.toHaveBeenCalled();
			expect( mockTrackFailed ).toHaveBeenCalledWith(
				expect.objectContaining( {
					surface: 'modal',
					method: 'web-share',
					failureKind: 'http',
				} )
			);
			expect( mockAddNotice ).toHaveBeenCalledWith( expect.stringMatching( NOTICE_RE ), 'error' );
		} );
	} );

	describe( 'handleShare — file sharing unavailable', () => {
		it( 'shows an error notice and never fetches or opens a tab when canShare rejects files', async () => {
			setNavigatorShare( { share: jest.fn(), canShare: jest.fn().mockReturnValue( false ) } );
			global.fetch = jest.fn() as unknown as typeof fetch;

			const { result } = renderHook( () => useGenericShare( 'modal' ) );
			await act( async () => {
				await result.current.handleShare();
			} );

			expect( global.fetch ).not.toHaveBeenCalled();
			expect( window.open ).not.toHaveBeenCalled();
			expect( mockTrackClicked ).toHaveBeenCalledWith( {
				surface: 'modal',
				method: 'web-share-unsupported',
			} );
			expect( mockTrackFailed ).toHaveBeenCalledWith( {
				surface: 'modal',
				method: 'web-share-unsupported',
			} );
			expect( mockAddNotice ).toHaveBeenCalledWith( expect.stringMatching( NOTICE_RE ), 'error' );
		} );

		it( 'shows an error notice when the Web Share API is missing entirely', async () => {
			setNavigatorShare( { share: undefined, canShare: undefined } );

			const { result } = renderHook( () => useGenericShare( 'modal' ) );
			await act( async () => {
				await result.current.handleShare();
			} );

			expect( window.open ).not.toHaveBeenCalled();
			expect( mockTrackClicked ).toHaveBeenCalledWith( {
				surface: 'modal',
				method: 'web-share-unsupported',
			} );
			expect( mockTrackFailed ).toHaveBeenCalledWith( {
				surface: 'modal',
				method: 'web-share-unsupported',
			} );
			expect( mockAddNotice ).toHaveBeenCalledWith( expect.stringMatching( NOTICE_RE ), 'error' );
		} );

		it( 'surfaces the error via the snackbar (core/notices) when invoked from the sidebar with a clip override', async () => {
			mockCreateCoreNotice.mockResolvedValue( undefined );
			const mockShare = jest.fn().mockRejectedValue( new Error( 'NotAllowedError' ) );
			setNavigatorShare( { share: mockShare, canShare: jest.fn().mockReturnValue( true ) } );
			global.fetch = fetchReturning( new Blob( [ 'v' ], { type: 'video/mp4' } ) );

			const { result } = renderHook( () =>
				useGenericShare( 'sidebar', {
					url: 'https://example.com/sidebar-clip.mp4',
					attachmentId: 999,
				} )
			);
			await act( async () => {
				await result.current.handleShare();
			} );

			// Sidebar callers route notices through core/notices as a dismissible snackbar.
			expect( mockCreateCoreNotice ).toHaveBeenCalledWith(
				'error',
				expect.stringMatching( NOTICE_RE ),
				expect.objectContaining( { type: 'snackbar', isDismissible: true } )
			);
			// And NOT through the in-modal addNotice path.
			expect( mockAddNotice ).not.toHaveBeenCalled();
			expect( mockTrackFailed ).toHaveBeenCalledWith(
				expect.objectContaining( { surface: 'sidebar', method: 'web-share' } )
			);
		} );
	} );

	describe( 'double-click guard', () => {
		it( 'ignores a second click while the first share is still in flight', async () => {
			let resolveShare: () => void = () => {};
			const sharePromise = new Promise< void >( ( resolve ) => {
				resolveShare = resolve;
			} );
			const mockShare = jest.fn().mockReturnValue( sharePromise );
			setNavigatorShare( { share: mockShare, canShare: jest.fn().mockReturnValue( true ) } );
			global.fetch = fetchReturning( new Blob( [ 'v' ], { type: 'video/mp4' } ) );

			const { result } = renderHook( () => useGenericShare( 'modal' ) );

			await act( async () => {
				const firstClick = result.current.handleShare();
				await result.current.handleShare();
				resolveShare();
				await firstClick;
			} );

			expect( mockShare ).toHaveBeenCalledTimes( 1 );
			expect( mockTrackClicked ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'isSharing', () => {
		it( 'starts false', () => {
			const { result } = renderHook( () => useGenericShare( 'modal' ) );
			expect( result.current.isSharing ).toBe( false );
		} );

		it( 'is true while the Web Share path is in flight and false after success', async () => {
			let resolveShare: () => void = () => {};
			const sharePromise = new Promise< void >( ( resolve ) => {
				resolveShare = resolve;
			} );
			const mockShare = jest.fn().mockReturnValue( sharePromise );
			setNavigatorShare( { share: mockShare, canShare: jest.fn().mockReturnValue( true ) } );
			global.fetch = fetchReturning( new Blob( [ 'v' ], { type: 'video/mp4' } ) );

			const { result } = renderHook( () => useGenericShare( 'modal' ) );

			let firstClick: Promise< void > = Promise.resolve();
			await act( async () => {
				firstClick = result.current.handleShare();
				// Flush the fetch + blob microtasks so we observe the in-flight state
				// before navigator.share resolves.
				await Promise.resolve();
				await Promise.resolve();
			} );
			expect( result.current.isSharing ).toBe( true );

			await act( async () => {
				resolveShare();
				await firstClick;
			} );
			expect( result.current.isSharing ).toBe( false );
		} );

		it( 'resets to false after the user dismisses the share sheet (AbortError)', async () => {
			const mockShare = jest.fn().mockRejectedValue( new DOMException( 'cancel', 'AbortError' ) );
			setNavigatorShare( { share: mockShare, canShare: jest.fn().mockReturnValue( true ) } );
			global.fetch = fetchReturning( new Blob( [ 'v' ], { type: 'video/mp4' } ) );

			const { result } = renderHook( () => useGenericShare( 'modal' ) );
			await act( async () => {
				await result.current.handleShare();
			} );

			expect( result.current.isSharing ).toBe( false );
		} );

		it( 'resets to false after navigator.share throws', async () => {
			const mockShare = jest.fn().mockRejectedValue( new Error( 'boom' ) );
			setNavigatorShare( { share: mockShare, canShare: jest.fn().mockReturnValue( true ) } );
			global.fetch = fetchReturning( new Blob( [ 'v' ], { type: 'video/mp4' } ) );

			const { result } = renderHook( () => useGenericShare( 'modal' ) );
			await act( async () => {
				await result.current.handleShare();
			} );

			expect( result.current.isSharing ).toBe( false );
		} );

		it( 'resets to false when file sharing is unavailable', async () => {
			setNavigatorShare( { share: jest.fn(), canShare: jest.fn().mockReturnValue( false ) } );

			const { result } = renderHook( () => useGenericShare( 'modal' ) );
			await act( async () => {
				await result.current.handleShare();
			} );

			expect( result.current.isSharing ).toBe( false );
		} );
	} );
} );
