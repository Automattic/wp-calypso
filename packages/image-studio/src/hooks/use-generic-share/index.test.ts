import { act, renderHook } from '@testing-library/react';
import { useGenericShare } from './index';

const mockTrackClicked = jest.fn();
const mockTrackCompleted = jest.fn();
const mockTrackFailed = jest.fn();
const mockAddNotice = jest.fn();

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
		return {};
	} ),
} ) );

jest.mock( '@wordpress/element', () => {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const React = require( 'react' );
	return {
		useCallback: ( fn: ( ...args: unknown[] ) => unknown ) => fn,
		useRef: React.useRef,
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
	} );

	describe( 'isVisible', () => {
		it( 'is true with video state, correct entry point, and not processing', () => {
			const { result } = renderHook( () => useGenericShare() );
			expect( result.current.isVisible ).toBe( true );
		} );

		it( 'is false on a different entry point', () => {
			mockState.entryPoint = 'media_library';
			const { result } = renderHook( () => useGenericShare() );
			expect( result.current.isVisible ).toBe( false );
		} );

		it( 'is false without a video URL', () => {
			mockState.currentVideoUrl = null;
			const { result } = renderHook( () => useGenericShare() );
			expect( result.current.isVisible ).toBe( false );
		} );

		it( 'is false without an attachment ID', () => {
			mockState.currentAttachmentId = null;
			const { result } = renderHook( () => useGenericShare() );
			expect( result.current.isVisible ).toBe( false );
		} );

		it( 'is false while AI is regenerating', () => {
			mockState.isAiProcessing = true;
			const { result } = renderHook( () => useGenericShare() );
			expect( result.current.isVisible ).toBe( false );
		} );
	} );

	describe( 'handleShare — Web Share path', () => {
		it( 'fetches the file and invokes navigator.share', async () => {
			const mockShare = jest.fn().mockResolvedValue( undefined );
			const mockCanShare = jest.fn().mockReturnValue( true );
			setNavigatorShare( { share: mockShare, canShare: mockCanShare } );

			const blob = new Blob( [ 'video' ], { type: 'video/mp4' } );
			global.fetch = jest.fn().mockResolvedValue( {
				ok: true,
				status: 200,
				blob: () => Promise.resolve( blob ),
			} ) as unknown as typeof fetch;

			const { result } = renderHook( () => useGenericShare() );
			await act( async () => {
				await result.current.handleShare();
			} );

			expect( global.fetch ).toHaveBeenCalledWith( 'https://example.com/clip.mp4' );
			expect( mockShare ).toHaveBeenCalledWith(
				expect.objectContaining( { files: expect.arrayContaining( [ expect.any( File ) ] ) } )
			);
			expect( mockTrackClicked ).toHaveBeenCalledWith( { method: 'web-share' } );
			expect( mockTrackCompleted ).toHaveBeenCalledWith( { method: 'web-share' } );
		} );

		it( 'silently exits when the user cancels the share sheet', async () => {
			const abortError = new DOMException( 'cancel', 'AbortError' );
			const mockShare = jest.fn().mockRejectedValue( abortError );
			const mockCanShare = jest.fn().mockReturnValue( true );
			setNavigatorShare( { share: mockShare, canShare: mockCanShare } );

			const blob = new Blob( [ 'v' ], { type: 'video/mp4' } );
			global.fetch = jest.fn().mockResolvedValue( {
				ok: true,
				status: 200,
				blob: () => Promise.resolve( blob ),
			} ) as unknown as typeof fetch;

			window.open = jest.fn() as unknown as typeof window.open;

			const { result } = renderHook( () => useGenericShare() );
			await act( async () => {
				await result.current.handleShare();
			} );

			expect( mockTrackFailed ).not.toHaveBeenCalled();
			expect( mockTrackCompleted ).not.toHaveBeenCalled();
			expect( window.open ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'handleShare — download fallback', () => {
		it( 'opens the URL in a new tab when Web Share API is unavailable', async () => {
			setNavigatorShare( { share: undefined, canShare: undefined } );
			const mockOpen = jest.fn().mockReturnValue( {} );
			window.open = mockOpen as unknown as typeof window.open;

			const { result } = renderHook( () => useGenericShare() );
			await act( async () => {
				await result.current.handleShare();
			} );

			expect( mockOpen ).toHaveBeenCalledWith(
				'https://example.com/clip.mp4',
				'_blank',
				'noopener'
			);
			expect( mockTrackClicked ).toHaveBeenCalledWith( { method: 'download' } );
			expect( mockTrackCompleted ).toHaveBeenCalledWith( { method: 'download' } );
		} );

		it( 'falls through to download and tracks web-share-unsupported when canShare rejects files', async () => {
			const mockShare = jest.fn();
			const mockCanShare = jest.fn().mockReturnValue( false );
			setNavigatorShare( { share: mockShare, canShare: mockCanShare } );

			global.fetch = jest.fn() as unknown as typeof fetch;
			const mockOpen = jest.fn().mockReturnValue( {} );
			window.open = mockOpen as unknown as typeof window.open;

			const { result } = renderHook( () => useGenericShare() );
			await act( async () => {
				await result.current.handleShare();
			} );

			expect( global.fetch ).not.toHaveBeenCalled();
			expect( mockShare ).not.toHaveBeenCalled();
			expect( mockTrackFailed ).toHaveBeenCalledWith( { method: 'web-share-unsupported' } );
			expect( mockOpen ).toHaveBeenCalled();
			expect( mockTrackCompleted ).toHaveBeenCalledWith( { method: 'download' } );
		} );

		it( 'tags fetch errors with our explicit Fetch-failed status as kind=http', async () => {
			const mockShare = jest.fn();
			const mockCanShare = jest.fn().mockReturnValue( true );
			setNavigatorShare( { share: mockShare, canShare: mockCanShare } );

			global.fetch = jest.fn().mockResolvedValue( {
				ok: false,
				status: 404,
			} ) as unknown as typeof fetch;
			window.open = jest.fn().mockReturnValue( {} ) as unknown as typeof window.open;

			const { result } = renderHook( () => useGenericShare() );
			await act( async () => {
				await result.current.handleShare();
			} );

			expect( mockTrackFailed ).toHaveBeenCalledWith(
				expect.objectContaining( { method: 'web-share', failureKind: 'http' } )
			);
		} );

		it( 'shows an error notice when window.open is blocked', async () => {
			setNavigatorShare( { share: undefined, canShare: undefined } );
			const mockOpen = jest.fn().mockReturnValue( null );
			window.open = mockOpen as unknown as typeof window.open;

			const { result } = renderHook( () => useGenericShare() );
			await act( async () => {
				await result.current.handleShare();
			} );

			expect( mockTrackFailed ).toHaveBeenCalledWith( {
				method: 'download',
				failureKind: 'open-blocked',
				message: 'window.open returned null',
			} );
			expect( mockAddNotice ).toHaveBeenCalledWith(
				expect.stringMatching( /Could not open the video/i ),
				'error'
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
			const mockCanShare = jest.fn().mockReturnValue( true );
			setNavigatorShare( { share: mockShare, canShare: mockCanShare } );

			global.fetch = jest.fn().mockResolvedValue( {
				ok: true,
				status: 200,
				blob: () => Promise.resolve( new Blob( [ 'v' ], { type: 'video/mp4' } ) ),
			} ) as unknown as typeof fetch;

			const { result } = renderHook( () => useGenericShare() );

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
} );
