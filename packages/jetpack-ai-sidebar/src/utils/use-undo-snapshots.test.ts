/**
 * @jest-environment jsdom
 */

jest.mock( './block-actions', () => ( {
	undoBlockEdit: jest.fn( () => true ),
} ) );

import { renderHook } from '@testing-library/react';
import { undoBlockEdit } from './block-actions';
import useUndoSnapshots from './use-undo-snapshots';

const mockUndoBlockEdit = undoBlockEdit as jest.MockedFunction< typeof undoBlockEdit >;

describe( 'useUndoSnapshots', () => {
	beforeEach( () => {
		mockUndoBlockEdit.mockReset();
		mockUndoBlockEdit.mockReturnValue( true );
	} );

	it( 'stores a snapshot only from a complete successful result', () => {
		const { result } = renderHook( () => useUndoSnapshots< string >() );

		expect(
			result.current.saveFromApplyResult( 'a', {
				success: true,
				clientId: 'b1',
				contentBefore: 'x',
				contentAfter: 'y',
			} )
		).toBe( true );
		expect(
			result.current.saveFromApplyResult( 'b', {
				success: true,
				clientId: 'b1',
				contentAfter: 'y',
			} )
		).toBe( false );
		expect(
			result.current.saveFromApplyResult( 'c', {
				success: false,
				clientId: 'b1',
				contentBefore: 'x',
				contentAfter: 'y',
			} )
		).toBe( false );
	} );

	it( 'reverts a stored snapshot and forgets it', () => {
		const { result } = renderHook( () => useUndoSnapshots< string >() );
		result.current.saveFromApplyResult( 'a', {
			success: true,
			clientId: 'b1',
			contentBefore: 'x',
			contentAfter: 'y',
			editableAttribute: 'content',
		} );

		expect( result.current.undo( 'a', true ) ).toBe( 'success' );

		expect( mockUndoBlockEdit ).toHaveBeenCalledWith( 'b1', 'x', 'y', 'content' );
		// The snapshot is gone, so a required undo now reports it missing.
		expect( result.current.undo( 'a', true ) ).toBe( 'missing_snapshot' );
	} );

	it( 'reports a failed editor revert without forgetting the snapshot', () => {
		const { result } = renderHook( () => useUndoSnapshots< string >() );
		result.current.saveFromApplyResult( 'a', {
			success: true,
			clientId: 'b1',
			contentBefore: 'x',
			contentAfter: 'y',
		} );
		mockUndoBlockEdit.mockReturnValueOnce( false );

		expect( result.current.undo( 'a', true ) ).toBe( 'failed' );
		expect( result.current.undo( 'a', true ) ).toBe( 'success' );
	} );

	it( 'treats a snapshot-less undo as a plain reset when none is required', () => {
		const { result } = renderHook( () => useUndoSnapshots< string >() );

		expect( result.current.undo( 'dismissed-item', false ) ).toBe( 'success' );
		expect( mockUndoBlockEdit ).not.toHaveBeenCalled();
	} );
} );
