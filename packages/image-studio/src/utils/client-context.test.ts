/* eslint-disable import/order */
import { vi } from 'vitest';
vi.mock( '@wordpress/block-editor', () => ( {
	store: 'block-editor',
} ) );

const mockSelect = vi.fn();
vi.mock( '@wordpress/data', () => ( {
	select: ( ...args: unknown[] ) => mockSelect( ...args ),
} ) );

vi.mock( '../store', () => {
	const ImageStudioEntryPoint = {
		MediaLibrary: 'media_library',
		EditorBlock: 'editor_block',
		EditorSidebar: 'editor_sidebar',
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

import { getClientContext } from './client-context';

interface ImageStoreSelectors {
	getImageStudioAttachmentId?: () => number | null;
	getIsImageStudioOpen?: () => boolean;
	getSelectedStyle?: () => string | null;
	getSelectedAspectRatio?: () => string | null;
	getEntryPoint?: () => string | null;
	getBlockType?: () => string | null;
}

interface EditorStoreSelectors {
	getCurrentTemplateId?: () => string | null | undefined;
}

function setupSelect( {
	imageStudio,
	core = { getEntityRecord: () => null },
	blockEditor = { getBlocks: () => [], getBlocksByName: () => [], getBlock: () => null },
	editor,
}: {
	imageStudio: ImageStoreSelectors;
	core?: Record< string, unknown >;
	blockEditor?: Record< string, unknown >;
	editor?: EditorStoreSelectors;
} ) {
	mockSelect.mockImplementation( ( storeName: string ) => {
		if ( storeName === 'image-studio' ) {
			return imageStudio;
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
		vi.clearAllMocks();
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
	} );

	it( 'starts featured image sessions at 16:9 when no ratio is picked', () => {
		setupSelect( {
			imageStudio: {
				getImageStudioAttachmentId: () => null,
				getIsImageStudioOpen: () => true,
				getSelectedStyle: () => null,
				getSelectedAspectRatio: () => null,
				getEntryPoint: () => 'jetpack_ai_featured_image',
				getBlockType: () => null,
			},
		} );

		const ctx = getClientContext();

		expect( ctx.imageStudio ).toMatchObject( { aspect_ratio: '16:9' } );
	} );

	it( 'starts featured image sessions at the theme ratio when the template sets one', () => {
		setupSelect( {
			imageStudio: {
				getImageStudioAttachmentId: () => null,
				getIsImageStudioOpen: () => true,
				getSelectedStyle: () => null,
				getSelectedAspectRatio: () => null,
				getEntryPoint: () => 'jetpack_ai_featured_image',
				getBlockType: () => null,
			},
			core: {
				getEntityRecord: () => null,
				getEditedEntityRecord: () => ( {
					content: '<!-- wp:post-featured-image {"aspectRatio":"4/3"} /-->',
				} ),
			},
			editor: {
				getCurrentTemplateId: () => 'theme//single',
			},
		} );

		const ctx = getClientContext();

		expect( ctx.imageStudio ).toMatchObject( { aspect_ratio: '4:3' } );
	} );

	it( 'starts featured image sessions at the theme ratio when the template sets 3/2', () => {
		setupSelect( {
			imageStudio: {
				getImageStudioAttachmentId: () => null,
				getIsImageStudioOpen: () => true,
				getSelectedStyle: () => null,
				getSelectedAspectRatio: () => null,
				getEntryPoint: () => 'jetpack_ai_featured_image',
				getBlockType: () => null,
			},
			core: {
				getEntityRecord: () => null,
				getEditedEntityRecord: () => ( {
					content: '<!-- wp:post-featured-image {"aspectRatio":"3/2"} /-->',
				} ),
			},
			editor: {
				getCurrentTemplateId: () => 'theme//single',
			},
		} );

		const ctx = getClientContext();

		expect( ctx.imageStudio ).toMatchObject( { aspect_ratio: '3:2' } );
	} );

	it( 'leaves other sessions alone when the template sets a ratio', () => {
		setupSelect( {
			imageStudio: {
				getImageStudioAttachmentId: () => null,
				getIsImageStudioOpen: () => true,
				getSelectedStyle: () => null,
				getSelectedAspectRatio: () => null,
				getEntryPoint: () => 'editor_block',
				getBlockType: () => 'core/image',
			},
			core: {
				getEntityRecord: () => null,
				getEditedEntityRecord: () => ( {
					content: '<!-- wp:post-featured-image {"aspectRatio":"4/3"} /-->',
				} ),
			},
			editor: {
				getCurrentTemplateId: () => 'theme//single',
			},
		} );

		const ctx = getClientContext();

		expect( ctx.imageStudio ).not.toHaveProperty( 'aspect_ratio' );
	} );

	it( 'keeps a picked ratio in featured image sessions', () => {
		setupSelect( {
			imageStudio: {
				getImageStudioAttachmentId: () => null,
				getIsImageStudioOpen: () => true,
				getSelectedStyle: () => null,
				getSelectedAspectRatio: () => '1:1',
				getEntryPoint: () => 'jetpack_ai_featured_image',
				getBlockType: () => null,
			},
		} );

		const ctx = getClientContext();

		expect( ctx.imageStudio ).toMatchObject( { aspect_ratio: '1:1' } );
	} );

	it( 'sends no ratio for other sessions when none is picked', () => {
		setupSelect( {
			imageStudio: {
				getImageStudioAttachmentId: () => null,
				getIsImageStudioOpen: () => true,
				getSelectedStyle: () => null,
				getSelectedAspectRatio: () => null,
				getEntryPoint: () => 'media_library',
				getBlockType: () => null,
			},
		} );

		const ctx = getClientContext();

		expect( ctx.imageStudio ).not.toHaveProperty( 'aspect_ratio' );
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
		} );

		const ctx = getClientContext();

		expect( ctx.environment ).toBe( 'wp-admin' );
	} );
} );
