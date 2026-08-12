/**
 * @jest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import FeedbackList, { type FeedbackListItem } from './feedback-list';

const mockApplyReviewEdit = jest.fn();
const mockUndoBlockEdit = jest.fn();
let mockCurrentPostId = 1;
const mockBlocks = [
	{ clientId: 'block-1', name: 'core/paragraph', attributes: { content: 'First source' } },
	{ clientId: 'block-2', name: 'core/paragraph', attributes: { content: 'Second source' } },
];

jest.mock( '../utils/block-actions', () => ( {
	applyReviewEdit: ( ...args: any[] ) => mockApplyReviewEdit( ...args ),
	clearActiveBlockFocus: jest.fn(),
	clearActiveBlockFocusUnlessBlockReferenceClick: jest.fn(),
	countCurrentTextOccurrences: () => 1,
	getEditableBlockContent: ( block: any ) => block.attributes.content,
	hasEditableBlockTarget: () => true,
	toggleBlockReferenceFocus: jest.fn(),
	undoBlockEdit: ( ...args: any[] ) => mockUndoBlockEdit( ...args ),
} ) );

jest.mock( '../utils/blocks', () => ( {
	flattenBlocks: ( blocks: any[] ) => blocks,
	getEditorContentBlocks: ( blockEditor: { getBlocks: () => any[] } ) => blockEditor.getBlocks(),
} ) );

jest.mock( '../utils/use-copy-to-clipboard', () => ( {
	useCopyToClipboard: () => ( {
		clipboardSupported: false,
		copiedKey: null,
		copy: jest.fn(),
	} ),
} ) );

jest.mock( './split-screen-guide', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( './review-card', () => {
	const ReactModule = jest.requireActual< typeof import('react') >( 'react' );
	return {
		__esModule: true,
		default: ( { status, onApply, onDismiss, onUndo }: any ) =>
			ReactModule.createElement(
				'div',
				null,
				status === 'accepted' || status === 'dismissed'
					? ReactModule.createElement( 'button', { type: 'button', onClick: onUndo }, 'Undo' )
					: ReactModule.createElement(
							ReactModule.Fragment,
							null,
							ReactModule.createElement(
								'button',
								{ type: 'button', onClick: onApply },
								status === 'failed' ? 'Retry' : 'Apply change'
							),
							ReactModule.createElement(
								'button',
								{ type: 'button', onClick: onDismiss },
								'Dismiss'
							)
					  )
			),
	};
} );

jest.mock( '@wordpress/data', () => ( {
	useSelect: ( mapSelect: any ) =>
		mapSelect( ( store: string ) => {
			if ( store === 'core/block-editor' ) {
				return { getBlocks: () => mockBlocks };
			}
			if ( store === 'core/editor' ) {
				return { getCurrentPostId: () => mockCurrentPostId };
			}
			return {};
		} ),
} ) );

jest.mock( '@wordpress/components', () => {
	const ReactModule = jest.requireActual< typeof import('react') >( 'react' );
	return {
		Panel: ( { children }: any ) => ReactModule.createElement( 'div', null, children ),
		PanelBody: ( { children }: any ) => ReactModule.createElement( 'section', null, children ),
	};
} );

const items: FeedbackListItem[] = [
	{
		title: 'First edit',
		feedback: 'First feedback',
		action: 'Rewrite',
		block_index: 0,
		current_text: 'First source',
		suggested_text: 'First replacement',
	},
	{
		title: 'Second edit',
		feedback: 'Second feedback',
		action: 'Rewrite',
		block_index: 1,
		current_text: 'Second source',
		suggested_text: 'Second replacement',
	},
];

function renderFeedbackList( onResponseAction: jest.Mock, listItems = items ) {
	return render(
		<FeedbackList
			componentType="proofread"
			summary="Review complete."
			items={ listItems }
			postId={ 1 }
			sectionFallbackTitle="Suggested edits"
			staleWarning="Review is stale."
			failureMessage="Could not apply."
			enableBulkApply
			onResponseAction={ onResponseAction }
		/>
	);
}

beforeEach( () => {
	mockApplyReviewEdit.mockReset();
	mockUndoBlockEdit.mockReset();
	mockUndoBlockEdit.mockReturnValue( true );
	mockCurrentPostId = 1;
	( window as any ).wp = {
		data: {
			select: () => ( { getCurrentPostId: () => mockCurrentPostId } ),
		},
	};
} );

afterEach( () => {
	delete ( window as any ).wp;
} );

it( 'reports an individual apply and its inline undo from existing operation results', async () => {
	const onResponseAction = jest.fn();
	mockApplyReviewEdit.mockResolvedValueOnce( {
		success: true,
		clientId: 'block-1',
		contentBefore: 'First source',
		contentAfter: 'First replacement',
	} );
	renderFeedbackList( onResponseAction, [ items[ 0 ] ] );

	await act( async () => {
		fireEvent.click( screen.getByRole( 'button', { name: 'Apply change' } ) );
	} );

	await waitFor( () =>
		expect( onResponseAction ).toHaveBeenLastCalledWith( {
			action: 'accept',
			target: 'edit',
			outcome: 'success',
		} )
	);

	fireEvent.click( screen.getByRole( 'button', { name: 'Undo' } ) );

	expect( mockUndoBlockEdit ).toHaveBeenCalledWith(
		'block-1',
		'First source',
		'First replacement',
		undefined
	);
	expect( onResponseAction ).toHaveBeenLastCalledWith( {
		action: 'undo',
		target: 'edit',
		outcome: 'success',
	} );
} );

it( 'reports one aggregate action for a partial bulk apply', async () => {
	const onResponseAction = jest.fn();
	mockApplyReviewEdit
		.mockResolvedValueOnce( {
			success: true,
			clientId: 'block-1',
			contentBefore: 'First source',
			contentAfter: 'First replacement',
		} )
		.mockResolvedValueOnce( { success: false } );
	renderFeedbackList( onResponseAction );

	await act( async () => {
		fireEvent.click( screen.getByRole( 'button', { name: 'Apply all (2)' } ) );
	} );

	await waitFor( () => expect( onResponseAction ).toHaveBeenCalledTimes( 1 ) );
	expect( onResponseAction ).toHaveBeenCalledWith( {
		action: 'bulk_accept',
		target: 'edit',
		outcome: 'partial_failed',
		itemCount: 2,
	} );
} );
