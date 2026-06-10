/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import { useReelShare } from './index';

( globalThis as Record< string, unknown > ).__i18n_text_domain__ = 'default';

// Tracking spies
const mockTrackClicked = jest.fn();
const mockTrackNotConnected = jest.fn();
const mockTrackConnectionDisabled = jest.fn();
const mockTrackNotPublished = jest.fn();
const mockTrackInvalidState = jest.fn();
const mockTrackDispatched = jest.fn();
const mockTrackFailed = jest.fn();
const mockTrackCancelled = jest.fn();

// Store action spies
const mockEditPost = jest.fn();
const mockShareCurrentPost = jest.fn();
const mockAddNotice = jest.fn();

// Selector state — mutable per-test
type Connection = {
	connection_id: string;
	service_name: string;
	enabled: boolean;
	display_name?: string;
	external_handle?: string;
};

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
	trackImageStudioReelShareNotConnected: ( ...args: unknown[] ) => mockTrackNotConnected( ...args ),
	trackImageStudioReelShareConnectionDisabled: ( ...args: unknown[] ) =>
		mockTrackConnectionDisabled( ...args ),
	trackImageStudioReelShareNotPublished: ( ...args: unknown[] ) => mockTrackNotPublished( ...args ),
	trackImageStudioReelShareInvalidState: ( ...args: unknown[] ) => mockTrackInvalidState( ...args ),
	trackImageStudioReelShareDispatched: ( ...args: unknown[] ) => mockTrackDispatched( ...args ),
	trackImageStudioReelShareFailed: ( ...args: unknown[] ) => mockTrackFailed( ...args ),
	trackImageStudioReelShareCancelled: ( ...args: unknown[] ) => mockTrackCancelled( ...args ),
} ) );

const igConnection: Connection = {
	connection_id: '1001',
	service_name: 'instagram-business',
	enabled: true,
	display_name: 'myhandle',
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
			const { result } = renderHook( () => useReelShare( 'modal' ) );
			expect( result.current.isVisible ).toBe( true );
		} );

		it( 'is false when entry point is not the feature clip panel', () => {
			mockState.entryPoint = 'media_library';
			const { result } = renderHook( () => useReelShare( 'modal' ) );
			expect( result.current.isVisible ).toBe( false );
		} );

		it( 'is false when the video URL is empty', () => {
			mockState.currentVideoUrl = null;
			const { result } = renderHook( () => useReelShare( 'modal' ) );
			expect( result.current.isVisible ).toBe( false );
		} );

		it( 'is false when the attachment ID is null (half-set state)', () => {
			mockState.currentAttachmentId = null;
			const { result } = renderHook( () => useReelShare( 'modal' ) );
			expect( result.current.isVisible ).toBe( false );
		} );

		it( 'is false while AI is regenerating a video', () => {
			mockState.isAiProcessing = true;
			const { result } = renderHook( () => useReelShare( 'modal' ) );
			expect( result.current.isVisible ).toBe( false );
		} );

		it( 'is false when JetpackScriptData is missing', () => {
			mockReelSharePath = null;
			const { result } = renderHook( () => useReelShare( 'modal' ) );
			expect( result.current.isVisible ).toBe( false );
		} );
	} );

	describe( 'requestShare — gates the confirmation', () => {
		it( 'opens the confirmation without dispatching when validation passes', async () => {
			const { result } = renderHook( () => useReelShare( 'modal' ) );

			await act( async () => {
				await result.current.requestShare();
			} );

			expect( mockTrackClicked ).toHaveBeenCalledWith( {
				surface: 'modal',
				attachmentId: 555,
				durationSeconds: 12,
			} );
			expect( mockEditPost ).not.toHaveBeenCalled();
			expect( mockShareCurrentPost ).not.toHaveBeenCalled();
			expect( result.current.isConfirming ).toBe( true );
			expect( result.current.igDisplayName ).toBe( 'myhandle' );
		} );

		it( 'is a no-op (no re-track, no re-stamp) when the dialog is already open', async () => {
			const { result } = renderHook( () => useReelShare( 'modal' ) );

			await act( async () => {
				await result.current.requestShare();
			} );
			expect( mockTrackClicked ).toHaveBeenCalledTimes( 1 );

			await act( async () => {
				await result.current.requestShare();
			} );
			expect( mockTrackClicked ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'resolves igDisplayName from external_handle when display_name is missing', async () => {
			mockState.connections = [
				{
					connection_id: '1001',
					service_name: 'instagram-business',
					enabled: true,
					external_handle: '@brand',
				},
				twitterConnection,
			];
			const { result } = renderHook( () => useReelShare( 'modal' ) );

			await act( async () => {
				await result.current.requestShare();
			} );

			expect( result.current.igDisplayName ).toBe( '@brand' );
		} );

		it( 'resolves igDisplayName to null when neither field is present on the connection', async () => {
			mockState.connections = [
				{ connection_id: '1001', service_name: 'instagram-business', enabled: true },
				twitterConnection,
			];
			const { result } = renderHook( () => useReelShare( 'modal' ) );

			await act( async () => {
				await result.current.requestShare();
			} );

			expect( result.current.igDisplayName ).toBeNull();
		} );

		it( 'shows a no-connection notice with action when IG is not connected', async () => {
			mockState.connections = [ twitterConnection ];
			const { result } = renderHook( () => useReelShare( 'modal' ) );

			await act( async () => {
				await result.current.requestShare();
			} );

			expect( mockEditPost ).not.toHaveBeenCalled();
			expect( mockShareCurrentPost ).not.toHaveBeenCalled();
			expect( result.current.isConfirming ).toBe( false );
			expect( mockTrackNotConnected ).toHaveBeenCalledWith( { surface: 'modal' } );
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
			const { result } = renderHook( () => useReelShare( 'modal' ) );

			await act( async () => {
				await result.current.requestShare();
			} );

			expect( mockEditPost ).not.toHaveBeenCalled();
			expect( result.current.isConfirming ).toBe( false );
			expect( mockTrackConnectionDisabled ).toHaveBeenCalledWith( { surface: 'modal' } );
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
			const { result } = renderHook( () => useReelShare( 'modal' ) );

			await act( async () => {
				await result.current.requestShare();
			} );

			expect( mockEditPost ).not.toHaveBeenCalled();
			expect( result.current.isConfirming ).toBe( false );
			expect( mockTrackNotPublished ).toHaveBeenCalledWith( { surface: 'modal' } );
			expect( mockAddNotice ).toHaveBeenCalledWith(
				expect.stringMatching( /Publish this post first/i ),
				'warning',
				undefined,
				true
			);
		} );

		it( 'shows an invalid-state notice when the video state is missing', async () => {
			mockState.currentAttachmentId = null;
			const { result } = renderHook( () => useReelShare( 'modal' ) );

			await act( async () => {
				await result.current.requestShare();
			} );

			expect( mockEditPost ).not.toHaveBeenCalled();
			expect( result.current.isConfirming ).toBe( false );
			expect( mockTrackInvalidState ).toHaveBeenCalledWith( { surface: 'modal' } );
			expect( mockAddNotice ).toHaveBeenCalledWith(
				expect.stringMatching( /Generate a video first/i ),
				'error'
			);
		} );
	} );

	describe( 'confirmShare — happy path', () => {
		it( 'writes attached_media and dispatches shareCurrentPost with non-IG connections skipped', async () => {
			const { result } = renderHook( () => useReelShare( 'modal' ) );

			await act( async () => {
				await result.current.requestShare();
			} );
			await act( async () => {
				await result.current.confirmShare();
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

			expect( mockTrackDispatched ).toHaveBeenCalledWith( { surface: 'modal' } );
			expect( mockTrackFailed ).not.toHaveBeenCalled();
			expect( result.current.isConfirming ).toBe( false );
		} );

		it( 'shows a success notice when shareCurrentPost resolves truthy', async () => {
			const { result } = renderHook( () => useReelShare( 'modal' ) );
			await act( async () => {
				await result.current.requestShare();
			} );
			await act( async () => {
				await result.current.confirmShare();
			} );
			expect( mockAddNotice ).toHaveBeenCalledWith(
				expect.stringMatching( /Reel shared to Instagram/i ),
				'success'
			);
		} );

		it( 'is a no-op when confirmShare is called without a pending request', async () => {
			const { result } = renderHook( () => useReelShare( 'modal' ) );

			await act( async () => {
				await result.current.confirmShare();
			} );

			expect( mockEditPost ).not.toHaveBeenCalled();
			expect( mockShareCurrentPost ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'confirmShare — failure', () => {
		it( 'tracks reel_share_failed when shareCurrentPost resolves falsy', async () => {
			mockShareCurrentPost.mockResolvedValueOnce( false );
			const { result } = renderHook( () => useReelShare( 'modal' ) );

			await act( async () => {
				await result.current.requestShare();
			} );
			await act( async () => {
				await result.current.confirmShare();
			} );

			expect( mockTrackFailed ).toHaveBeenCalledWith( { surface: 'modal' } );
			expect( mockTrackDispatched ).not.toHaveBeenCalled();
		} );

		it( 'tracks reel_share_failed when shareCurrentPost throws', async () => {
			mockShareCurrentPost.mockRejectedValueOnce( new Error( 'boom' ) );
			const { result } = renderHook( () => useReelShare( 'modal' ) );

			await act( async () => {
				await result.current.requestShare();
			} );
			await act( async () => {
				await result.current.confirmShare();
			} );

			expect( mockTrackFailed ).toHaveBeenCalledWith( { surface: 'modal', errorMessage: 'boom' } );
			expect( mockTrackDispatched ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'cancelShare', () => {
		it( 'clears isConfirming and fires the cancelled tracker', async () => {
			const { result } = renderHook( () => useReelShare( 'modal' ) );

			await act( async () => {
				await result.current.requestShare();
			} );
			expect( result.current.isConfirming ).toBe( true );

			act( () => {
				result.current.cancelShare();
			} );

			expect( result.current.isConfirming ).toBe( false );
			expect( mockTrackCancelled ).toHaveBeenCalledWith( { surface: 'modal' } );
			expect( mockShareCurrentPost ).not.toHaveBeenCalled();
		} );

		it( 'does not fire the cancelled tracker when there was no pending request', () => {
			const { result } = renderHook( () => useReelShare( 'modal' ) );

			act( () => {
				result.current.cancelShare();
			} );

			expect( mockTrackCancelled ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'freshness', () => {
		it( 'skips any non-IG connection that hydrates while the confirmation dialog is open', async () => {
			// Initially only the IG connection exists.
			mockState.connections = [ igConnection ];
			const { result } = renderHook( () => useReelShare( 'modal' ) );

			await act( async () => {
				await result.current.requestShare();
			} );

			// A new non-IG connection hydrates after the dialog opened. The
			// skipped list must be recomputed at confirm time so the Reel does
			// not also publish to this newly enabled network.
			mockState.connections = [ igConnection, twitterConnection ];

			await act( async () => {
				await result.current.confirmShare();
			} );

			expect( mockShareCurrentPost ).toHaveBeenCalledWith(
				expect.objectContaining( { skipped_connections: [ '1002' ] } ),
				expect.any( Object )
			);
		} );

		it( 'rechecks the IG connection at click time even if useSelect missed it', async () => {
			// Render with no IG connection — simulates the wp-data subscription
			// missing the social store at mount time.
			mockState.connections = [];
			const { result } = renderHook( () => useReelShare( 'modal' ) );

			// Now the social store hydrates with an IG connection. useSelect
			// would normally not re-run if its initial subscription missed the
			// store, but our requestShare reads via standalone select() at click.
			mockState.connections = [ igConnection ];

			await act( async () => {
				await result.current.requestShare();
			} );
			await act( async () => {
				await result.current.confirmShare();
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
			const { result } = renderHook( () => useReelShare( 'modal' ) );

			// Post moves to draft after the hook reads.
			mockState.isCurrentPostPublished = false;

			await act( async () => {
				await result.current.requestShare();
			} );

			expect( mockTrackNotPublished ).toHaveBeenCalledWith( { surface: 'modal' } );
			expect( result.current.isConfirming ).toBe( false );
			expect( mockShareCurrentPost ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'double-click guard', () => {
		it( 'ignores a second confirmShare while the first share is still in flight', async () => {
			let resolveShare: ( value: boolean ) => void = () => {};
			const inFlight = new Promise< boolean >( ( resolve ) => {
				resolveShare = resolve;
			} );
			mockShareCurrentPost.mockReturnValueOnce( inFlight );

			const { result } = renderHook( () => useReelShare( 'modal' ) );

			await act( async () => {
				await result.current.requestShare();
			} );

			await act( async () => {
				const firstClick = result.current.confirmShare();
				await result.current.confirmShare();
				resolveShare( true );
				await firstClick;
			} );

			expect( mockEditPost ).toHaveBeenCalledTimes( 1 );
			expect( mockShareCurrentPost ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'ignores a fresh requestShare while a share is still in flight', async () => {
			let resolveShare: ( value: boolean ) => void = () => {};
			const inFlight = new Promise< boolean >( ( resolve ) => {
				resolveShare = resolve;
			} );
			mockShareCurrentPost.mockReturnValueOnce( inFlight );

			const { result } = renderHook( () => useReelShare( 'modal' ) );

			await act( async () => {
				await result.current.requestShare();
			} );
			await act( async () => {
				// Kick off the dispatch but don't await yet — the share is
				// in flight while we attempt a second requestShare.
				const inFlightConfirm = result.current.confirmShare();
				await result.current.requestShare();
				resolveShare( true );
				await inFlightConfirm;
			} );

			// First requestShare counted; the second was blocked.
			expect( mockTrackClicked ).toHaveBeenCalledTimes( 1 );
			expect( mockShareCurrentPost ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
