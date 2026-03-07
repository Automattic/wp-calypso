/**
 * Tests for getImageData utility
 */
import { resolveSelect } from '@wordpress/data';
import { getImageData } from './get-image-data';

// Mock WordPress data
jest.mock( '@wordpress/data', () => ( {
	resolveSelect: jest.fn(),
} ) );

// Mock i18n
jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

// Mock extract-filename
jest.mock( './extract-filename', () => ( {
	extractFilenameFromUrl: jest.fn( ( url, fallback ) => {
		if ( ! url ) {
			return fallback;
		}
		const parts = url.split( '/' );
		return parts[ parts.length - 1 ] || fallback;
	} ),
} ) );

const mockCoreStore = {
	getEntityRecord: jest.fn(),
};

const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

describe( 'getImageData', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( resolveSelect as unknown as jest.Mock ).mockReturnValue( mockCoreStore );
	} );

	afterAll( () => {
		consoleErrorSpy.mockRestore();
	} );

	describe( 'successful data retrieval', () => {
		it( 'should fetch and transform complete media entity', async () => {
			const mockMedia = {
				id: 123,
				source_url: 'https://example.com/wp-content/uploads/image.jpg',
				alt_text: 'Test image',
				title: {
					raw: 'Test Title',
					rendered: '<h1>Test Title</h1>',
				},
				caption: {
					raw: 'Test caption',
					rendered: '<p>Test caption</p>',
				},
				description: {
					raw: 'Test description',
					rendered: '<p>Test description</p>',
				},
				media_details: {
					width: 1920,
					height: 1080,
				},
			};

			mockCoreStore.getEntityRecord.mockResolvedValue( mockMedia );

			const result = await getImageData( 123 );

			expect( mockCoreStore.getEntityRecord ).toHaveBeenCalledWith( 'postType', 'attachment', 123 );

			expect( result ).toEqual( {
				id: 123,
				url: 'https://example.com/wp-content/uploads/image.jpg',
				alt: 'Test image',
				title: 'Test Title',
				caption: 'Test caption',
				description: 'Test description',
				width: 1920,
				height: 1080,
				filename: 'image.jpg',
			} );
		} );

		it( 'should handle media entity with missing optional fields', async () => {
			const mockMedia = {
				id: 456,
				source_url: 'https://example.com/minimal-image.png',
			};

			mockCoreStore.getEntityRecord.mockResolvedValue( mockMedia );

			const result = await getImageData( 456 );

			expect( result ).toEqual( {
				id: 456,
				url: 'https://example.com/minimal-image.png',
				alt: '',
				title: '',
				caption: '',
				description: '',
				width: 0,
				height: 0,
				filename: 'minimal-image.png',
			} );
		} );

		it( 'should handle media entity with partial metadata', async () => {
			const mockMedia = {
				id: 789,
				source_url: 'https://example.com/partial.jpg',
				alt_text: 'Alt text only',
				media_details: {
					width: 800,
					// height missing
				},
			};

			mockCoreStore.getEntityRecord.mockResolvedValue( mockMedia );

			const result = await getImageData( 789 );

			expect( result ).toEqual( {
				id: 789,
				url: 'https://example.com/partial.jpg',
				alt: 'Alt text only',
				title: '',
				caption: '',
				description: '',
				width: 800,
				height: 0,
				filename: 'partial.jpg',
			} );
		} );
	} );

	describe( 'error handling', () => {
		it( 'should return null when media is not found', async () => {
			mockCoreStore.getEntityRecord.mockResolvedValue( null );

			const result = await getImageData( 999 );

			expect( result ).toBeNull();
			expect( consoleErrorSpy ).not.toHaveBeenCalled();
		} );

		it( 'should return null and log error when getEntityRecord throws', async () => {
			const error = new Error( 'Network error' );
			mockCoreStore.getEntityRecord.mockRejectedValue( error );

			const result = await getImageData( 123 );

			expect( result ).toBeNull();
			expect( consoleErrorSpy ).toHaveBeenCalledWith( 'Error fetching image data:', error );
		} );

		it( 'should return null when getEntityRecord throws non-Error', async () => {
			mockCoreStore.getEntityRecord.mockRejectedValue( 'String error' );

			const result = await getImageData( 123 );

			expect( result ).toBeNull();
			expect( consoleErrorSpy ).toHaveBeenCalledWith(
				'Error fetching image data:',
				'String error'
			);
		} );
	} );

	describe( 'filename extraction', () => {
		it( 'should extract filename from source_url', async () => {
			const { extractFilenameFromUrl } = require( './extract-filename' );

			const mockMedia = {
				id: 123,
				source_url: 'https://example.com/uploads/test-image.jpg',
			};

			mockCoreStore.getEntityRecord.mockResolvedValue( mockMedia );

			await getImageData( 123 );

			expect( extractFilenameFromUrl ).toHaveBeenCalledWith(
				'https://example.com/uploads/test-image.jpg',
				'Untitled'
			);
		} );
	} );

	describe( 'data transformation', () => {
		it( 'should extract raw values from title object', async () => {
			const mockMedia = {
				id: 123,
				source_url: 'https://example.com/image.jpg',
				title: {
					raw: 'Raw Title',
					rendered: '<h1>Rendered Title</h1>',
				},
			};

			mockCoreStore.getEntityRecord.mockResolvedValue( mockMedia );

			const result = await getImageData( 123 );

			expect( result?.title ).toBe( 'Raw Title' );
		} );

		it( 'should extract raw values from caption object', async () => {
			const mockMedia = {
				id: 123,
				source_url: 'https://example.com/image.jpg',
				caption: {
					raw: 'Raw Caption',
					rendered: '<p>Rendered Caption</p>',
				},
			};

			mockCoreStore.getEntityRecord.mockResolvedValue( mockMedia );

			const result = await getImageData( 123 );

			expect( result?.caption ).toBe( 'Raw Caption' );
		} );

		it( 'should extract raw values from description object', async () => {
			const mockMedia = {
				id: 123,
				source_url: 'https://example.com/image.jpg',
				description: {
					raw: 'Raw Description',
					rendered: '<p>Rendered Description</p>',
				},
			};

			mockCoreStore.getEntityRecord.mockResolvedValue( mockMedia );

			const result = await getImageData( 123 );

			expect( result?.description ).toBe( 'Raw Description' );
		} );

		it( 'should extract dimensions from media_details', async () => {
			const mockMedia = {
				id: 123,
				source_url: 'https://example.com/image.jpg',
				media_details: {
					width: 2560,
					height: 1440,
					file: 'image.jpg',
					sizes: {},
				},
			};

			mockCoreStore.getEntityRecord.mockResolvedValue( mockMedia );

			const result = await getImageData( 123 );

			expect( result?.width ).toBe( 2560 );
			expect( result?.height ).toBe( 1440 );
		} );
	} );

	describe( 'edge cases', () => {
		it( 'should handle attachment ID of 0', async () => {
			mockCoreStore.getEntityRecord.mockResolvedValue( null );

			const result = await getImageData( 0 );

			expect( result ).toBeNull();
			expect( mockCoreStore.getEntityRecord ).toHaveBeenCalledWith( 'postType', 'attachment', 0 );
		} );

		it( 'should handle negative attachment ID', async () => {
			mockCoreStore.getEntityRecord.mockResolvedValue( null );

			const result = await getImageData( -1 );

			expect( result ).toBeNull();
		} );

		it( 'should handle very large attachment ID', async () => {
			const largeId = 999999999;
			mockCoreStore.getEntityRecord.mockResolvedValue( null );

			const result = await getImageData( largeId );

			expect( result ).toBeNull();
			expect( mockCoreStore.getEntityRecord ).toHaveBeenCalledWith(
				'postType',
				'attachment',
				largeId
			);
		} );
	} );
} );
