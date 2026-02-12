import { renderHook, waitFor } from '@testing-library/react';
import { useDraftCleanup } from './use-draft-cleanup';

/**
 * Tests for useDraftCleanup hook
 *
 * - Exposes a single `cleanupOnExit` function.
 * - Cleanup rules on exit:
 *   - Always keep: originalAttachmentId + all savedAttachmentIds (if present).
 *   - Delete: all other draft IDs in the current session.
 *   - originalAttachmentId and all savedAttachmentIds are NEVER deleted.
 */

// Mutable selector state used by the `select` mock.
let mockSelectorState;

const mockSetDraftIds = jest.fn();
const mockDeleteEntityRecord = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	select: jest.fn( ( storeName ) => {
		if ( storeName === 'image-studio' ) {
			return {
				getDraftIds: () => mockSelectorState.draftIds,
				getOriginalAttachmentId: () => mockSelectorState.originalAttachmentId,
				getSavedAttachmentIds: () => mockSelectorState.savedAttachmentIds || [],
				getImageStudioAttachmentId: () => mockSelectorState.imageStudioAttachmentId,
			};
		}
		return {};
	} ),
	useDispatch: jest.fn( ( storeName ) => {
		if ( storeName === 'image-studio' ) {
			return {
				setDraftIds: mockSetDraftIds,
			};
		}
		if ( storeName === 'core' ) {
			return {
				deleteEntityRecord: mockDeleteEntityRecord,
			};
		}
		return {};
	} ),
} ) );

jest.mock( '@wordpress/core-data', () => ( {
	store: 'core',
} ) );

jest.mock( '@wordpress/element', () => ( {
	useCallback: ( fn ) => fn,
} ) );

jest.mock( '../store', () => ( {
	store: 'image-studio',
} ) );

jest.mock( '../utils/tracking', () => ( {
	trackImageStudioError: jest.fn(),
} ) );

const { trackImageStudioError: mockTrackImageStudioError } =
	jest.requireMock( '../utils/tracking' );

jest.mock( '../types', () => ( {
	ImageStudioMode: {
		Edit: 'edit',
		Generate: 'generate',
	},
} ) );

describe( 'useDraftCleanup – cleanupOnExit', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockSelectorState = {
			draftIds: [],
			originalAttachmentId: null,
			savedAttachmentIds: [],
			imageStudioAttachmentId: null,
		};
		mockDeleteEntityRecord.mockResolvedValue( undefined );
	} );

	it( 'keeps original + all saved and deletes all other drafts', async () => {
		mockSelectorState = {
			draftIds: [ 1, 2, 3, 4, 5 ],
			originalAttachmentId: 1,
			savedAttachmentIds: [ 4, 5 ], // User saved two images
			imageStudioAttachmentId: 5,
		};

		const { result } = renderHook( () => useDraftCleanup() );

		await result.current.cleanupOnExit();

		// Draft IDs should be cleared immediately, even while deletions run.
		expect( mockSetDraftIds ).toHaveBeenCalledWith( [] );

		await waitFor( () => {
			expect( mockDeleteEntityRecord ).toHaveBeenCalledTimes( 2 );
			expect( mockDeleteEntityRecord ).toHaveBeenCalledWith( 'postType', 'attachment', 2, {
				force: true,
			} );
			expect( mockDeleteEntityRecord ).toHaveBeenCalledWith( 'postType', 'attachment', 3, {
				force: true,
			} );
		} );
	} );

	it( 'deletes all drafts when there is no original or saved images (generate, never saved)', async () => {
		mockSelectorState = {
			draftIds: [ 10, 11 ],
			originalAttachmentId: null,
			savedAttachmentIds: [],
			imageStudioAttachmentId: null,
		};

		const { result } = renderHook( () => useDraftCleanup() );

		await result.current.cleanupOnExit();

		await waitFor( () => {
			expect( mockDeleteEntityRecord ).toHaveBeenCalledTimes( 2 );
		} );
	} );

	it( 'keeps all saved images in generate mode once user saves', async () => {
		mockSelectorState = {
			draftIds: [ 100, 101, 102, 103 ],
			originalAttachmentId: null,
			savedAttachmentIds: [ 102, 103 ], // User saved two images
			imageStudioAttachmentId: 103,
		};

		const { result } = renderHook( () => useDraftCleanup() );

		await result.current.cleanupOnExit();

		await waitFor( () => {
			expect( mockDeleteEntityRecord ).toHaveBeenCalledTimes( 2 );
			expect( mockDeleteEntityRecord ).toHaveBeenCalledWith( 'postType', 'attachment', 100, {
				force: true,
			} );
			expect( mockDeleteEntityRecord ).toHaveBeenCalledWith( 'postType', 'attachment', 101, {
				force: true,
			} );
		} );
	} );

	it( 'in edit flow with no saves, keeps only the original and deletes all drafts', async () => {
		mockSelectorState = {
			// Edit mode: originalAttachmentId is set, but there are no savedAttachmentIds yet.
			// Drafts represent generated edits during the session.
			draftIds: [ 2, 3 ],
			originalAttachmentId: 1,
			savedAttachmentIds: [],
			imageStudioAttachmentId: 3,
		};

		const { result } = renderHook( () => useDraftCleanup() );

		await result.current.cleanupOnExit();

		// Only drafts (2, 3) should be deleted; original (1) must be preserved.
		await waitFor( () => {
			expect( mockDeleteEntityRecord ).toHaveBeenCalledTimes( 2 );
			expect( mockDeleteEntityRecord ).toHaveBeenCalledWith( 'postType', 'attachment', 2, {
				force: true,
			} );
			expect( mockDeleteEntityRecord ).toHaveBeenCalledWith( 'postType', 'attachment', 3, {
				force: true,
			} );
		} );
	} );

	it( 'does nothing when there are no drafts but still clears draftIds', async () => {
		mockSelectorState = {
			draftIds: [],
			originalAttachmentId: 1,
			savedAttachmentIds: [ 2 ],
			imageStudioAttachmentId: 2,
		};

		const { result } = renderHook( () => useDraftCleanup() );

		await result.current.cleanupOnExit();

		expect( mockSetDraftIds ).toHaveBeenCalledWith( [] );
		expect( mockDeleteEntityRecord ).not.toHaveBeenCalled();
	} );

	it( 'never deletes originalAttachmentId or any savedAttachmentIds', async () => {
		mockSelectorState = {
			draftIds: [ 5, 6, 7, 8, 9 ],
			originalAttachmentId: 5,
			savedAttachmentIds: [ 8, 9 ], // User saved two images
			imageStudioAttachmentId: 9,
		};

		const { result } = renderHook( () => useDraftCleanup() );

		await result.current.cleanupOnExit();

		await waitFor( () => {
			expect( mockDeleteEntityRecord ).toHaveBeenCalledTimes( 2 );
		} );

		// Original should never be deleted
		expect( mockDeleteEntityRecord ).not.toHaveBeenCalledWith(
			'postType',
			'attachment',
			5,
			expect.anything()
		);
		// Saved images should never be deleted
		expect( mockDeleteEntityRecord ).not.toHaveBeenCalledWith(
			'postType',
			'attachment',
			8,
			expect.anything()
		);
		expect( mockDeleteEntityRecord ).not.toHaveBeenCalledWith(
			'postType',
			'attachment',
			9,
			expect.anything()
		);
	} );

	it( 'logs and tracks a generic cleanup failure when deletions reject', async () => {
		mockSelectorState = {
			draftIds: [ 1, 2, 3 ],
			originalAttachmentId: 1,
			savedAttachmentIds: [],
			imageStudioAttachmentId: 1,
		};

		mockDeleteEntityRecord.mockImplementation( ( _kind, _name, id ) => {
			if ( id === 2 ) {
				return Promise.reject( new Error( 'Network error' ) );
			}
			return Promise.resolve();
		} );

		const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation();

		const { result } = renderHook( () => useDraftCleanup() );

		await result.current.cleanupOnExit();

		await waitFor( () => {
			expect( mockTrackImageStudioError ).toHaveBeenCalledWith( {
				mode: 'edit',
				errorType: 'draft_cleanup_failed',
				attachmentId: 1,
			} );
		} );

		expect( consoleErrorSpy ).toHaveBeenCalled();
		consoleErrorSpy.mockRestore();
	} );

	it( 'tracks permission errors separately when REST API denies deletion', async () => {
		mockSelectorState = {
			draftIds: [ 1, 2, 3 ],
			originalAttachmentId: 1,
			savedAttachmentIds: [],
			imageStudioAttachmentId: 1,
		};

		mockDeleteEntityRecord.mockImplementation( ( _kind, _name, id ) => {
			if ( id === 3 ) {
				return Promise.reject( {
					code: 'rest_cannot_delete',
					message: 'Sorry, you are not allowed to delete this item.',
				} );
			}
			return Promise.resolve();
		} );

		const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation();

		const { result } = renderHook( () => useDraftCleanup() );

		await result.current.cleanupOnExit();

		await waitFor( () => {
			expect( mockTrackImageStudioError ).toHaveBeenCalledWith( {
				mode: 'edit',
				errorType: 'draft_cleanup_permission_denied',
				attachmentId: 1,
			} );
		} );

		consoleErrorSpy.mockRestore();
	} );

	it( 'tracks errors even if deleteEntityRecord throws synchronously', async () => {
		mockSelectorState = {
			draftIds: [ 1, 2 ],
			originalAttachmentId: 1,
			savedAttachmentIds: [],
			imageStudioAttachmentId: 1,
		};

		mockDeleteEntityRecord.mockImplementation( () => {
			throw new Error( 'Synchronous failure' );
		} );

		const consoleErrorSpy = jest.spyOn( console, 'error' ).mockImplementation();

		const { result } = renderHook( () => useDraftCleanup() );

		await result.current.cleanupOnExit();

		expect( mockTrackImageStudioError ).toHaveBeenCalled();

		consoleErrorSpy.mockRestore();
	} );
} );
