/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
import { fireEvent, render, screen } from '@testing-library/react';

type MockBlock = {
	clientId: string;
	name: string;
	attributes: { content?: { text: string } };
};

let mockSelectedBlock: MockBlock | null = null;
let mockSelection: { clientId: string; attributeKey: string; offset: number }[] = [];
const mockClearSelectedBlock = jest.fn();

const blockEditorSelectors = {
	getSelectedBlock: () => mockSelectedBlock,
	getSelectionStart: () => mockSelection[ 0 ],
	getSelectionEnd: () => mockSelection[ 1 ],
	getBlockAttributes: ( clientId: string ) =>
		mockSelectedBlock?.clientId === clientId ? mockSelectedBlock.attributes : null,
};

jest.mock( '@wordpress/block-editor', () => ( {
	store: 'core/block-editor',
	BlockIcon: () => null,
} ) );
jest.mock( '@wordpress/blocks', () => ( {
	getBlockType: ( name: string ) => ( { title: `Title of ${ name }`, icon: 'icon' } ),
} ) );
jest.mock( '@wordpress/components', () => ( {
	Button: ( { label, onClick }: { label?: string; onClick?: () => void } ) => (
		<button onClick={ onClick }>{ label }</button>
	),
	__unstableMotion: {
		div: ( { children, className }: { children?: React.ReactNode; className?: string } ) => (
			<div className={ className }>{ children }</div>
		),
	},
} ) );
jest.mock( '@wordpress/data', () => ( {
	// Runs the mapping on every render, so `rerender()` observes store changes.
	useSelect: ( mapSelect: ( select: () => typeof blockEditorSelectors ) => unknown ) =>
		mapSelect( () => blockEditorSelectors ),
	useDispatch: () => ( { clearSelectedBlock: mockClearSelectedBlock } ),
} ) );
jest.mock( '@wordpress/i18n', () => ( { __: ( text: string ) => text } ) );
jest.mock( '@wordpress/icons', () => ( { close: 'close' } ) );
jest.mock( '../selected-block/style.scss', () => ( {} ) );

import SelectedBlock from '../selected-block';

function selectParagraph( clientId: string, text: string ): void {
	mockSelectedBlock = {
		clientId,
		name: 'core/paragraph',
		attributes: { content: { text } },
	};
}

beforeEach( () => {
	jest.clearAllMocks();
	mockSelectedBlock = null;
	mockSelection = [];
} );

describe( 'SelectedBlock', () => {
	it( 'renders nothing when no block is selected', () => {
		const { container } = render( <SelectedBlock /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'shows the block content as the label', () => {
		selectParagraph( 'block-1', 'Hello' );

		render( <SelectedBlock /> );

		expect( screen.getByText( 'Hello' ) ).toBeInTheDocument();
	} );

	it( 'falls back to the block type title when the block has no text content', () => {
		mockSelectedBlock = { clientId: 'block-1', name: 'core/image', attributes: {} };

		render( <SelectedBlock /> );

		expect( screen.getByText( 'Title of core/image' ) ).toBeInTheDocument();
	} );

	it( 'shows the selected text in quotes', () => {
		selectParagraph( 'block-1', 'Hello world' );
		mockSelection = [
			{ clientId: 'block-1', attributeKey: 'content', offset: 6 },
			{ clientId: 'block-1', attributeKey: 'content', offset: 11 },
		];

		render( <SelectedBlock /> );

		expect( screen.getByText( '“world”' ) ).toBeInTheDocument();
	} );

	it( 'updates the label in place while the selected block is edited', () => {
		selectParagraph( 'block-1', 'Hel' );
		const { container, rerender } = render( <SelectedBlock /> );
		const pill = container.firstChild;

		selectParagraph( 'block-1', 'Hello' );
		rerender( <SelectedBlock /> );

		// The same node keeps its entrance animation from replaying per keystroke.
		expect( container.firstChild ).toBe( pill );
		expect( screen.getByText( 'Hello' ) ).toBeInTheDocument();
	} );

	it( 'mounts a new pill when a different block is selected', () => {
		selectParagraph( 'block-1', 'First' );
		const { container, rerender } = render( <SelectedBlock /> );
		const pill = container.firstChild;

		selectParagraph( 'block-2', 'Second' );
		rerender( <SelectedBlock /> );

		expect( container.firstChild ).not.toBe( pill );
		expect( screen.getByText( 'Second' ) ).toBeInTheDocument();
	} );

	it( 'clears the selection and announces it', () => {
		selectParagraph( 'block-1', 'Hello' );
		const onCleared = jest.fn();
		window.addEventListener( 'agents-manager-selected-block-cleared', onCleared );

		render( <SelectedBlock /> );
		fireEvent.click( screen.getByRole( 'button', { name: 'Clear selection' } ) );

		expect( mockClearSelectedBlock ).toHaveBeenCalledTimes( 1 );
		expect( onCleared ).toHaveBeenCalledTimes( 1 );
		window.removeEventListener( 'agents-manager-selected-block-cleared', onCleared );
	} );
} );
