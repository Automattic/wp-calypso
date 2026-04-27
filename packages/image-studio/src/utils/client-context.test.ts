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
	getSelectedTone?: () => string | null;
	getCurrentVideoUrl?: () => string | null;
}

function setupSelect( {
	imageStudio,
	videoStudio = {},
	core = { getEntityRecord: () => null },
	blockEditor = { getBlocks: () => [], getBlocksByName: () => [], getBlock: () => null },
}: {
	imageStudio: ImageStoreSelectors;
	videoStudio?: VideoStoreSelectors;
	core?: Record< string, unknown >;
	blockEditor?: Record< string, unknown >;
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
				getSelectedTone: () => null,
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
				getSelectedStyle: () => 'aerial',
				getSelectedTone: () => 'promotional',
			},
		} );

		const ctx = getClientContext();

		expect( ctx.environment ).toBe( 'video-studio' );
		expect( ctx.imageStudio ).toBeUndefined();
		expect( ctx.videoStudio ).toMatchObject( {
			isOpen: true,
			id: null,
			tone: 'promotional',
			style: 'aerial',
			entryPoint: 'post_editor_feature_clip',
		} );
		// The server pins 9:16; aspect_ratio is not part of the videoStudio payload shape.
		expect( ctx.videoStudio ).not.toHaveProperty( 'aspect_ratio' );
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
				getSelectedTone: () => null,
			},
		} );

		const ctx = getClientContext();

		expect( ctx.environment ).toBe( 'wp-admin' );
	} );
} );
