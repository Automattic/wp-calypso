/**
 * Tests for useUnsavedChangesConfirmation hook
 *
 * Updated behavior:
 * - Uses `hasUnsavedChanges` + `hasUpdatedMetadata` from the store instead of draft IDs.
 * - Save & Exit: runs onSave, then onExit( true ).
 * - Discard: runs onDiscard, then onExit( true ).
 * - Clean exit (no changes): runs onExit( false ).
 */
import { act, renderHook } from '@testing-library/react';
import { useUnsavedChangesConfirmation } from './use-unsaved-changes-confirmation';

// Store selector and action mocks
const mockGetHasUnsavedChanges = jest.fn();
const mockGetHasUpdatedMetadata = jest.fn();
const mockGetLastSavedAttachmentId = jest.fn();
const mockSetIsExitConfirmed = jest.fn();

// Mock @wordpress/data
jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn( ( callback ) =>
		callback( ( storeName ) => {
			if ( storeName === 'image-studio' ) {
				return {
					getHasUnsavedChanges: mockGetHasUnsavedChanges,
					getHasUpdatedMetadata: mockGetHasUpdatedMetadata,
					getLastSavedAttachmentId: mockGetLastSavedAttachmentId,
				};
			}
			return {};
		} )
	),
	useDispatch: jest.fn( ( storeName ) => {
		if ( storeName === 'image-studio' ) {
			return {
				setIsExitConfirmed: mockSetIsExitConfirmed,
			};
		}
		return {};
	} ),
} ) );

// Mock @wordpress/element
jest.mock( '@wordpress/element', () => ( {
	useState: jest.requireActual( '@wordpress/element' ).useState,
	useCallback: jest.requireActual( '@wordpress/element' ).useCallback,
	useEffect: jest.requireActual( '@wordpress/element' ).useEffect,
} ) );

// Mock store
jest.mock( '../store', () => ( {
	store: 'image-studio',
} ) );

describe( 'useUnsavedChangesConfirmation', () => {
	let mockOnSave;
	let mockOnDiscard;
	let mockOnExit;

	beforeEach( () => {
		jest.clearAllMocks();
		mockOnSave = jest.fn().mockResolvedValue( undefined );
		mockOnDiscard = jest.fn().mockResolvedValue( undefined );
		mockOnExit = jest.fn().mockResolvedValue( undefined );

		mockGetHasUnsavedChanges.mockReturnValue( false );
		mockGetHasUpdatedMetadata.mockReturnValue( false );
		mockGetLastSavedAttachmentId.mockReturnValue( null );
		mockSetIsExitConfirmed.mockReturnValue( undefined );
	} );

	describe( 'initial state', () => {
		it( 'starts with dialog closed and exposes all handlers', () => {
			const { result } = renderHook( () =>
				useUnsavedChangesConfirmation( {
					onSave: mockOnSave,
					onDiscard: mockOnDiscard,
					onExit: mockOnExit,
				} )
			);

			expect( result.current.isConfirmDialogOpen ).toBe( false );
			expect( result.current.handleRequestClose ).toBeDefined();
			expect( result.current.handleConfirmSave ).toBeDefined();
			expect( result.current.handleConfirmDiscard ).toBeDefined();
			expect( result.current.handleConfirmCancel ).toBeDefined();
		} );
	} );

	describe( 'handleRequestClose', () => {
		it( 'opens confirm dialog when there are unsaved changes', () => {
			mockGetHasUnsavedChanges.mockReturnValue( true );

			const { result } = renderHook( () =>
				useUnsavedChangesConfirmation( {
					onSave: mockOnSave,
					onDiscard: mockOnDiscard,
					onExit: mockOnExit,
				} )
			);

			act( () => {
				result.current.handleRequestClose();
			} );

			expect( result.current.isConfirmDialogOpen ).toBe( true );
			expect( mockOnExit ).not.toHaveBeenCalled();
		} );

		it( 'opens confirm dialog when only metadata has been updated', () => {
			mockGetHasUnsavedChanges.mockReturnValue( false );
			mockGetHasUpdatedMetadata.mockReturnValue( true );

			const { result } = renderHook( () =>
				useUnsavedChangesConfirmation( {
					onSave: mockOnSave,
					onDiscard: mockOnDiscard,
					onExit: mockOnExit,
				} )
			);

			act( () => {
				result.current.handleRequestClose();
			} );

			expect( result.current.isConfirmDialogOpen ).toBe( true );
			expect( mockOnExit ).not.toHaveBeenCalled();
		} );

		it( 'performs clean exit and calls onExit(false) when there are no unsaved changes', async () => {
			mockGetHasUnsavedChanges.mockReturnValue( false );
			mockGetHasUpdatedMetadata.mockReturnValue( false );

			const { result } = renderHook( () =>
				useUnsavedChangesConfirmation( {
					onSave: mockOnSave,
					onDiscard: mockOnDiscard,
					onExit: mockOnExit,
				} )
			);

			await act( async () => {
				await result.current.handleRequestClose();
			} );

			expect( result.current.isConfirmDialogOpen ).toBe( false );
			expect( mockOnExit ).toHaveBeenCalledWith( false );
		} );

		it( 'sets isExiting state during clean exit with no unsaved changes', async () => {
			mockGetHasUnsavedChanges.mockReturnValue( false );
			mockGetHasUpdatedMetadata.mockReturnValue( false );

			// Make onExit async with a delay to observe isExiting state during cleanup
			let exitResolve;
			const exitPromise = new Promise( ( resolve ) => {
				exitResolve = resolve;
			} );
			mockOnExit.mockReturnValue( exitPromise );

			const { result } = renderHook( () =>
				useUnsavedChangesConfirmation( {
					onSave: mockOnSave,
					onDiscard: mockOnDiscard,
					onExit: mockOnExit,
				} )
			);

			// Initial state
			expect( result.current.isExiting ).toBe( false );

			// Start exit process (don't await yet)
			let handleRequestClosePromise;
			act( () => {
				handleRequestClosePromise = result.current.handleRequestClose();
			} );

			// Wait for state update to propagate
			await act( async () => {
				await Promise.resolve();
			} );

			// isExiting should be true during cleanup
			expect( result.current.isExiting ).toBe( true );
			expect( mockOnExit ).toHaveBeenCalledWith( false );

			// Complete the exit process
			await act( async () => {
				exitResolve();
				await handleRequestClosePromise;
			} );

			// After cleanup completes, isExiting should be false again
			expect( result.current.isExiting ).toBe( false );
		} );

		it( 'does nothing if dialog is already open', () => {
			mockGetHasUnsavedChanges.mockReturnValue( true );

			const { result } = renderHook( () =>
				useUnsavedChangesConfirmation( {
					onSave: mockOnSave,
					onDiscard: mockOnDiscard,
					onExit: mockOnExit,
				} )
			);

			act( () => {
				result.current.handleRequestClose();
			} );
			expect( result.current.isConfirmDialogOpen ).toBe( true );

			act( () => {
				result.current.handleRequestClose();
			} );

			expect( result.current.isConfirmDialogOpen ).toBe( true );
			expect( mockOnExit ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'handleConfirmSave (Save & Exit)', () => {
		it( 'closes dialog, calls onSave, sets exit confirmed, and then calls onExit(true)', async () => {
			mockGetHasUnsavedChanges.mockReturnValue( true );

			const { result } = renderHook( () =>
				useUnsavedChangesConfirmation( {
					onSave: mockOnSave,
					onDiscard: mockOnDiscard,
					onExit: mockOnExit,
				} )
			);

			// Open dialog first
			act( () => {
				result.current.handleRequestClose();
			} );
			expect( result.current.isConfirmDialogOpen ).toBe( true );

			await act( async () => {
				await result.current.handleConfirmSave();
			} );

			expect( mockOnSave ).toHaveBeenCalledTimes( 1 );
			expect( mockSetIsExitConfirmed ).toHaveBeenCalledWith( true );
			expect( mockOnExit ).toHaveBeenCalledWith( true );
			expect( result.current.isConfirmDialogOpen ).toBe( false );
		} );
	} );

	describe( 'handleConfirmDiscard', () => {
		it( 'closes dialog, calls onDiscard, sets exit confirmed, and then calls onExit(true)', async () => {
			mockGetHasUnsavedChanges.mockReturnValue( true );

			const { result } = renderHook( () =>
				useUnsavedChangesConfirmation( {
					onSave: mockOnSave,
					onDiscard: mockOnDiscard,
					onExit: mockOnExit,
				} )
			);

			await act( async () => {
				await result.current.handleConfirmDiscard();
			} );

			expect( mockOnDiscard ).toHaveBeenCalledTimes( 1 );
			expect( mockSetIsExitConfirmed ).toHaveBeenCalledWith( true );
			expect( mockOnExit ).toHaveBeenCalledWith( true );
			expect( result.current.isConfirmDialogOpen ).toBe( false );
		} );
	} );

	describe( 'handleConfirmCancel', () => {
		it( 'closes confirm dialog without calling any callbacks', () => {
			mockGetHasUnsavedChanges.mockReturnValue( true );

			const { result } = renderHook( () =>
				useUnsavedChangesConfirmation( {
					onSave: mockOnSave,
					onDiscard: mockOnDiscard,
					onExit: mockOnExit,
				} )
			);

			// Open dialog first
			act( () => {
				result.current.handleRequestClose();
			} );
			expect( result.current.isConfirmDialogOpen ).toBe( true );

			act( () => {
				result.current.handleConfirmCancel();
			} );

			expect( result.current.isConfirmDialogOpen ).toBe( false );
			expect( mockOnExit ).not.toHaveBeenCalled();
			expect( mockOnSave ).not.toHaveBeenCalled();
			expect( mockOnDiscard ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'ESC key handling', () => {
		it( 'intercepts ESC and opens confirmation when there are unsaved changes', () => {
			mockGetHasUnsavedChanges.mockReturnValue( true );

			const { result } = renderHook( () =>
				useUnsavedChangesConfirmation( {
					onSave: mockOnSave,
					onDiscard: mockOnDiscard,
					onExit: mockOnExit,
				} )
			);

			const escapeEvent = new window.KeyboardEvent( 'keydown', {
				key: 'Escape',
				bubbles: true,
				cancelable: true,
			} );

			act( () => {
				document.dispatchEvent( escapeEvent );
			} );

			expect( result.current.isConfirmDialogOpen ).toBe( true );
			expect( escapeEvent.defaultPrevented ).toBe( true );
		} );

		it( 'does not register keydown listener when there are no unsaved changes', () => {
			mockGetHasUnsavedChanges.mockReturnValue( false );

			const addEventListenerSpy = jest.spyOn( document, 'addEventListener' );

			renderHook( () =>
				useUnsavedChangesConfirmation( {
					onSave: mockOnSave,
					onDiscard: mockOnDiscard,
					onExit: mockOnExit,
				} )
			);

			expect( addEventListenerSpy ).not.toHaveBeenCalled();
			addEventListenerSpy.mockRestore();
		} );

		it( 'does not intercept ESC when dialog is already open', () => {
			mockGetHasUnsavedChanges.mockReturnValue( true );

			const { result } = renderHook( () =>
				useUnsavedChangesConfirmation( {
					onSave: mockOnSave,
					onDiscard: mockOnDiscard,
					onExit: mockOnExit,
				} )
			);

			act( () => {
				result.current.handleRequestClose();
			} );
			expect( result.current.isConfirmDialogOpen ).toBe( true );

			const escapeEvent = new window.KeyboardEvent( 'keydown', {
				key: 'Escape',
				bubbles: true,
				cancelable: true,
			} );

			act( () => {
				document.dispatchEvent( escapeEvent );
			} );

			expect( escapeEvent.defaultPrevented ).toBe( false );
		} );

		it( 'removes keydown listener on unmount', () => {
			mockGetHasUnsavedChanges.mockReturnValue( true );

			const addEventListenerSpy = jest.spyOn( document, 'addEventListener' );
			const removeEventListenerSpy = jest.spyOn( document, 'removeEventListener' );

			const { unmount } = renderHook( () =>
				useUnsavedChangesConfirmation( {
					onSave: mockOnSave,
					onDiscard: mockOnDiscard,
					onExit: mockOnExit,
				} )
			);

			expect( addEventListenerSpy ).toHaveBeenCalledWith( 'keydown', expect.any( Function ), true );

			unmount();

			expect( removeEventListenerSpy ).toHaveBeenCalledWith(
				'keydown',
				expect.any( Function ),
				true
			);

			addEventListenerSpy.mockRestore();
			removeEventListenerSpy.mockRestore();
		} );
	} );

	describe( 'integration scenarios', () => {
		it( 'handles a complete save flow from close request to Save & Exit', async () => {
			mockGetHasUnsavedChanges.mockReturnValue( true );

			const { result } = renderHook( () =>
				useUnsavedChangesConfirmation( {
					onSave: mockOnSave,
					onDiscard: mockOnDiscard,
					onExit: mockOnExit,
				} )
			);

			act( () => {
				result.current.handleRequestClose();
			} );
			expect( result.current.isConfirmDialogOpen ).toBe( true );

			await act( async () => {
				await result.current.handleConfirmSave();
			} );

			expect( mockOnSave ).toHaveBeenCalled();
			expect( mockSetIsExitConfirmed ).toHaveBeenCalledWith( true );
			expect( mockOnExit ).toHaveBeenCalledWith( true );
		} );

		it( 'handles a complete discard flow from close request to Discard', async () => {
			mockGetHasUnsavedChanges.mockReturnValue( true );

			const { result } = renderHook( () =>
				useUnsavedChangesConfirmation( {
					onSave: mockOnSave,
					onDiscard: mockOnDiscard,
					onExit: mockOnExit,
				} )
			);

			act( () => {
				result.current.handleRequestClose();
			} );
			expect( result.current.isConfirmDialogOpen ).toBe( true );

			await act( async () => {
				await result.current.handleConfirmDiscard();
			} );

			expect( mockOnDiscard ).toHaveBeenCalled();
			expect( mockSetIsExitConfirmed ).toHaveBeenCalledWith( true );
			expect( mockOnExit ).toHaveBeenCalledWith( true );
			expect( result.current.isConfirmDialogOpen ).toBe( false );
		} );
	} );
} );
