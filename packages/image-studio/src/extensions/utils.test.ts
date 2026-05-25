/**
 * Tests for extension utilities
 */
import { dispatch, select } from '@wordpress/data';
import { transformAttachment } from '@wordpress/media-utils';
import { ImageStudioMode } from '../types';
import { handleImageSelection, openImageStudioForBlock } from './utils';
import type { ImageData } from '../utils/get-image-data';

// Mock store
const mockImageStudioStore = {
	openImageStudio: jest.fn(),
};

const mockBlockEditorStore = {
	updateBlockAttributes: jest.fn(),
};

const mockCoreStore = {
	getEntityRecord: jest.fn(),
};

// Mock console.error to capture error logs
const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

describe( 'Extension Utils', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		( dispatch as unknown as jest.Mock ).mockImplementation( ( storeName ) => {
			if ( storeName?.name === 'core/block-editor' ) {
				return mockBlockEditorStore;
			}
			return mockImageStudioStore;
		} );

		( select as unknown as jest.Mock ).mockImplementation( ( storeName ) => {
			if ( storeName?.name === 'core' ) {
				return mockCoreStore;
			}
			return {};
		} );
	} );

	afterAll( () => {
		consoleErrorSpy.mockRestore();
	} );

	describe( 'handleImageSelection', () => {
		const mockOnSelect = jest.fn();

		it( 'should return early when image is null (deletion case)', () => {
			handleImageSelection( {
				image: null,
				onSelect: mockOnSelect,
				multiple: false,
			} );

			expect( mockOnSelect ).not.toHaveBeenCalled();
			expect( mockCoreStore.getEntityRecord ).not.toHaveBeenCalled();
		} );

		it( 'should log error and return early when image has no id', () => {
			const imageWithoutId = {
				url: 'https://example.com/image.jpg',
			} as ImageData;

			handleImageSelection( {
				image: imageWithoutId,
				onSelect: mockOnSelect,
				multiple: false,
			} );

			expect( consoleErrorSpy ).toHaveBeenCalledWith(
				'[Image Studio] Image data is missing an ID.'
			);
			expect( mockOnSelect ).not.toHaveBeenCalled();
		} );

		it( 'should fetch attachment and call onSelect with transformed attachment (single)', () => {
			const mockAttachment = {
				id: 123,
				source_url: 'https://example.com/image.jpg',
				alt_text: 'Test image',
			};

			mockCoreStore.getEntityRecord.mockReturnValue( mockAttachment );

			const image: ImageData = {
				id: 123,
				url: 'https://example.com/image.jpg',
				alt: 'Test',
				title: '',
				caption: '',
				description: '',
				width: 100,
				height: 100,
				filename: 'image.jpg',
			};

			handleImageSelection( {
				image,
				onSelect: mockOnSelect,
				multiple: false,
			} );

			expect( mockCoreStore.getEntityRecord ).toHaveBeenCalledWith( 'postType', 'attachment', 123 );
			expect( transformAttachment ).toHaveBeenCalledWith( mockAttachment );
			expect( mockOnSelect ).toHaveBeenCalledWith(
				expect.objectContaining( {
					...mockAttachment,
					transformed: true,
				} )
			);
		} );

		it( 'should call onSelect with array when multiple is true', () => {
			const mockAttachment = {
				id: 123,
				source_url: 'https://example.com/image.jpg',
			};

			mockCoreStore.getEntityRecord.mockReturnValue( mockAttachment );

			const image: ImageData = {
				id: 123,
				url: 'https://example.com/image.jpg',
				alt: '',
				title: '',
				caption: '',
				description: '',
				width: 100,
				height: 100,
				filename: 'image.jpg',
			};

			handleImageSelection( {
				image,
				onSelect: mockOnSelect,
				multiple: true,
			} );

			expect( mockOnSelect ).toHaveBeenCalledWith( [
				expect.objectContaining( {
					...mockAttachment,
					transformed: true,
				} ),
			] );
		} );

		it( 'should not call onSelect when attachment is not found', () => {
			mockCoreStore.getEntityRecord.mockReturnValue( undefined );

			const image: ImageData = {
				id: 999,
				url: 'https://example.com/missing.jpg',
				alt: '',
				title: '',
				caption: '',
				description: '',
				width: 100,
				height: 100,
				filename: 'missing.jpg',
			};

			handleImageSelection( {
				image,
				onSelect: mockOnSelect,
				multiple: false,
			} );

			expect( mockOnSelect ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'openImageStudioForBlock', () => {
		it( 'should return false when imageBlock has no clientId', () => {
			const result = openImageStudioForBlock( {
				name: 'core/image',
			} );

			expect( result ).toBe( false );
			expect( mockImageStudioStore.openImageStudio ).not.toHaveBeenCalled();
		} );

		it( 'should open Image Studio in edit mode with attachment ID', () => {
			const imageBlock = {
				name: 'core/image',
				clientId: 'block-123',
				attributes: {
					id: 456,
					url: 'https://example.com/image.jpg',
				},
			};

			const result = openImageStudioForBlock( imageBlock, ImageStudioMode.Edit );

			expect( result ).toBe( true );
			expect( mockImageStudioStore.openImageStudio ).toHaveBeenCalledWith(
				456,
				expect.any( Function ),
				'editor_block'
			);
		} );

		it( 'should open Image Studio in generate mode without attachment ID', () => {
			const imageBlock = {
				name: 'core/image',
				clientId: 'block-123',
				attributes: {},
			};

			const result = openImageStudioForBlock( imageBlock, ImageStudioMode.Generate );

			expect( result ).toBe( true );
			expect( mockImageStudioStore.openImageStudio ).toHaveBeenCalledWith(
				undefined,
				expect.any( Function ),
				'editor_block'
			);
		} );

		it( 'should clear block attributes when handleClose receives null (deletion)', () => {
			const imageBlock = {
				name: 'core/image',
				clientId: 'block-123',
				attributes: {
					id: 456,
				},
			};

			openImageStudioForBlock( imageBlock );

			// Get the handleClose callback that was passed to openImageStudio
			const handleClose = mockImageStudioStore.openImageStudio.mock.calls[ 0 ][ 1 ];

			// Call it with null (image deleted)
			handleClose( null );

			expect( mockBlockEditorStore.updateBlockAttributes ).toHaveBeenCalledWith( 'block-123', {
				url: undefined,
				id: undefined,
				alt: '',
				title: '',
				caption: '',
			} );
		} );

		it( 'should update block attributes when handleClose receives image data', () => {
			const imageBlock = {
				name: 'core/image',
				clientId: 'block-123',
				attributes: {},
			};

			openImageStudioForBlock( imageBlock );

			const handleClose = mockImageStudioStore.openImageStudio.mock.calls[ 0 ][ 1 ];

			const newImage: ImageData = {
				id: 789,
				url: 'https://example.com/new-image.jpg',
				alt: 'New image',
				title: 'New title',
				caption: 'New caption',
				description: 'New description',
				width: 200,
				height: 200,
				filename: 'new-image.jpg',
			};

			handleClose( newImage );

			expect( mockBlockEditorStore.updateBlockAttributes ).toHaveBeenCalledWith( 'block-123', {
				url: 'https://example.com/new-image.jpg',
				id: 789,
				alt: 'New image',
			} );
		} );

		it( 'should not update attributes when handleClose receives image without id', () => {
			const imageBlock = {
				name: 'core/image',
				clientId: 'block-123',
				attributes: {},
			};

			openImageStudioForBlock( imageBlock );

			const handleClose = mockImageStudioStore.openImageStudio.mock.calls[ 0 ][ 1 ];

			const imageWithoutId = {
				url: 'https://example.com/image.jpg',
			} as ImageData;

			handleClose( imageWithoutId );

			expect( mockBlockEditorStore.updateBlockAttributes ).not.toHaveBeenCalled();
		} );
	} );
} );
