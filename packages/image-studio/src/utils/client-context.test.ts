/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order */
jest.mock( '@wordpress/block-editor', () => ( {
	store: 'block-editor',
} ) );

const mockSelect = jest.fn();
jest.mock( '@wordpress/data', () => ( {
	select: ( ...args: unknown[] ) => mockSelect( ...args ),
} ) );

jest.mock( '../store', () => {
	const ImageStudioEntryPoint = {
		MediaLibrary: 'media_library',
		EditorBlock: 'editor_block',
		EditorSidebar: 'editor_sidebar',
		PostEditorFeatureClip: 'post_editor_feature_clip',
		JetpackExternalMediaBlock: 'jetpack_external_media_block',
		JetpackExternalMediaFeaturedImage: 'jetpack_external_media_featured_image',
		JetpackAIFeaturedImage: 'jetpack_ai_featured_image',
		JetpackAISocialMedia: 'jetpack_ai_social_media',
	};
	return {
		ImageStudioEntryPoint,
		store: 'image-studio',
	};
} );

jest.mock( '../stores/video-studio', () => ( {
	store: 'video-studio',
} ) );

import { getClientContext } from './client-context';

interface ImageStoreSelectors {
	getImageStudioAttachmentId?: () => number | null;
	getIsImageStudioOpen?: () => boolean;
	getSelectedStyle?: () => string | null;
	getSelectedAspectRatio?: () => string | null;
	getEntryPoint?: () => string | null;
	getBlockType?: () => string | null;
}

interface VideoStoreSelectors {
	getSelectedStyle?: () => string | null;
	getCurrentVideoUrl?: () => string | null;
	getCurrentAttachmentId?: () => number | null;
}

interface EditorStoreSelectors {
	getEditedPostAttribute?: ( name: string ) => unknown;
}

function setupSelect( {
	imageStudio,
	videoStudio = {},
	core = { getEntityRecord: () => null },
	blockEditor = { getBlocks: () => [], getBlocksByName: () => [], getBlock: () => null },
	editor,
}: {
	imageStudio: ImageStoreSelectors;
	videoStudio?: VideoStoreSelectors;
	core?: Record< string, unknown >;
	blockEditor?: Record< string, unknown >;
	editor?: EditorStoreSelectors;
} ) {
	mockSelect.mockImplementation( ( storeName: string ) => {
		if ( storeName === 'image-studio' ) {
			return imageStudio;
		}
		if ( storeName === 'video-studio' ) {
			return videoStudio;
		}
		if ( storeName === 'core' ) {
			return core;
		}
		if ( storeName === 'block-editor' ) {
			return blockEditor;
		}
		if ( storeName === 'core/editor' ) {
			return editor ?? null;
		}
		return null;
	} );
}

describe( 'getClientContext', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'emits an imageStudio payload for default (image) entry points', () => {
		setupSelect( {
			imageStudio: {
				getImageStudioAttachmentId: () => 42,
				getIsImageStudioOpen: () => true,
				getSelectedStyle: () => 'cinematic',
				getSelectedAspectRatio: () => '16:9',
				getEntryPoint: () => 'media_library',
				getBlockType: () => null,
			},
			videoStudio: {
				getSelectedStyle: () => null,
			},
		} );

		const ctx = getClientContext();

		expect( ctx.environment ).toBe( 'image-studio' );
		expect( ctx.imageStudio ).toMatchObject( {
			isOpen: true,
			id: 42,
			style: 'cinematic',
			aspect_ratio: '16:9',
			entryPoint: 'media_library',
		} );
		expect( ctx.videoStudio ).toBeUndefined();
	} );

	it( 'emits a videoStudio payload (and no imageStudio) when entryPoint is PostEditorFeatureClip', () => {
		setupSelect( {
			imageStudio: {
				getImageStudioAttachmentId: () => null,
				getIsImageStudioOpen: () => true,
				// Image-mode style stays in image-studio; video flow ignores it.
				getSelectedStyle: () => null,
				getSelectedAspectRatio: () => '9:16',
				getEntryPoint: () => 'post_editor_feature_clip',
				getBlockType: () => null,
			},
			videoStudio: {
				getSelectedStyle: () => 'cinematic',
			},
		} );

		const ctx = getClientContext();

		expect( ctx.environment ).toBe( 'video-studio' );
		expect( ctx.imageStudio ).toBeUndefined();
		expect( ctx.videoStudio ).toMatchObject( {
			isOpen: true,
			id: null,
			style: 'cinematic',
			entryPoint: 'post_editor_feature_clip',
		} );
		// The server pins 9:16; aspect_ratio is not part of the videoStudio payload shape.
		expect( ctx.videoStudio ).not.toHaveProperty( 'aspect_ratio' );
		// Tone has been collapsed into style; the videoStudio payload no longer carries it.
		expect( ctx.videoStudio ).not.toHaveProperty( 'tone' );
	} );

	it( 'includes the current post title in the videoStudio payload when available', () => {
		setupSelect( {
			imageStudio: {
				getImageStudioAttachmentId: () => null,
				getIsImageStudioOpen: () => true,
				getSelectedStyle: () => null,
				getSelectedAspectRatio: () => null,
				getEntryPoint: () => 'post_editor_feature_clip',
				getBlockType: () => null,
			},
			videoStudio: {
				getSelectedStyle: () => 'cinematic',
			},
			editor: {
				getEditedPostAttribute: ( name: string ) =>
					name === 'title' ? 'My Spectacular Post' : undefined,
			},
		} );

		const ctx = getClientContext();

		expect( ctx.videoStudio ).toBeDefined();
		expect( ctx.videoStudio?.title ).toBe( 'My Spectacular Post' );
	} );

	it( 'omits the title key from the videoStudio payload when the title is empty', () => {
		setupSelect( {
			imageStudio: {
				getImageStudioAttachmentId: () => null,
				getIsImageStudioOpen: () => true,
				getSelectedStyle: () => null,
				getSelectedAspectRatio: () => null,
				getEntryPoint: () => 'post_editor_feature_clip',
				getBlockType: () => null,
			},
			videoStudio: {
				getSelectedStyle: () => 'cinematic',
			},
			editor: {
				getEditedPostAttribute: ( name: string ) => ( name === 'title' ? '   ' : undefined ),
			},
		} );

		const ctx = getClientContext();

		expect( ctx.videoStudio ).toBeDefined();
		expect( ctx.videoStudio ).not.toHaveProperty( 'title' );
	} );

	it( 'omits the title key when the core/editor store is unavailable', () => {
		setupSelect( {
			imageStudio: {
				getImageStudioAttachmentId: () => null,
				getIsImageStudioOpen: () => true,
				getSelectedStyle: () => null,
				getSelectedAspectRatio: () => null,
				getEntryPoint: () => 'post_editor_feature_clip',
				getBlockType: () => null,
			},
			videoStudio: {
				getSelectedStyle: () => 'cinematic',
			},
		} );

		const ctx = getClientContext();

		expect( ctx.videoStudio ).toBeDefined();
		expect( ctx.videoStudio ).not.toHaveProperty( 'title' );
	} );

	it( 'sources the videoStudio id and attachment metadata from the video-studio store', () => {
		setupSelect( {
			imageStudio: {
				// Image-studio store's id stays null for the feature-clip entry point.
				getImageStudioAttachmentId: () => null,
				getIsImageStudioOpen: () => true,
				getSelectedStyle: () => null,
				getSelectedAspectRatio: () => null,
				getEntryPoint: () => 'post_editor_feature_clip',
				getBlockType: () => null,
			},
			videoStudio: {
				getSelectedStyle: () => 'cinematic',
				// update-canvas-video writes the generated clip's id here.
				getCurrentAttachmentId: () => 4242,
			},
			core: {
				getEntityRecord: ( _kind: string, _name: string, id: number ) =>
					id === 4242
						? {
								id: 4242,
								source_url: 'https://example.com/clip.mp4',
								title: { rendered: 'Generated Clip' },
								alt_text: '',
								media_details: { width: 1080, height: 1920 },
								description: { rendered: '' },
						  }
						: null,
			},
		} );

		const ctx = getClientContext();

		expect( ctx.videoStudio ).toBeDefined();
		expect( ctx.videoStudio?.id ).toBe( 4242 );
		expect( ctx.videoStudio?.metadata ).toMatchObject( {
			id: 4242,
			url: 'https://example.com/clip.mp4',
			title: 'Generated Clip',
			width: 1080,
			height: 1920,
		} );
	} );

	it( 'falls back to wp-admin environment when studio is closed', () => {
		setupSelect( {
			imageStudio: {
				getImageStudioAttachmentId: () => null,
				getIsImageStudioOpen: () => false,
				getSelectedStyle: () => null,
				getSelectedAspectRatio: () => null,
				getEntryPoint: () => null,
				getBlockType: () => null,
			},
			videoStudio: {
				getSelectedStyle: () => null,
			},
		} );

		const ctx = getClientContext();

		expect( ctx.environment ).toBe( 'wp-admin' );
	} );
} );
