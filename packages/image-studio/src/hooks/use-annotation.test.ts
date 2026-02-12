import { renderHook } from '@testing-library/react';
import { useAnnotation } from './use-annotation';
let mockSelectorState: {
	draftIds: number[];
	annotationCanvas: any;
	imageStudioAttachmentId: number | null;
};

const mockSetAnnotationMode = jest.fn();
const mockUpdateImageStudioCanvas = jest.fn();
const mockSetImageStudioOriginalImageUrl = jest.fn();
const mockSetImageStudioAiProcessing = jest.fn();
const mockSetIsAnnotationSaving = jest.fn();
const mockAddAnnotatedAttachmentId = jest.fn();
const mockSetDraftIds = jest.fn();
const mockAnnotationCanvas = {
	getBlob: jest.fn(),
	clear: jest.fn(),
	hasAnnotations: jest.fn(),
	undo: jest.fn(),
	redo: jest.fn(),
	hasUndoneAnnotations: jest.fn(),
};

const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();

let mockImageInstance: any;

jest.mock( '@wordpress/data', () => ( {
	useDispatch: jest.fn( ( storeName ) => {
		if ( storeName === 'image-studio' ) {
			return {
				setAnnotationMode: mockSetAnnotationMode,
				updateImageStudioCanvas: mockUpdateImageStudioCanvas,
				setImageStudioOriginalImageUrl: mockSetImageStudioOriginalImageUrl,
				setImageStudioAiProcessing: mockSetImageStudioAiProcessing,
				setIsAnnotationSaving: mockSetIsAnnotationSaving,
				addAnnotatedAttachmentId: mockAddAnnotatedAttachmentId,
				setDraftIds: mockSetDraftIds,
			};
		}
		return {};
	} ),
	useSelect: jest.fn( ( callback ) =>
		callback( ( storeName: string ) => {
			if ( storeName === 'image-studio' ) {
				return {
					getDraftIds: () => mockSelectorState.draftIds,
					getAnnotationCanvasRef: () => mockSelectorState.annotationCanvas,
				};
			}
			return {};
		} )
	),
} ) );

jest.mock( '../store', () => ( {
	store: 'image-studio',
} ) );

jest.mock( '../utils/upload-annotation', () => ( {
	uploadAnnotation: jest.fn(),
} ) );

const { uploadAnnotation: mockUploadAnnotation } = jest.requireMock(
	'../utils/upload-annotation'
) as jest.Mocked< typeof import('../utils/upload-annotation') >;

jest.mock( '../utils/tracking', () => ( {
	trackImageStudioAnnotationSave: jest.fn(),
	trackImageStudioImageGenerated: jest.fn(),
	trackImageStudioAnnotationUndo: jest.fn(),
	trackImageStudioAnnotationRedo: jest.fn(),
} ) );

const trackingMocks = jest.requireMock( '../utils/tracking' ) as jest.Mocked<
	typeof import('../utils/tracking')
>;
const {
	trackImageStudioAnnotationSave: mockTrackImageStudioAnnotationSave,
	trackImageStudioAnnotationUndo: mockTrackImageStudioAnnotationUndo,
	trackImageStudioAnnotationRedo: mockTrackImageStudioAnnotationRedo,
} = trackingMocks;

describe( 'useAnnotation', () => {
	let mockBlob: Blob;
	let mockBlobUrl: string;
	const mockOriginalImageUrl = 'https://example.com/original-image.jpg';
	const mockUploadedUrl = 'https://example.com/uploaded-image.jpg';

	beforeEach( () => {
		jest.clearAllMocks();
		jest.useFakeTimers();

		mockBlob = new Blob( [ 'test content' ], { type: 'image/png' } );
		mockBlobUrl = 'blob:http://example.com/test-123';

		mockSelectorState = {
			draftIds: [ 1, 2 ],
			annotationCanvas: mockAnnotationCanvas,
			imageStudioAttachmentId: 5,
		};

		global.URL.createObjectURL = mockCreateObjectURL;
		global.URL.revokeObjectURL = mockRevokeObjectURL;
		mockCreateObjectURL.mockReturnValue( mockBlobUrl );

		// Setup Image mock for preloading
		mockImageInstance = {
			onload: null,
			onerror: null,
			src: '',
		};
		global.Image = jest.fn( () => mockImageInstance ) as any;

		// Hook uses window.wp.data.select to get the current attachment ID
		( window as any ).wp = {
			data: {
				select: jest.fn( ( storeName ) => {
					if ( storeName === 'image-studio' ) {
						return {
							getImageStudioAttachmentId: () => mockSelectorState.imageStudioAttachmentId,
						};
					}
					return {};
				} ),
			},
		};

		mockAnnotationCanvas.getBlob.mockResolvedValue( mockBlob );
		mockAnnotationCanvas.clear.mockImplementation( () => {} );
		mockAnnotationCanvas.hasAnnotations.mockReturnValue( true );

		mockUploadAnnotation.mockImplementation( ( options ) => {
			options.onSuccess( {
				id: '123',
				source_url: mockUploadedUrl,
			} );
			return Promise.resolve();
		} );
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	describe( 'handleAnnotationDone', () => {
		it( 'returns early if no annotations exist', async () => {
			mockAnnotationCanvas.hasAnnotations.mockReturnValue( false );

			const { result } = renderHook( () =>
				useAnnotation( {
					originalImageUrl: mockOriginalImageUrl,
				} )
			);

			await result.current.handleAnnotationDone();

			expect( mockSetIsAnnotationSaving ).not.toHaveBeenCalled();
			expect( mockUploadAnnotation ).not.toHaveBeenCalled();
		} );

		it( 'returns early if getBlob returns null', async () => {
			mockAnnotationCanvas.getBlob.mockResolvedValue( null );

			const { result } = renderHook( () =>
				useAnnotation( {
					originalImageUrl: mockOriginalImageUrl,
				} )
			);

			await result.current.handleAnnotationDone();

			expect( mockSetIsAnnotationSaving ).toHaveBeenCalledWith( true );
			expect( mockSetIsAnnotationSaving ).toHaveBeenCalledWith( false );
			expect( mockSetImageStudioAiProcessing ).toHaveBeenCalledWith( {
				source: 'annotation',
				value: false,
			} );
			expect( mockUploadAnnotation ).not.toHaveBeenCalled();
		} );

		it( 'tracks annotation save', async () => {
			const { result } = renderHook( () =>
				useAnnotation( {
					originalImageUrl: mockOriginalImageUrl,
				} )
			);

			const promise = result.current.handleAnnotationDone();
			await jest.runAllTimersAsync();
			await promise;

			expect( mockTrackImageStudioAnnotationSave ).toHaveBeenCalledWith( {
				attachmentId: 5,
				hasAnnotations: true,
			} );
		} );

		it( 'creates blob URL and preloads image', async () => {
			const { result } = renderHook( () =>
				useAnnotation( {
					originalImageUrl: mockOriginalImageUrl,
				} )
			);

			const promise = result.current.handleAnnotationDone();
			await jest.runAllTimersAsync();
			await promise;

			expect( mockCreateObjectURL ).toHaveBeenNthCalledWith( 1, mockBlob );
			expect( global.Image ).toHaveBeenCalledTimes( 2 ); // Two images: blob and uploaded annotation
		} );

		it( 'updates canvas with blob URL', async () => {
			const { result } = renderHook( () =>
				useAnnotation( {
					originalImageUrl: mockOriginalImageUrl,
				} )
			);

			const promise = result.current.handleAnnotationDone();
			await jest.runAllTimersAsync();
			await promise;

			expect( mockUpdateImageStudioCanvas ).toHaveBeenNthCalledWith( 1, mockBlobUrl, 5, false );
		} );

		it( 'clears annotation canvas and exits annotation mode', async () => {
			const { result } = renderHook( () =>
				useAnnotation( {
					originalImageUrl: mockOriginalImageUrl,
				} )
			);

			const promise = result.current.handleAnnotationDone();
			await jest.runAllTimersAsync();
			await promise;

			expect( mockAnnotationCanvas.clear ).toHaveBeenCalled();
			expect( mockSetAnnotationMode ).toHaveBeenCalledWith( false );
		} );

		it( 'extracts filename from originalImageUrl', async () => {
			const { result } = renderHook( () =>
				useAnnotation( {
					originalImageUrl: 'https://example.com/path/to/image.jpg',
				} )
			);

			const promise = result.current.handleAnnotationDone();
			await jest.runAllTimersAsync();
			await promise;

			expect( mockUploadAnnotation ).toHaveBeenCalledWith( {
				originalFilename: 'image.jpg',
				blob: mockBlob,
				onSuccess: expect.any( Function ),
				onError: expect.any( Function ),
			} );
		} );

		it( 'uses default filename when originalImageUrl is null', async () => {
			const { result } = renderHook( () =>
				useAnnotation( {
					originalImageUrl: null,
				} )
			);

			const promise = result.current.handleAnnotationDone();
			await jest.runAllTimersAsync();
			await promise;

			expect( mockUploadAnnotation ).toHaveBeenCalledWith( {
				originalFilename: 'annotated-image.png',
				blob: mockBlob,
				onSuccess: expect.any( Function ),
				onError: expect.any( Function ),
			} );
		} );

		it( 'handles successful upload and updates store', async () => {
			const mockMedia = {
				id: '456',
				source_url: mockUploadedUrl,
			};

			mockUploadAnnotation.mockImplementation( async ( options ) => {
				await options.onSuccess( mockMedia );
				return Promise.resolve();
			} );

			const { result } = renderHook( () =>
				useAnnotation( {
					originalImageUrl: mockOriginalImageUrl,
				} )
			);

			const promise = result.current.handleAnnotationDone();
			await jest.runAllTimersAsync();
			await promise;

			expect( mockUpdateImageStudioCanvas ).toHaveBeenCalledWith( mockUploadedUrl, 456, false );
			expect( mockSetDraftIds ).toHaveBeenCalledWith( [ 1, 2, 456 ] );
			expect( mockSetImageStudioOriginalImageUrl ).toHaveBeenCalledWith( mockUploadedUrl );
			expect( mockAddAnnotatedAttachmentId ).toHaveBeenCalledWith( 456 );
			expect( mockSetImageStudioAiProcessing ).toHaveBeenCalledWith( {
				source: 'annotation',
				value: false,
			} );
			expect( mockSetIsAnnotationSaving ).toHaveBeenCalledWith( false );
		} );

		it( 'revokes blob URL after successful upload', async () => {
			const { result } = renderHook( () =>
				useAnnotation( {
					originalImageUrl: mockOriginalImageUrl,
				} )
			);

			const promise = result.current.handleAnnotationDone();
			await jest.runAllTimersAsync();
			await promise;

			expect( mockRevokeObjectURL ).toHaveBeenCalledWith( mockBlobUrl );
		} );

		it( 'handles upload error', async () => {
			const error = new Error( 'Upload failed' );
			const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

			mockUploadAnnotation.mockImplementation( ( options ) => {
				options.onError( error );
				return Promise.resolve(); // Resolve here to avoid error interrupting the test
			} );

			const { result } = renderHook( () =>
				useAnnotation( {
					originalImageUrl: mockOriginalImageUrl,
				} )
			);

			const promise = result.current.handleAnnotationDone();
			await jest.runAllTimersAsync();
			await promise;

			expect( mockRevokeObjectURL ).toHaveBeenCalledWith( mockBlobUrl );
			expect( mockUpdateImageStudioCanvas ).toHaveBeenCalledWith( mockOriginalImageUrl, 5, false );
			expect( mockSetIsAnnotationSaving ).toHaveBeenCalledWith( false );
			expect( mockSetImageStudioAiProcessing ).toHaveBeenCalledWith( {
				source: 'annotation',
				value: false,
			} );
			expect( consoleErrorSpy ).toHaveBeenCalledWith( error );
			consoleErrorSpy.mockRestore();
		} );
	} );

	describe( 'handleAnnotationClear', () => {
		it( 'clears annotation canvas', () => {
			const { result } = renderHook( () =>
				useAnnotation( {
					originalImageUrl: mockOriginalImageUrl,
				} )
			);

			result.current.handleAnnotationClear();

			expect( mockAnnotationCanvas.clear ).toHaveBeenCalled();
		} );
	} );

	describe( 'handleAnnotationUndo', () => {
		it( 'undoes annotation', () => {
			const { result } = renderHook( () =>
				useAnnotation( {
					originalImageUrl: mockOriginalImageUrl,
				} )
			);

			result.current.handleAnnotationUndo();

			expect( mockAnnotationCanvas.undo ).toHaveBeenCalled();
			expect( mockTrackImageStudioAnnotationUndo ).toHaveBeenCalledWith( {
				attachmentId: 5,
				hasAnnotations: true,
			} );
		} );
	} );

	describe( 'handleAnnotationRedo', () => {
		it( 'redoes annotation', () => {
			const { result } = renderHook( () =>
				useAnnotation( {
					originalImageUrl: mockOriginalImageUrl,
				} )
			);

			result.current.handleAnnotationRedo();

			expect( mockAnnotationCanvas.redo ).toHaveBeenCalled();
			expect( mockTrackImageStudioAnnotationRedo ).toHaveBeenCalledWith( {
				attachmentId: 5,
				hasAnnotations: true,
			} );
		} );
	} );

	describe( 'handleAnnotationToggle', () => {
		it( 'toggles annotation mode', () => {
			const { result } = renderHook( () =>
				useAnnotation( {
					originalImageUrl: mockOriginalImageUrl,
				} )
			);

			result.current.handleAnnotationToggle( true );
			expect( mockSetAnnotationMode ).toHaveBeenCalledWith( false );
			result.current.handleAnnotationToggle( false );
			expect( mockSetAnnotationMode ).toHaveBeenCalledWith( true );
		} );
	} );

	describe( 'hasAnnotations', () => {
		it( 'returns hasAnnotations from canvas', () => {
			mockAnnotationCanvas.hasAnnotations.mockReturnValue( true );

			const { result } = renderHook( () =>
				useAnnotation( {
					originalImageUrl: mockOriginalImageUrl,
				} )
			);

			expect( result.current.hasAnnotations ).toBe( true );
		} );

		it( 'returns false when canvas is null', () => {
			mockSelectorState.annotationCanvas = null;

			const { result } = renderHook( () =>
				useAnnotation( {
					originalImageUrl: mockOriginalImageUrl,
				} )
			);

			expect( result.current.hasAnnotations ).toBe( false );
		} );
	} );

	describe( 'getCurrentAttachmentId', () => {
		it( 'uses attachmentId from store when available', async () => {
			mockSelectorState.imageStudioAttachmentId = 42;

			const { result } = renderHook( () =>
				useAnnotation( {
					originalImageUrl: mockOriginalImageUrl,
					config: { attachmentId: 99 },
				} )
			);

			const promise = result.current.handleAnnotationDone();
			await jest.runAllTimersAsync();
			await promise;

			// Should use  attachment id from store (42) for blob and 123 for uploaded image instead of the id from config
			expect( mockUpdateImageStudioCanvas ).toHaveBeenNthCalledWith( 1, mockBlobUrl, 42, false );
			expect( mockUpdateImageStudioCanvas ).toHaveBeenNthCalledWith(
				2,
				mockUploadedUrl,
				123,
				false
			);
		} );
	} );
} );
