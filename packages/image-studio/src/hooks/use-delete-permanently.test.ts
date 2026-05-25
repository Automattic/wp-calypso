/**
 * Tests for useDeletePermanently hook
 *
 * Tests the delete-permanently functionality:
 * - canDeletePermanently logic based on store state
 * - handleDeletePermanently success flow
 * - Error handling
 * - Store actions are called correctly
 * - Double-click guard prevents concurrent calls
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { trackImageStudioError, trackImageStudioImageDeletedPermanently } from '../utils/tracking';
import { useDeletePermanently } from './use-delete-permanently';

// Mutable selector state used by the mocks
let mockSelectorState: {
	attachmentId: number | null;
	isAiProcessing: boolean;
	isAnnotationSaving: boolean;
	originalAttachmentId: number | null;
	savedAttachmentIds: number[];
	draftIds: number[];
	onCloseCallback: ( ( image: any ) => void ) | null;
	hasUnsavedChanges: boolean;
};

const mockResetCanvasHistory = jest.fn();
const mockAddNotice = jest.fn();
const mockSetIsExitConfirmed = jest.fn();
const mockDeleteEntityRecord = jest.fn();
const mockOnExit = jest.fn();
const mockSetIsExiting = jest.fn();

// Create mock selectors object for both useSelect and select
const createMockSelectors = () => ( {
	getImageStudioAttachmentId: () => mockSelectorState.attachmentId,
	getImageStudioAiProcessing: () => mockSelectorState.isAiProcessing,
	getIsAnnotationSaving: () => mockSelectorState.isAnnotationSaving,
	getOriginalAttachmentId: () => mockSelectorState.originalAttachmentId,
	getSavedAttachmentIds: () => mockSelectorState.savedAttachmentIds,
	getDraftIds: () => mockSelectorState.draftIds,
	getOnCloseCallback: () => mockSelectorState.onCloseCallback,
	getHasUnsavedChanges: () => mockSelectorState.hasUnsavedChanges,
} );

jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn( ( selector ) => {
		return selector( () => createMockSelectors() );
	} ),
	useDispatch: jest.fn( ( storeName ) => {
		if ( storeName === 'core' ) {
			return {
				deleteEntityRecord: mockDeleteEntityRecord,
			};
		}
		return {
			resetCanvasHistory: mockResetCanvasHistory,
			addNotice: mockAddNotice,
			setIsExitConfirmed: mockSetIsExitConfirmed,
		};
	} ),
	select: jest.fn( () => createMockSelectors() ),
} ) );

jest.mock( '@wordpress/core-data', () => ( {
	store: 'core',
} ) );

jest.mock( '@wordpress/element', () => ( {
	useCallback: ( fn: ( ...args: unknown[] ) => unknown ) => fn,
	useRef: ( initial: unknown ) => ( { current: initial } ),
	useState: ( initial: unknown ) => [ initial, jest.fn() ],
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

jest.mock( '../store', () => ( {
	store: 'image-studio',
} ) );

jest.mock( '../types', () => ( {
	ImageStudioMode: { Edit: 'edit', Generate: 'generate' },
} ) );

jest.mock( '../utils/tracking', () => ( {
	trackImageStudioImageDeletedPermanently: jest.fn(),
	trackImageStudioError: jest.fn(),
} ) );

const mockDeleteDraftsExcept = jest.fn();
jest.mock( './use-draft-cleanup', () => ( {
	useDraftCleanup: () => ( {
		deleteDraftsExcept: mockDeleteDraftsExcept,
		cleanupOnExit: jest.fn(),
	} ),
} ) );

describe( 'useDeletePermanently', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockSelectorState = {
			attachmentId: 42,
			isAiProcessing: false,
			isAnnotationSaving: false,
			originalAttachmentId: 42,
			savedAttachmentIds: [],
			draftIds: [],
			onCloseCallback: null,
			hasUnsavedChanges: false,
		};
		mockDeleteEntityRecord.mockResolvedValue( undefined );
		mockDeleteDraftsExcept.mockResolvedValue( undefined );
		mockResetCanvasHistory.mockResolvedValue( undefined );
		mockSetIsExitConfirmed.mockResolvedValue( undefined );
	} );

	describe( 'canDeletePermanently', () => {
		it( 'returns true for original image', () => {
			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			expect( result.current.canDeletePermanently ).toBe( true );
		} );

		it( 'returns true for saved image', () => {
			mockSelectorState.attachmentId = 99;
			mockSelectorState.originalAttachmentId = 42;
			mockSelectorState.savedAttachmentIds = [ 99 ];

			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			expect( result.current.canDeletePermanently ).toBe( true );
		} );

		it( 'returns true for saved image in generate mode', () => {
			mockSelectorState.attachmentId = 99;
			mockSelectorState.originalAttachmentId = null;
			mockSelectorState.savedAttachmentIds = [ 99 ];

			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			expect( result.current.canDeletePermanently ).toBe( true );
		} );

		it( 'returns false for unsaved draft', () => {
			mockSelectorState.attachmentId = 99;
			mockSelectorState.originalAttachmentId = 42;
			mockSelectorState.savedAttachmentIds = [];

			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			expect( result.current.canDeletePermanently ).toBe( false );
		} );

		it( 'returns false for unsaved draft in generate mode', () => {
			mockSelectorState.attachmentId = 99;
			mockSelectorState.originalAttachmentId = null;
			mockSelectorState.savedAttachmentIds = [];

			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			expect( result.current.canDeletePermanently ).toBe( false );
		} );

		it( 'returns false when no attachmentId', () => {
			mockSelectorState.attachmentId = null;
			mockSelectorState.originalAttachmentId = null;

			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			expect( result.current.canDeletePermanently ).toBe( false );
		} );

		it( 'returns false when AI is processing', () => {
			mockSelectorState.isAiProcessing = true;

			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			expect( result.current.canDeletePermanently ).toBe( false );
		} );

		it( 'returns false when annotation is saving', () => {
			mockSelectorState.isAnnotationSaving = true;

			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			expect( result.current.canDeletePermanently ).toBe( false );
		} );

		it( 'returns false when hasUnsavedChanges is true', () => {
			mockSelectorState.hasUnsavedChanges = true;

			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			expect( result.current.canDeletePermanently ).toBe( false );
		} );

		it( 'returns false when hasUnsavedChanges is true even for original image', () => {
			// Original image scenario: attachmentId === originalAttachmentId
			mockSelectorState.attachmentId = 42;
			mockSelectorState.originalAttachmentId = 42;
			mockSelectorState.hasUnsavedChanges = true;

			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			expect( result.current.canDeletePermanently ).toBe( false );
		} );

		it( 'returns false when hasUnsavedChanges is true for saved image', () => {
			mockSelectorState.attachmentId = 99;
			mockSelectorState.originalAttachmentId = 42;
			mockSelectorState.savedAttachmentIds = [ 99 ];
			mockSelectorState.hasUnsavedChanges = true;

			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			expect( result.current.canDeletePermanently ).toBe( false );
		} );

		it( 'returns false when drafts exist even for saved image', () => {
			// User saved at 99, but drafts 101, 102 still exist
			mockSelectorState.attachmentId = 99;
			mockSelectorState.originalAttachmentId = 42;
			mockSelectorState.savedAttachmentIds = [ 99 ];
			mockSelectorState.draftIds = [ 101, 102 ]; // Unsaved drafts exist

			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			expect( result.current.canDeletePermanently ).toBe( false );
		} );

		it( 'returns false when drafts exist even for original image', () => {
			// User is viewing original, but has generated drafts
			mockSelectorState.attachmentId = 42;
			mockSelectorState.originalAttachmentId = 42;
			mockSelectorState.draftIds = [ 101, 102 ]; // Unsaved drafts exist

			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			expect( result.current.canDeletePermanently ).toBe( false );
		} );

		it( 'returns true when all drafts have been saved (draftIds empty)', () => {
			// User saved at 99, and no drafts remain
			mockSelectorState.attachmentId = 99;
			mockSelectorState.originalAttachmentId = 42;
			mockSelectorState.savedAttachmentIds = [ 99 ];
			mockSelectorState.draftIds = []; // No unsaved drafts

			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			expect( result.current.canDeletePermanently ).toBe( true );
		} );
	} );

	describe( 'handleDeletePermanently', () => {
		it( 'calls deleteEntityRecord with force: true on success', async () => {
			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			await act( async () => {
				await result.current.handleDeletePermanently();
			} );

			await waitFor( () => {
				expect( mockDeleteEntityRecord ).toHaveBeenCalledWith( 'postType', 'attachment', 42, {
					force: true,
				} );
			} );
		} );

		it( 'calls deleteDraftsExcept, resetCanvasHistory, setIsExitConfirmed before onExit', async () => {
			const callOrder: string[] = [];
			mockDeleteDraftsExcept.mockImplementation( () => {
				callOrder.push( 'deleteDraftsExcept' );
				return Promise.resolve();
			} );
			mockResetCanvasHistory.mockImplementation( () => {
				callOrder.push( 'resetCanvasHistory' );
				return Promise.resolve();
			} );
			mockSetIsExitConfirmed.mockImplementation( () => {
				callOrder.push( 'setIsExitConfirmed' );
				return Promise.resolve();
			} );
			mockOnExit.mockImplementation( () => {
				callOrder.push( 'onExit' );
			} );

			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			await act( async () => {
				await result.current.handleDeletePermanently();
			} );

			await waitFor( () => {
				expect( callOrder ).toEqual( [
					'deleteDraftsExcept',
					'resetCanvasHistory',
					'setIsExitConfirmed',
					'onExit',
				] );
			} );
		} );

		it( 'calls onExit with true after successful deletion', async () => {
			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			await act( async () => {
				await result.current.handleDeletePermanently();
			} );

			await waitFor( () => {
				expect( mockOnExit ).toHaveBeenCalledWith( true );
			} );
		} );

		it( 'calls setIsExitConfirmed with true before onExit', async () => {
			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			await act( async () => {
				await result.current.handleDeletePermanently();
			} );

			await waitFor( () => {
				expect( mockSetIsExitConfirmed ).toHaveBeenCalledWith( true );
			} );
		} );

		it( 'calls deleteDraftsExcept with savedAttachmentIds to keep saved checkpoints', async () => {
			mockSelectorState.savedAttachmentIds = [ 101, 102 ];

			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			await act( async () => {
				await result.current.handleDeletePermanently();
			} );

			await waitFor( () => {
				expect( mockDeleteDraftsExcept ).toHaveBeenCalledWith( [ 101, 102 ] );
			} );
		} );

		it( 'shows error notice when no attachmentId', async () => {
			mockSelectorState.attachmentId = null;
			mockSelectorState.originalAttachmentId = null;

			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			await act( async () => {
				await result.current.handleDeletePermanently();
			} );

			expect( mockAddNotice ).toHaveBeenCalledWith( 'Cannot delete - no image found', 'error' );
			expect( mockDeleteEntityRecord ).not.toHaveBeenCalled();
			expect( mockOnExit ).not.toHaveBeenCalled();
		} );

		it( 'shows error notice on deletion failure', async () => {
			mockDeleteEntityRecord.mockRejectedValue( new Error( 'Network error' ) );

			const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation();

			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			await act( async () => {
				await result.current.handleDeletePermanently();
			} );

			await waitFor( () => {
				expect( mockAddNotice ).toHaveBeenCalledWith(
					'Failed to delete image. Please try again.',
					'error'
				);
				expect( mockOnExit ).not.toHaveBeenCalled();
			} );

			consoleErrorSpy.mockRestore();
		} );

		it( 'tracks successful deletion with correct arguments', async () => {
			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			await act( async () => {
				await result.current.handleDeletePermanently();
			} );

			await waitFor( () => {
				expect( trackImageStudioImageDeletedPermanently ).toHaveBeenCalledWith( {
					attachmentId: 42,
					mode: 'edit',
				} );
			} );
		} );

		it( 'tracks successful deletion in generate mode', async () => {
			mockSelectorState.originalAttachmentId = null;
			mockSelectorState.savedAttachmentIds = [ 42 ];

			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			await act( async () => {
				await result.current.handleDeletePermanently();
			} );

			await waitFor( () => {
				expect( trackImageStudioImageDeletedPermanently ).toHaveBeenCalledWith( {
					attachmentId: 42,
					mode: 'generate',
				} );
			} );
		} );

		it( 'tracks error on deletion failure', async () => {
			mockDeleteEntityRecord.mockRejectedValue( new Error( 'Network error' ) );

			const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation();

			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			await act( async () => {
				await result.current.handleDeletePermanently();
			} );

			await waitFor( () => {
				expect( trackImageStudioError ).toHaveBeenCalledWith( {
					mode: 'edit',
					errorType: 'delete_permanently_failed',
					attachmentId: 42,
				} );
			} );

			consoleErrorSpy.mockRestore();
		} );

		it( 'calls onCloseCallback with null before onExit', async () => {
			const mockOnCloseCallback = jest.fn();
			mockSelectorState.onCloseCallback = mockOnCloseCallback;

			const callOrder: string[] = [];
			mockOnCloseCallback.mockImplementation( () => {
				callOrder.push( 'onCloseCallback' );
			} );
			mockOnExit.mockImplementation( () => {
				callOrder.push( 'onExit' );
			} );

			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			await act( async () => {
				await result.current.handleDeletePermanently();
			} );

			await waitFor( () => {
				expect( mockOnCloseCallback ).toHaveBeenCalledWith( null );
				expect( callOrder ).toEqual( expect.arrayContaining( [ 'onCloseCallback', 'onExit' ] ) );
				expect( callOrder.indexOf( 'onCloseCallback' ) ).toBeLessThan(
					callOrder.indexOf( 'onExit' )
				);
			} );
		} );

		it( 'does not call onCloseCallback when none exists', async () => {
			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			await act( async () => {
				await result.current.handleDeletePermanently();
			} );

			await waitFor( () => {
				expect( mockOnExit ).toHaveBeenCalledWith( true );
			} );
		} );

		it( 'continues deletion flow even when onCloseCallback throws', async () => {
			const mockOnCloseCallback = jest.fn().mockRejectedValue( new Error( 'Callback error' ) );
			mockSelectorState.onCloseCallback = mockOnCloseCallback;

			const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation();

			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			await act( async () => {
				await result.current.handleDeletePermanently();
			} );

			await waitFor( () => {
				// Deletion should still complete successfully
				expect( mockDeleteEntityRecord ).toHaveBeenCalled();
				expect( mockResetCanvasHistory ).toHaveBeenCalled();
				expect( mockSetIsExitConfirmed ).toHaveBeenCalledWith( true );
				expect( mockOnExit ).toHaveBeenCalledWith( true );

				// Error should be logged but not shown to user
				expect( consoleErrorSpy ).toHaveBeenCalledWith(
					'[Image Studio] onCloseCallback failed after deletion:',
					expect.any( Error )
				);

				// No error notice should be shown (deletion succeeded)
				expect( mockAddNotice ).not.toHaveBeenCalled();
			} );

			consoleErrorSpy.mockRestore();
		} );

		it( 'prevents concurrent calls via double-click guard', async () => {
			// Make deleteEntityRecord hang to simulate in-progress deletion
			let resolveDelete: () => void;
			mockDeleteEntityRecord.mockImplementation(
				() =>
					new Promise< void >( ( resolve ) => {
						resolveDelete = resolve;
					} )
			);

			const { result } = renderHook( () =>
				useDeletePermanently( {
					onExit: mockOnExit,
					setIsExiting: mockSetIsExiting,
				} )
			);

			// Start first call (won't resolve yet)
			const firstCall = act( async () => {
				await result.current.handleDeletePermanently();
			} );

			// Second call should be blocked by the guard
			await act( async () => {
				await result.current.handleDeletePermanently();
			} );

			// Only one call to deleteEntityRecord
			expect( mockDeleteEntityRecord ).toHaveBeenCalledTimes( 1 );

			// Resolve the first call
			resolveDelete!();
			await firstCall;
		} );
	} );
} );
