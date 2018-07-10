/**
 * Internal dependencies
 */
import { isHorizontalEdge, placeCaretAtHorizontalEdge, isTextField } from '../dom';

describe( 'DOM', () => {
	let parent;

	beforeEach( () => {
		parent = document.createElement( 'div' );
		document.body.appendChild( parent );
	} );

	afterEach( () => {
		parent.remove();
	} );

	describe( 'isHorizontalEdge', () => {
		it( 'Should return true for empty input', () => {
			const input = document.createElement( 'input' );
			parent.appendChild( input );
			input.focus();
			expect( isHorizontalEdge( input, true ) ).toBe( true );
			expect( isHorizontalEdge( input, false ) ).toBe( true );
		} );

		it( 'Should return the right values if we focus the end of the input', () => {
			const input = document.createElement( 'input' );
			parent.appendChild( input );
			input.value = 'value';
			input.focus();
			input.selectionStart = 5;
			input.selectionEnd = 5;
			expect( isHorizontalEdge( input, true ) ).toBe( false );
			expect( isHorizontalEdge( input, false ) ).toBe( true );
		} );

		it( 'Should return the right values if we focus the start of the input', () => {
			const input = document.createElement( 'input' );
			parent.appendChild( input );
			input.value = 'value';
			input.focus();
			input.selectionStart = 0;
			input.selectionEnd = 0;
			expect( isHorizontalEdge( input, true ) ).toBe( true );
			expect( isHorizontalEdge( input, false ) ).toBe( false );
		} );

		it( 'Should return false if we\'re not at the edge', () => {
			const input = document.createElement( 'input' );
			parent.appendChild( input );
			input.value = 'value';
			input.focus();
			input.selectionStart = 3;
			input.selectionEnd = 3;
			expect( isHorizontalEdge( input, true ) ).toBe( false );
			expect( isHorizontalEdge( input, false ) ).toBe( false );
		} );

		it( 'Should return false if the selection is not collapseds', () => {
			const input = document.createElement( 'input' );
			parent.appendChild( input );
			input.value = 'value';
			input.focus();
			input.selectionStart = 0;
			input.selectionEnd = 5;
			expect( isHorizontalEdge( input, true ) ).toBe( false );
			expect( isHorizontalEdge( input, false ) ).toBe( false );
		} );

		it( 'Should always return true for non content editabless', () => {
			const div = document.createElement( 'div' );
			parent.appendChild( div );
			expect( isHorizontalEdge( div, true ) ).toBe( true );
			expect( isHorizontalEdge( div, false ) ).toBe( true );
		} );
	} );

	describe( 'placeCaretAtHorizontalEdge', () => {
		it( 'should place caret at the start of the input', () => {
			const input = document.createElement( 'input' );
			input.value = 'value';
			placeCaretAtHorizontalEdge( input, true );
			expect( isHorizontalEdge( input, false ) ).toBe( true );
		} );

		it( 'should place caret at the end of the input', () => {
			const input = document.createElement( 'input' );
			input.value = 'value';
			placeCaretAtHorizontalEdge( input, false );
			expect( isHorizontalEdge( input, true ) ).toBe( true );
		} );
	} );

	describe( 'isTextField', () => {
		/**
		 * A sampling of input types expected not to be text eligible.
		 *
		 * @type {string[]}
		 */
		const NON_TEXT_INPUT_TYPES = [
			'button',
			'checkbox',
			'image',
			'hidden',
			'radio',
			'submit',
		];

		/**
		 * A sampling of input types expected to be text eligible.
		 *
		 * @type {string[]}
		 */
		const TEXT_INPUT_TYPES = [
			'text',
			'password',
			'search',
			'url',
		];

		it( 'should return false for non-text input elements', () => {
			NON_TEXT_INPUT_TYPES.forEach( ( type ) => {
				const input = document.createElement( 'input' );
				input.type = type;

				expect( isTextField( input ) ).toBe( false );
			} );
		} );

		it( 'should return true for text input elements', () => {
			TEXT_INPUT_TYPES.forEach( ( type ) => {
				const input = document.createElement( 'input' );
				input.type = type;

				expect( isTextField( input ) ).toBe( true );
			} );
		} );

		it( 'should return true for an textarea element', () => {
			expect( isTextField( document.createElement( 'textarea' ) ) ).toBe( true );
		} );

		it( 'should return true for a contenteditable element', () => {
			const div = document.createElement( 'div' );

			div.contentEditable = 'true';

			expect( isTextField( div ) ).toBe( true );
		} );

		it( 'should return true for a normal div element', () => {
			expect( isTextField( document.createElement( 'div' ) ) ).toBe( false );
		} );
	} );
} );
