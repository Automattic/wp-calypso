import { act, renderHook, waitFor } from '@testing-library/react';
import { useRevertToOriginal } from './use-revert-to-original';

/**
 * Tests for useRevertToOriginal hook
 *
 * Tests the revert-to-original functionality:
 * - canRevert logic based on store state
 * - handleRevertToOriginal success flow
 * - Error handling for missing data
 * - Store actions are called correctly
 */

// Mutable selector state used by the mocks
let mockSelectorState: {
	originalAttachmentId: number | null;
	attachmentId: number | null;
	isAiProcessing: boolean;
	isAnnotationSaving: boolean;
};

// Mock dispatch functions
const mockUpdateImageStudioCanvas = jest.fn();
const mockResetCanvasHistory = jest.fn();
const mockAddNotice = jest.fn();
const mockDeleteDraftsExcept = jest.fn();
const mockResolveSelect = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn( ( selector ) => {
		return selector( () => ( {
			getOriginalAttachmentId: () => mockSelectorState.originalAttachmentId,
			getImageStudioAttachmentId: () => mockSelectorState.attachmentId,
			getImageStudioAiProcessing: () => mockSelectorState.isAiProcessing,
			getIsAnnotationSaving: () => mockSelectorState.isAnnotationSaving,
		} ) );
	} ),
	useDispatch: jest.fn( () => ( {
		updateImageStudioCanvas: mockUpdateImageStudioCanvas,
		resetCanvasHistory: mockResetCanvasHistory,
		addNotice: mockAddNotice,
	} ) ),
	resolveSelect: jest.fn( () => ( {
		getEntityRecord: mockResolveSelect,
	} ) ),
} ) );

jest.mock( '@wordpress/core-data', () => ( {
	store: 'core',
} ) );

jest.mock( '@wordpress/element', () => ( {
	useCallback: ( fn: ( ...args: unknown[] ) => unknown ) => fn,
	useRef: ( initial: unknown ) => ( { current: initial } ),
	useState: ( initial: unknown ) => {
		let state = initial;
		const setState = ( newState: unknown ) => {
			state = newState;
		};
		return [ state, setState ];
	},
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
	sprintf: ( format: string, ...args: unknown[] ) =>
		format.replace( /%s/g, () => String( args.shift() ) ),
} ) );

jest.mock( '../store', () => ( {
	store: 'image-studio',
} ) );

describe( 'useRevertToOriginal', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockSelectorState = {
			originalAttachmentId: 1,
			attachmentId: 2,
			isAiProcessing: false,
			isAnnotationSaving: false,
		};
		mockDeleteDraftsExcept.mockResolvedValue( undefined );
		mockUpdateImageStudioCanvas.mockResolvedValue( undefined );
		mockResetCanvasHistory.mockResolvedValue( undefined );
	} );

	describe( 'canRevert', () => {
		it( 'returns true when image has been modified', () => {
			mockSelectorState = {
				originalAttachmentId: 1,
				attachmentId: 2, // Different from original
				isAiProcessing: false,
				isAnnotationSaving: false,
			};

			const { result } = renderHook( () =>
				useRevertToOriginal( {
					deleteDraftsExcept: mockDeleteDraftsExcept,
				} )
			);

			expect( result.current.canRevert ).toBe( true );
		} );

		it( 'returns false when originalAttachmentId is null', () => {
			mockSelectorState = {
				originalAttachmentId: null,
				attachmentId: 2,
				isAiProcessing: false,
				isAnnotationSaving: false,
			};

			const { result } = renderHook( () =>
				useRevertToOriginal( {
					deleteDraftsExcept: mockDeleteDraftsExcept,
				} )
			);

			expect( result.current.canRevert ).toBe( false );
		} );

		it( 'returns false when attachmentId equals originalAttachmentId', () => {
			mockSelectorState = {
				originalAttachmentId: 1,
				attachmentId: 1, // Same as original - no changes made
				isAiProcessing: false,
				isAnnotationSaving: false,
			};

			const { result } = renderHook( () =>
				useRevertToOriginal( {
					deleteDraftsExcept: mockDeleteDraftsExcept,
				} )
			);

			expect( result.current.canRevert ).toBe( false );
		} );

		it( 'returns false when AI is processing', () => {
			mockSelectorState = {
				originalAttachmentId: 1,
				attachmentId: 2,
				isAiProcessing: true,
				isAnnotationSaving: false,
			};

			const { result } = renderHook( () =>
				useRevertToOriginal( {
					deleteDraftsExcept: mockDeleteDraftsExcept,
				} )
			);

			expect( result.current.canRevert ).toBe( false );
		} );

		it( 'returns false when annotation is saving', () => {
			mockSelectorState = {
				originalAttachmentId: 1,
				attachmentId: 2,
				isAiProcessing: false,
				isAnnotationSaving: true,
			};

			const { result } = renderHook( () =>
				useRevertToOriginal( {
					deleteDraftsExcept: mockDeleteDraftsExcept,
				} )
			);

			expect( result.current.canRevert ).toBe( false );
		} );
	} );

	describe( 'handleRevertToOriginal', () => {
		it( 'calls all store actions on successful revert', async () => {
			mockResolveSelect.mockResolvedValue( {
				source_url: 'https://example.com/original.jpg',
			} );

			const { result } = renderHook( () =>
				useRevertToOriginal( {
					deleteDraftsExcept: mockDeleteDraftsExcept,
				} )
			);

			await act( async () => {
				await result.current.handleRevertToOriginal();
			} );

			await waitFor( () => {
				expect( mockDeleteDraftsExcept ).toHaveBeenCalledWith( [ 1 ] );
				expect( mockUpdateImageStudioCanvas ).toHaveBeenCalledWith(
					'https://example.com/original.jpg',
					1,
					false
				);
				expect( mockResetCanvasHistory ).toHaveBeenCalled();
				expect( mockAddNotice ).toHaveBeenCalledWith( 'Reverted to original', 'success' );
			} );
		} );

		it( 'shows error notice when originalAttachmentId is missing', async () => {
			mockSelectorState = {
				originalAttachmentId: null,
				attachmentId: 2,
				isAiProcessing: false,
				isAnnotationSaving: false,
			};

			const consoleWarnSpy = jest.spyOn( console, 'warn' ).mockImplementation();

			const { result } = renderHook( () =>
				useRevertToOriginal( {
					deleteDraftsExcept: mockDeleteDraftsExcept,
				} )
			);

			await act( async () => {
				await result.current.handleRevertToOriginal();
			} );

			expect( mockAddNotice ).toHaveBeenCalledWith(
				'Cannot revert - original image not found',
				'error'
			);
			expect( mockDeleteDraftsExcept ).not.toHaveBeenCalled();

			consoleWarnSpy.mockRestore();
		} );

		it( 'shows error notice when attachment fetch returns no URL', async () => {
			mockResolveSelect.mockResolvedValue( {
				source_url: undefined,
			} );

			const consoleWarnSpy = jest.spyOn( console, 'warn' ).mockImplementation();

			const { result } = renderHook( () =>
				useRevertToOriginal( {
					deleteDraftsExcept: mockDeleteDraftsExcept,
				} )
			);

			await act( async () => {
				await result.current.handleRevertToOriginal();
			} );

			expect( mockAddNotice ).toHaveBeenCalledWith(
				'Cannot revert - failed to load original image',
				'error'
			);
			expect( mockUpdateImageStudioCanvas ).not.toHaveBeenCalled();

			consoleWarnSpy.mockRestore();
		} );

		it( 'shows error notice when attachment fetch fails', async () => {
			mockResolveSelect.mockRejectedValue( new Error( 'Network error' ) );

			const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation();

			const { result } = renderHook( () =>
				useRevertToOriginal( {
					deleteDraftsExcept: mockDeleteDraftsExcept,
				} )
			);

			await act( async () => {
				await result.current.handleRevertToOriginal();
			} );

			await waitFor( () => {
				expect( mockAddNotice ).toHaveBeenCalledWith(
					'Failed to revert image: Network error',
					'error'
				);
			} );

			consoleErrorSpy.mockRestore();
		} );

		it( 'handles deleteDraftsExcept failure gracefully', async () => {
			mockResolveSelect.mockResolvedValue( {
				source_url: 'https://example.com/original.jpg',
			} );
			mockDeleteDraftsExcept.mockRejectedValue( new Error( 'Delete failed' ) );

			const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation();

			const { result } = renderHook( () =>
				useRevertToOriginal( {
					deleteDraftsExcept: mockDeleteDraftsExcept,
				} )
			);

			await act( async () => {
				await result.current.handleRevertToOriginal();
			} );

			await waitFor( () => {
				expect( mockAddNotice ).toHaveBeenCalledWith(
					'Failed to revert image: Delete failed',
					'error'
				);
			} );

			consoleErrorSpy.mockRestore();
		} );
	} );
} );
