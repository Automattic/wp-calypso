import { act, renderHook } from '@testing-library/react';
import { useReelShare } from './index';

// Tracking spies
const mockTrackClicked = jest.fn();
const mockTrackNotConnected = jest.fn();
const mockTrackConnectionDisabled = jest.fn();
const mockTrackNotPublished = jest.fn();
const mockTrackInvalidState = jest.fn();
const mockTrackDispatched = jest.fn();
const mockTrackFailed = jest.fn();

// Store action spies
const mockEditPost = jest.fn();
const mockShareCurrentPost = jest.fn();
const mockAddNotice = jest.fn();

// Selector state — mutable per-test
type Connection = { connection_id: string; service_name: string; enabled: boolean };

let mockState: {
	currentVideoUrl: string | null;
	currentAttachmentId: number | null;
	currentDurationSeconds: number | null;
	entryPoint: string;
	isAiProcessing: boolean;
	isCurrentPostPublished: boolean;
	currentMeta: Record< string, unknown >;
	connections: Connection[];
	isSharingCurrentPost: boolean;
};

let mockReelSharePath: string | null;

jest.mock( '@wordpress/data', () => {
	const select = ( storeName: string ) => {
		if ( storeName === 'video-studio' ) {
			return {
				getCurrentVideoUrl: () => mockState.currentVideoUrl,
				getCurrentAttachmentId: () => mockState.currentAttachmentId,
				getCurrentDurationSeconds: () => mockState.currentDurationSeconds,
			};
		}
		if ( storeName === 'image-studio' ) {
			return {
				getEntryPoint: () => mockState.entryPoint,
				getImageStudioAiProcessing: () => mockState.isAiProcessing,
			};
		}
		if ( storeName === 'core/editor' ) {
			return {
				isCurrentPostPublished: () => mockState.isCurrentPostPublished,
				getEditedPostAttribute: ( attr: string ) =>
					attr === 'meta' ? mockState.currentMeta : undefined,
			};
		}
		if ( storeName === 'jetpack-social-plugin' ) {
			return {
				getConnections: () => mockState.connections,
				isSharingCurrentPost: () => mockState.isSharingCurrentPost,
			};
		}
		return {};
	};
	return {
		useSelect: jest.fn( ( selector ) => selector( select ) ),
		select,
		useDispatch: jest.fn( ( storeName: string ) => {
			if ( storeName === 'core/editor' ) {
				return { editPost: mockEditPost };
			}
			if ( storeName === 'jetpack-social-plugin' ) {
				return { shareCurrentPost: mockShareCurrentPost };
			}
			if ( storeName === 'image-studio' ) {
				return { addNotice: mockAddNotice };
			}
			return {};
		} ),
	};
} );

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
		EditorBlock: 'editor_block',
		EditorSidebar: 'editor_sidebar',
		PostEditorFeatureClip: 'post_editor_feature_clip',
		JetpackExternalMediaBlock: 'jetpack_external_media_block',
		JetpackExternalMediaFeaturedImage: 'jetpack_external_media_featured_image',
		JetpackAIFeaturedImage: 'jetpack_ai_featured_image',
		JetpackAISocialMedia: 'jetpack_ai_social_media',
	},
} ) );

jest.mock( '../../stores/video-studio', () => ( {
	store: 'video-studio',
} ) );

jest.mock( '../../utils/jetpack-script-data', () => ( {
	getReelSharePostPath: jest.fn( () => mockReelSharePath ),
	getJetpackAdminUrl: jest.fn( ( path: string ) => `https://example.com/blog/wp-admin/${ path }` ),
} ) );

jest.mock( '../../utils/tracking', () => ( {
	trackImageStudioReelShareClicked: ( ...args: unknown[] ) => mockTrackClicked( ...args ),
	trackImageStudioReelShareNotConnected: () => mockTrackNotConnected(),
	trackImageStudioReelShareConnectionDisabled: () => mockTrackConnectionDisabled(),
	trackImageStudioReelShareNotPublished: () => mockTrackNotPublished(),
	trackImageStudioReelShareInvalidState: () => mockTrackInvalidState(),
	trackImageStudioReelShareDispatched: () => mockTrackDispatched(),
	trackImageStudioReelShareFailed: ( ...args: unknown[] ) => mockTrackFailed( ...args ),
} ) );

const igConnection: Connection = {
	connection_id: '1001',
	service_name: 'instagram-business',
	enabled: true,
};
const twitterConnection: Connection = {
	connection_id: '1002',
	service_name: 'twitter',
	enabled: true,
};

describe( 'useReelShare', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockReelSharePath = '/wpcom/v2/publicize/share-post/{postId}';
		mockState = {
			currentVideoUrl: 'https://example.com/clip.mp4',
			currentAttachmentId: 555,
			currentDurationSeconds: 12,
			entryPoint: 'post_editor_feature_clip',
			isAiProcessing: false,
			isCurrentPostPublished: true,
			currentMeta: { jetpack_social_options: { version: 2 } },
			connections: [ igConnection, twitterConnection ],
			isSharingCurrentPost: false,
		};
		mockShareCurrentPost.mockResolvedValue( true );
		mockEditPost.mockResolvedValue( undefined );
		mockAddNotice.mockResolvedValue( undefined );
	} );

	describe( 'isVisible', () => {
		it( 'is true when entry point is feature clip, video is set, and script-data is available', () => {
			const { result } = renderHook( () => useReelShare() );
			expect( result.current.isVisible ).toBe( true );
		} );

		it( 'is false when entry point is not the feature clip panel', () => {
			mockState.entryPoint = 'media_library';
			const { result } = renderHook( () => useReelShare() );
			expect( result.current.isVisible ).toBe( false );
		} );

		it( 'is false when the video URL is empty', () => {
			mockState.currentVideoUrl = null;
			const { result } = renderHook( () => useReelShare() );
			expect( result.current.isVisible ).toBe( false );
		} );

		it( 'is false when the attachment ID is null (half-set state)', () => {
			mockState.currentAttachmentId = null;
			const { result } = renderHook( () => useReelShare() );
			expect( result.current.isVisible ).toBe( false );
		} );

		it( 'is false while AI is regenerating a video', () => {
			mockState.isAiProcessing = true;
			const { result } = renderHook( () => useReelShare() );
			expect( result.current.isVisible ).toBe( false );
		} );

		it( 'is false when JetpackScriptData is missing', () => {
			mockReelSharePath = null;
			const { result } = renderHook( () => useReelShare() );
			expect( result.current.isVisible ).toBe( false );
		} );
	} );

	describe( 'handleShare — happy path', () => {
		it( 'writes attached_media and media_source then dispatches shareCurrentPost with non-IG connections skipped', async () => {
			const { result } = renderHook( () => useReelShare() );

			await act( async () => {
				await result.current.handleShare();
			} );

			expect( mockTrackClicked ).toHaveBeenCalledWith( {
				attachmentId: 555,
				durationSeconds: 12,
			} );

			expect( mockEditPost ).toHaveBeenCalledWith( {
				meta: {
					jetpack_social_options: {
						version: 2,
						attached_media: [ { id: 555, url: 'https://example.com/clip.mp4', type: 'video/mp4' } ],
						media_source: 'upload-video',
					},
				},
			} );

			expect( mockShareCurrentPost ).toHaveBeenCalledWith(
				{ message: '', skipped_connections: [ '1002' ] },
				{ savePost: true, apiPath: '/wpcom/v2/publicize/share-post/{postId}' }
			);

			expect( mockTrackDispatched ).toHaveBeenCalledTimes( 1 );
			expect( mockTrackFailed ).not.toHaveBeenCalled();
		} );

		it( 'shows a success notice when shareCurrentPost resolves truthy', async () => {
			const { result } = renderHook( () => useReelShare() );
			await act( async () => {
				await result.current.handleShare();
			} );
			expect( mockAddNotice ).toHaveBeenCalledWith(
				expect.stringMatching( /Reel shared to Instagram/i ),
				'success'
			);
		} );
	} );

	describe( 'handleShare — pre-check gates', () => {
		it( 'shows a no-connection notice with action when IG is not connected', async () => {
			mockState.connections = [ twitterConnection ];
			const { result } = renderHook( () => useReelShare() );

			await act( async () => {
				await result.current.handleShare();
			} );

			expect( mockEditPost ).not.toHaveBeenCalled();
			expect( mockShareCurrentPost ).not.toHaveBeenCalled();
			expect( mockTrackNotConnected ).toHaveBeenCalledTimes( 1 );
			expect( mockTrackConnectionDisabled ).not.toHaveBeenCalled();
			expect( mockAddNotice ).toHaveBeenCalledWith(
				expect.stringMatching( /Connect Instagram/i ),
				'warning',
				expect.arrayContaining( [
					expect.objectContaining( {
						label: expect.any( String ),
						url: 'https://example.com/blog/wp-admin/admin.php?page=jetpack-social',
					} ),
				] ),
				true
			);
		} );

		it( 'shows an enable-in-sidebar notice when IG is connected but disabled for this post', async () => {
			mockState.connections = [ { ...igConnection, enabled: false }, twitterConnection ];
			const { result } = renderHook( () => useReelShare() );

			await act( async () => {
				await result.current.handleShare();
			} );

			expect( mockEditPost ).not.toHaveBeenCalled();
			expect( mockShareCurrentPost ).not.toHaveBeenCalled();
			expect( mockTrackConnectionDisabled ).toHaveBeenCalledTimes( 1 );
			expect( mockTrackNotConnected ).not.toHaveBeenCalled();
			expect( mockAddNotice ).toHaveBeenCalledWith(
				expect.stringMatching( /Instagram sharing is not enabled for this post/i ),
				'warning',
				undefined,
				true
			);
		} );

		it( 'shows a not-published notice when the post is a draft', async () => {
			mockState.isCurrentPostPublished = false;
			const { result } = renderHook( () => useReelShare() );

			await act( async () => {
				await result.current.handleShare();
			} );

			expect( mockEditPost ).not.toHaveBeenCalled();
			expect( mockShareCurrentPost ).not.toHaveBeenCalled();
			expect( mockTrackNotPublished ).toHaveBeenCalledTimes( 1 );
			expect( mockAddNotice ).toHaveBeenCalledWith(
				expect.stringMatching( /Publish this post first/i ),
				'warning',
				undefined,
				true
			);
		} );

		it( 'shows an invalid-state notice when the video state is missing', async () => {
			mockState.currentAttachmentId = null;
			const { result } = renderHook( () => useReelShare() );

			await act( async () => {
				await result.current.handleShare();
			} );

			expect( mockEditPost ).not.toHaveBeenCalled();
			expect( mockShareCurrentPost ).not.toHaveBeenCalled();
			expect( mockTrackInvalidState ).toHaveBeenCalledTimes( 1 );
			expect( mockAddNotice ).toHaveBeenCalledWith(
				expect.stringMatching( /Generate a video first/i ),
				'error'
			);
		} );
	} );

	describe( 'handleShare — failure', () => {
		it( 'tracks reel_share_failed when shareCurrentPost resolves falsy', async () => {
			mockShareCurrentPost.mockResolvedValueOnce( false );
			const { result } = renderHook( () => useReelShare() );

			await act( async () => {
				await result.current.handleShare();
			} );

			expect( mockTrackFailed ).toHaveBeenCalledTimes( 1 );
			expect( mockTrackDispatched ).not.toHaveBeenCalled();
		} );

		it( 'tracks reel_share_failed when shareCurrentPost throws', async () => {
			mockShareCurrentPost.mockRejectedValueOnce( new Error( 'boom' ) );
			const { result } = renderHook( () => useReelShare() );

			await act( async () => {
				await result.current.handleShare();
			} );

			expect( mockTrackFailed ).toHaveBeenCalledWith( 'boom' );
			expect( mockTrackDispatched ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'click-time freshness', () => {
		it( 'rechecks the IG connection at click time even if useSelect missed it', async () => {
			// Render with no IG connection — simulates the wp-data subscription
			// missing the social store at mount time.
			mockState.connections = [];
			const { result } = renderHook( () => useReelShare() );

			// Now the social store hydrates with an IG connection. useSelect
			// would normally not re-run if its initial subscription missed the
			// store, but our handleShare reads via standalone select() at click.
			mockState.connections = [ igConnection ];

			await act( async () => {
				await result.current.handleShare();
			} );

			expect( mockTrackNotConnected ).not.toHaveBeenCalled();
			expect( mockEditPost ).toHaveBeenCalled();
			expect( mockShareCurrentPost ).toHaveBeenCalledWith(
				expect.objectContaining( { skipped_connections: [] } ),
				expect.any( Object )
			);
		} );

		it( 'rechecks publication state at click time', async () => {
			mockState.isCurrentPostPublished = true;
			const { result } = renderHook( () => useReelShare() );

			// Post moves to draft after the hook reads.
			mockState.isCurrentPostPublished = false;

			await act( async () => {
				await result.current.handleShare();
			} );

			expect( mockTrackNotPublished ).toHaveBeenCalledTimes( 1 );
			expect( mockShareCurrentPost ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'double-click guard', () => {
		it( 'ignores a second click while the first share is still in flight', async () => {
			let resolveShare: ( value: boolean ) => void = () => {};
			const inFlight = new Promise< boolean >( ( resolve ) => {
				resolveShare = resolve;
			} );
			mockShareCurrentPost.mockReturnValueOnce( inFlight );

			const { result } = renderHook( () => useReelShare() );

			await act( async () => {
				const firstClick = result.current.handleShare();
				await result.current.handleShare();
				resolveShare( true );
				await firstClick;
			} );

			expect( mockEditPost ).toHaveBeenCalledTimes( 1 );
			expect( mockShareCurrentPost ).toHaveBeenCalledTimes( 1 );
			expect( mockTrackClicked ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
