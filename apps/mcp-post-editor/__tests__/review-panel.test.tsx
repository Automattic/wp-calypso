/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { ReviewPanel } from '../editor/review-panel';
import type { Feedback, FixStatuses, ProofreadIssue } from '../editor/proofread';
import type { ComponentProps } from 'react';

const noStatus: FixStatuses = { proofread: {}, feedback: {} };

const panel = ( props: Partial< ComponentProps< typeof ReviewPanel > > = {} ) => (
	<ReviewPanel
		issues={ [] }
		feedback={ null }
		status={ noStatus }
		positions={ {} }
		onApply={ vi.fn() }
		onDismiss={ vi.fn() }
		onUndo={ vi.fn() }
		onShow={ vi.fn() }
		{ ...props }
	/>
);
const renderPanel = ( feedback: Feedback | null ) => render( panel( { feedback } ) );

const issue = ( fields: Partial< ProofreadIssue > = {} ): ProofreadIssue => ( {
	id: 'p1',
	block_index: 2,
	quote: 'the the',
	replacement: 'the',
	reason: 'Repeated word.',
	kind: 'grammar',
	...fields,
} );

const card = ( id: string ) =>
	document.querySelector( `[data-kind="proofread"] [data-id="${ id }"]` ) as HTMLElement;

describe( 'ReviewPanel', () => {
	// jsdom has no CSS global.
	beforeAll( () => vi.stubGlobal( 'CSS', { escape: ( value: string ) => value } ) );
	afterAll( () => vi.unstubAllGlobals() );

	it( 'shows a review with no items as its summary, with nothing to apply', () => {
		renderPanel( { summary: 'Reads well as it is.', items: [] } );
		expect( screen.getByRole( 'button', { name: 'Editorial' } ) ).toBeTruthy();
		expect( screen.getByText( 'No changes suggested' ) ).toBeTruthy();
		expect( screen.getByText( 'Reads well as it is.' ) ).toBeTruthy();
		expect( screen.queryByRole( 'button', { name: 'Apply all' } ) ).toBeNull();
	} );

	it( 'shows no editorial section for a review with no items and no summary', () => {
		renderPanel( { summary: ' ', items: [] } );
		expect( screen.queryByText( /Editorial/ ) ).toBeNull();
		expect( screen.queryByText( 'No changes suggested' ) ).toBeNull();
	} );

	it( 'shows a proofreading issue as a card, and applies it', () => {
		const onApply = vi.fn();
		const onShow = vi.fn();
		const fix = issue();
		render( panel( { issues: [ fix ], positions: { 'proofread:p1': 3 }, onApply, onShow } ) );

		const item = within( card( 'p1' ) );
		expect( item.getByText( 'Grammar' ) ).toBeTruthy();
		expect( item.getByText( 'Repeated word.' ) ).toBeTruthy();
		expect( item.getByText( 'Current' ) ).toBeTruthy();
		expect( item.getByText( 'the the' ).tagName ).toBe( 'DEL' );
		expect( item.getByText( 'New' ) ).toBeTruthy();
		expect( item.getByText( 'the' ).tagName ).toBe( 'INS' );
		// Where its block is now.
		fireEvent.click( item.getByText( 'Block 3' ) );
		expect( onShow ).toHaveBeenCalledWith( fix, 'proofread' );

		fireEvent.click( item.getByRole( 'button', { name: 'Apply change' } ) );
		expect( onApply ).toHaveBeenCalledWith( 'proofread', [ fix ] );
		expect( screen.getByRole( 'button', { name: 'Proofread (1)' } ) ).toBeTruthy();
	} );

	it( 'leaves out an issue’s Why when it has no reason', () => {
		render( panel( { issues: [ issue( { reason: '' } ) ] } ) );
		expect( within( card( 'p1' ) ).queryByText( 'Why' ) ).toBeNull();
	} );

	it( 'shows a resolved issue with Undo, counts only the open ones, and applies only those', () => {
		const onUndo = vi.fn();
		const onApply = vi.fn();
		const open = issue( { id: 'p2' } );
		render(
			panel( {
				issues: [ issue(), open, issue( { id: 'p3' } ) ],
				status: { proofread: { p1: 'applied', p3: 'dismissed' }, feedback: {} },
				onUndo,
				onApply,
			} )
		);

		expect( screen.getByRole( 'button', { name: 'Proofread (1)' } ) ).toBeTruthy();
		expect( within( card( 'p1' ) ).getByText( 'Applied' ) ).toBeTruthy();
		expect( within( card( 'p1' ) ).queryByText( 'Current' ) ).toBeNull();
		expect( within( card( 'p3' ) ).getByText( 'Dismissed' ) ).toBeTruthy();
		fireEvent.click( within( card( 'p1' ) ).getByRole( 'button', { name: 'Undo' } ) );
		expect( onUndo ).toHaveBeenCalledWith( 'proofread', issue() );

		fireEvent.click( screen.getByRole( 'button', { name: 'Apply all' } ) );
		expect( onApply ).toHaveBeenCalledWith( 'proofread', [ open ] );
	} );

	it( 'focuses a card’s Undo once it resolves, and its Apply once undone', () => {
		const props = { issues: [ issue() ], onDismiss: vi.fn() };
		const { rerender } = render( panel( props ) );

		fireEvent.click( within( card( 'p1' ) ).getByRole( 'button', { name: 'Dismiss' } ) );
		expect( props.onDismiss ).toHaveBeenCalledWith( 'proofread', 'p1' );
		rerender( panel( { ...props, status: { proofread: { p1: 'dismissed' }, feedback: {} } } ) );
		const undo = within( card( 'p1' ) ).getByRole( 'button', { name: 'Undo' } );
		expect( document.activeElement ).toBe( undo );

		fireEvent.click( undo );
		rerender( panel( props ) );
		expect( document.activeElement ).toBe(
			within( card( 'p1' ) ).getByRole( 'button', { name: 'Apply change' } )
		);
	} );

	it( 'focuses its section’s heading when a focused card goes', () => {
		const props = { issues: [ issue(), issue( { id: 'p2' } ) ] };
		const { rerender } = render( panel( props ) );
		within( card( 'p1' ) ).getByRole( 'button', { name: 'Apply change' } ).focus();

		// The canvas no longer has its quote.
		rerender( panel( { issues: [ issue( { id: 'p2' } ) ] } ) );
		expect( document.activeElement ).toBe(
			screen.getByRole( 'button', { name: 'Proofread (1)' } )
		);
	} );

	it( 'focuses the panel when a focused card goes with its section', () => {
		const feedback = { summary: 'Good', items: [] };
		const { rerender } = render( panel( { issues: [ issue() ], feedback } ) );
		within( card( 'p1' ) ).getByRole( 'button', { name: 'Apply change' } ).focus();

		rerender( panel( { feedback } ) );
		expect( document.activeElement ).toBe( screen.getByRole( 'region', { name: 'Review' } ) );
	} );

	it( 'focuses the canvas when it goes with the focus in it', () => {
		const canvas = document.createElement( 'div' );
		canvas.className = 'editor-styles-wrapper';
		canvas.tabIndex = 0;
		document.body.append( canvas );
		const { unmount } = render( panel( { issues: [ issue() ] } ) );
		within( card( 'p1' ) ).getByRole( 'button', { name: 'Dismiss' } ).focus();

		unmount();
		expect( document.activeElement ).toBe( canvas );
		canvas.remove();
	} );
} );
