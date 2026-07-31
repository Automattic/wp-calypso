/**
 * @jest-environment jsdom
 */
import { dispatch } from '@wordpress/data';
import { trackImageStudioOpened } from '../utils/tracking';
import { addImageStudioHandler } from './image-generation-handler-extension';

jest.mock( '../store', () => ( {
	store: 'image-studio',
	ImageStudioEntryPoint: {
		EditorSidebar: 'editor_sidebar',
		JetpackAIFeaturedImage: 'jetpack_ai_featured_image',
		JetpackAISocialMedia: 'jetpack_ai_social_media',
	},
} ) );

jest.mock( '../types', () => ( {
	ImageStudioMode: { Generate: 'generate' },
} ) );

jest.mock( '../utils/tracking', () => ( {
	trackImageStudioOpened: jest.fn(),
} ) );

const mockOpenImageStudio = jest.fn();

describe( 'addImageStudioHandler', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( dispatch as unknown as jest.Mock ).mockReturnValue( {
			openImageStudio: mockOpenImageStudio,
		} );
	} );

	it( 'opens Image Studio before tracking, so the event carries the new session', () => {
		const handler = addImageStudioHandler( null, {
			entryPoint: 'featured-image',
			onImageSelect: jest.fn(),
		} );

		handler?.();

		expect( mockOpenImageStudio ).toHaveBeenCalled();
		expect( trackImageStudioOpened ).toHaveBeenCalled();
		expect( mockOpenImageStudio.mock.invocationCallOrder[ 0 ] ).toBeLessThan(
			( trackImageStudioOpened as jest.Mock ).mock.invocationCallOrder[ 0 ]
		);
	} );

	it( 'tracks the entry point of the calling Jetpack surface', () => {
		const handler = addImageStudioHandler( null, {
			entryPoint: 'social-media',
			onImageSelect: jest.fn(),
		} );

		handler?.();

		expect( trackImageStudioOpened ).toHaveBeenCalledWith( {
			mode: 'generate',
			attachmentId: undefined,
			entryPoint: 'jetpack_ai_social_media',
		} );
	} );

	it( 'returns the default handler when no image callback is given', () => {
		const handler = addImageStudioHandler( null, {
			entryPoint: 'featured-image',
		} as never );

		expect( handler ).toBeNull();
	} );
} );
