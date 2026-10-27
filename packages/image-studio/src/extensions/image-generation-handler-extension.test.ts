import { select } from '@wordpress/data';
import { addImageStudioHandler } from './image-generation-handler-extension';

jest.mock( '../store', () => ( {
	store: 'image-studio',
	ImageStudioEntryPoint: {
		JetpackAIFeaturedImage: 'jetpack_ai_featured_image',
		JetpackAISocialMedia: 'jetpack_ai_social_media',
	},
} ) );

jest.mock( '../utils/tracking', () => ( {
	trackImageStudioOpened: jest.fn(),
} ) );

describe( 'addImageStudioHandler', () => {
	const getSettings = jest.fn();
	const context = { entryPoint: 'featured-image', onImageSelect: jest.fn() };

	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( select ).mockReturnValue( { getSettings } as ReturnType< typeof select > );
	} );

	it.each( [ false, undefined ] )( 'returns no handler when mediaUpload is %s', ( mediaUpload ) => {
		getSettings.mockReturnValue( { mediaUpload } );

		expect( addImageStudioHandler( null, context ) ).toBeNull();
	} );

	it( 'returns a handler when uploads are available', () => {
		getSettings.mockReturnValue( { mediaUpload: jest.fn() } );

		expect( addImageStudioHandler( null, context ) ).toEqual( expect.any( Function ) );
	} );
} );
