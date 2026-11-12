/**
 * Tests for uploadAnnotation utility
 */
import { uploadMedia } from '@wordpress/media-utils';
import { type Mock, vi } from 'vitest';
import { uploadAnnotation } from './upload-annotation';

// Mock uploadMedia
vi.mock( '@wordpress/media-utils', () => ( {
	uploadMedia: vi.fn(),
} ) );

// Mock Date.now() for deterministic timestamps
const mockNow = 1234567890000;
vi.spyOn( Date, 'now' ).mockReturnValue( mockNow );

describe( 'uploadAnnotation', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	describe( 'filename generation', () => {
		it( 'should generate default filename with timestamp when no original filename', async () => {
			const mockBlob = new Blob( [ 'test' ], { type: 'image/png' } );
			const mockOnSuccess = vi.fn();

			( uploadMedia as Mock ).mockImplementation( ( { onFileChange } ) => {
				onFileChange( [ { id: 123, url: 'https://example.com/uploaded.jpg' } ] );
			} );

			await uploadAnnotation( {
				blob: mockBlob,
				onSuccess: mockOnSuccess,
			} );

			const uploadCall = ( uploadMedia as Mock ).mock.calls[ 0 ][ 0 ];
			const uploadedFile = uploadCall.filesList[ 0 ];

			expect( uploadedFile.name ).toBe( `annotated-image-${ mockNow }.png` );
		} );

		it( 'should preserve original extension when provided', async () => {
			const mockBlob = new Blob( [ 'test' ], { type: 'image/png' } );
			const mockOnSuccess = vi.fn();

			( uploadMedia as Mock ).mockImplementation( ( { onFileChange } ) => {
				onFileChange( [ { id: 123, url: 'https://example.com/uploaded.jpg' } ] );
			} );

			await uploadAnnotation( {
				blob: mockBlob,
				originalFilename: 'original-image.jpg',
				onSuccess: mockOnSuccess,
			} );

			const uploadCall = ( uploadMedia as Mock ).mock.calls[ 0 ][ 0 ];
			const uploadedFile = uploadCall.filesList[ 0 ];

			expect( uploadedFile.name ).toBe( `original-image-${ mockNow }.jpg` );
		} );

		it( 'should handle filename with multiple dots', async () => {
			const mockBlob = new Blob( [ 'test' ], { type: 'image/png' } );
			const mockOnSuccess = vi.fn();

			( uploadMedia as Mock ).mockImplementation( ( { onFileChange } ) => {
				onFileChange( [ { id: 123, url: 'https://example.com/uploaded.jpg' } ] );
			} );

			await uploadAnnotation( {
				blob: mockBlob,
				originalFilename: 'my.image.file.png',
				onSuccess: mockOnSuccess,
			} );

			const uploadCall = ( uploadMedia as Mock ).mock.calls[ 0 ][ 0 ];
			const uploadedFile = uploadCall.filesList[ 0 ];

			expect( uploadedFile.name ).toBe( `my.image.file-${ mockNow }.png` );
		} );

		it( 'should handle filename without extension', async () => {
			const mockBlob = new Blob( [ 'test' ], { type: 'image/png' } );
			const mockOnSuccess = vi.fn();

			( uploadMedia as Mock ).mockImplementation( ( { onFileChange } ) => {
				onFileChange( [ { id: 123, url: 'https://example.com/uploaded.jpg' } ] );
			} );

			await uploadAnnotation( {
				blob: mockBlob,
				originalFilename: 'noextension',
				onSuccess: mockOnSuccess,
			} );

			const uploadCall = ( uploadMedia as Mock ).mock.calls[ 0 ][ 0 ];
			const uploadedFile = uploadCall.filesList[ 0 ];

			// When no dots exist, the entire filename becomes the "extension"
			// and baseName is empty, resulting in: -timestamp.noextension
			expect( uploadedFile.name ).toBe( `-${ mockNow }.noextension` );
		} );
	} );

	describe( 'file creation', () => {
		it( 'should create File from Blob with correct type', async () => {
			const mockBlob = new Blob( [ 'test-data' ], { type: 'image/png' } );
			const mockOnSuccess = vi.fn();

			( uploadMedia as Mock ).mockImplementation( ( { onFileChange } ) => {
				onFileChange( [ { id: 123, url: 'https://example.com/uploaded.jpg' } ] );
			} );

			await uploadAnnotation( {
				blob: mockBlob,
				onSuccess: mockOnSuccess,
			} );

			const uploadCall = ( uploadMedia as Mock ).mock.calls[ 0 ][ 0 ];
			const uploadedFile = uploadCall.filesList[ 0 ];

			expect( uploadedFile ).toBeInstanceOf( File );
			expect( uploadedFile.type ).toBe( 'image/png' );
		} );

		it( 'should pass file to uploadMedia', async () => {
			const mockBlob = new Blob( [ 'test' ], { type: 'image/png' } );
			const mockOnSuccess = vi.fn();

			( uploadMedia as Mock ).mockImplementation( ( { onFileChange } ) => {
				onFileChange( [ { id: 123, url: 'https://example.com/uploaded.jpg' } ] );
			} );

			await uploadAnnotation( {
				blob: mockBlob,
				onSuccess: mockOnSuccess,
			} );

			expect( uploadMedia ).toHaveBeenCalledWith(
				expect.objectContaining( {
					filesList: expect.arrayContaining( [ expect.any( File ) ] ),
					allowedTypes: [ 'image' ],
					onFileChange: expect.any( Function ),
					onError: expect.any( Function ),
				} )
			);
		} );
	} );

	describe( 'upload success', () => {
		it( 'should call onSuccess and resolve when upload completes', async () => {
			const mockBlob = new Blob( [ 'test' ], { type: 'image/png' } );
			const mockOnSuccess = vi.fn();
			const mockUploadedMedia = {
				id: 123,
				url: 'https://example.com/uploaded.jpg',
				title: 'Uploaded image',
			};

			( uploadMedia as Mock ).mockImplementation( ( { onFileChange } ) => {
				onFileChange( [ mockUploadedMedia ] );
			} );

			const result = await uploadAnnotation( {
				blob: mockBlob,
				onSuccess: mockOnSuccess,
			} );

			expect( mockOnSuccess ).toHaveBeenCalledWith( mockUploadedMedia );
			expect( result ).toEqual( mockUploadedMedia );
		} );

		it( 'should handle async onSuccess callback', async () => {
			const mockBlob = new Blob( [ 'test' ], { type: 'image/png' } );
			const mockOnSuccess = vi.fn().mockResolvedValue( undefined );
			const mockUploadedMedia = { id: 123, url: 'https://example.com/uploaded.jpg' };

			( uploadMedia as Mock ).mockImplementation( ( { onFileChange } ) => {
				onFileChange( [ mockUploadedMedia ] );
			} );

			const result = await uploadAnnotation( {
				blob: mockBlob,
				onSuccess: mockOnSuccess,
			} );

			expect( mockOnSuccess ).toHaveBeenCalledWith( mockUploadedMedia );
			expect( result ).toEqual( mockUploadedMedia );
		} );

		it( 'should ignore intermediate blob URLs (only process final media)', async () => {
			const mockBlob = new Blob( [ 'test' ], { type: 'image/png' } );
			const mockOnSuccess = vi.fn();

			( uploadMedia as Mock ).mockImplementation( ( { onFileChange } ) => {
				// First call with blob URL (intermediate)
				onFileChange( [ { url: 'blob:http://localhost/temp-id' } ] );
				// Second call with actual media
				onFileChange( [ { id: 123, url: 'https://example.com/uploaded.jpg' } ] );
			} );

			await uploadAnnotation( {
				blob: mockBlob,
				onSuccess: mockOnSuccess,
			} );

			// onSuccess should only be called once with the final media
			expect( mockOnSuccess ).toHaveBeenCalledTimes( 1 );
			expect( mockOnSuccess ).toHaveBeenCalledWith(
				expect.objectContaining( {
					id: 123,
					url: 'https://example.com/uploaded.jpg',
				} )
			);
		} );
	} );

	describe( 'upload errors', () => {
		it( 'should call onError callback when upload fails', async () => {
			const mockBlob = new Blob( [ 'test' ], { type: 'image/png' } );
			const mockOnSuccess = vi.fn();
			const mockOnError = vi.fn();
			const uploadError = new Error( 'Upload failed' );

			( uploadMedia as Mock ).mockImplementation( ( { onError } ) => {
				onError( uploadError );
			} );

			await expect(
				uploadAnnotation( {
					blob: mockBlob,
					onSuccess: mockOnSuccess,
					onError: mockOnError,
				} )
			).rejects.toThrow( 'Upload failed' );

			expect( mockOnError ).toHaveBeenCalledWith( uploadError );
			expect( mockOnSuccess ).not.toHaveBeenCalled();
		} );

		it( 'should reject promise when upload fails even without onError callback', async () => {
			const mockBlob = new Blob( [ 'test' ], { type: 'image/png' } );
			const mockOnSuccess = vi.fn();
			const uploadError = new Error( 'Network error' );

			( uploadMedia as Mock ).mockImplementation( ( { onError } ) => {
				onError( uploadError );
			} );

			await expect(
				uploadAnnotation( {
					blob: mockBlob,
					onSuccess: mockOnSuccess,
				} )
			).rejects.toThrow( 'Network error' );

			expect( mockOnSuccess ).not.toHaveBeenCalled();
		} );

		it( 'should reject if onSuccess throws error', async () => {
			const mockBlob = new Blob( [ 'test' ], { type: 'image/png' } );
			const successError = new Error( 'onSuccess error' );
			const mockOnSuccess = vi.fn().mockRejectedValue( successError );
			const mockUploadedMedia = { id: 123, url: 'https://example.com/uploaded.jpg' };

			( uploadMedia as Mock ).mockImplementation( ( { onFileChange } ) => {
				onFileChange( [ mockUploadedMedia ] );
			} );

			await expect(
				uploadAnnotation( {
					blob: mockBlob,
					onSuccess: mockOnSuccess,
				} )
			).rejects.toThrow( 'onSuccess error' );
		} );
	} );

	describe( 'metadata handling', () => {
		it( 'should accept metadata parameter (for future use)', async () => {
			const mockBlob = new Blob( [ 'test' ], { type: 'image/png' } );
			const mockOnSuccess = vi.fn();
			const metadata = {
				title: 'Test Title',
				alt_text: 'Test alt',
				caption: 'Test caption',
				description: 'Test description',
			};

			( uploadMedia as Mock ).mockImplementation( ( { onFileChange } ) => {
				onFileChange( [ { id: 123, url: 'https://example.com/uploaded.jpg' } ] );
			} );

			// Should not throw even though metadata is currently unused
			await expect(
				uploadAnnotation( {
					blob: mockBlob,
					metadata,
					onSuccess: mockOnSuccess,
				} )
			).resolves.toBeDefined();
		} );
	} );
} );
