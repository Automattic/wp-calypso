import { select } from '@wordpress/data';
import { vi } from 'vitest';
import { addImageStudioHandler } from './image-generation-handler-extension';

vi.mock( '../store', () => ( {
	store: 'image-studio',
	ImageStudioEntryPoint: {
		JetpackAIFeaturedImage: 'jetpack_ai_featured_image',
		JetpackAISocialMedia: 'jetpack_ai_social_media',
	},
} ) );

vi.mock( '../utils/tracking', () => ( {
	trackImageStudioOpened: vi.fn(),
} ) );

describe( 'addImageStudioHandler', () => {
	const getSettings = vi.fn();
	const context = { entryPoint: 'featured-image', onImageSelect: vi.fn() };

	beforeEach( () => {
		vi.clearAllMocks();
		vi.mocked( select ).mockReturnValue( { getSettings } as ReturnType< typeof select > );
	} );

	it.each( [ false, undefined ] )( 'returns no handler when mediaUpload is %s', ( mediaUpload ) => {
		getSettings.mockReturnValue( { mediaUpload } );

		expect( addImageStudioHandler( null, context ) ).toBeNull();
	} );

	it( 'returns a handler when uploads are available', () => {
		getSettings.mockReturnValue( { mediaUpload: vi.fn() } );

		expect( addImageStudioHandler( null, context ) ).toEqual( expect.any( Function ) );
	} );
} );
