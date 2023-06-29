/**
 * @jest-environment jsdom
 */

/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["testOnBlur", "expect.*"] }] */
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { filter, map } from 'lodash';
import fixtures from './lib/fixtures';
import TokenFieldWrapper, { suggestions } from './lib/token-field-wrapper';

/**
 * Module variables
 */
const keyCodes = {
	backspace: 8,
	tab: 9,
	enter: 13,
	leftArrow: 37,
	upArrow: 38,
	rightArrow: 39,
	downArrow: 40,
	delete: 46,
	comma: 188,
};

const charCodes = {
	comma: 44,
};

describe( 'TokenField', () => {
	let originalScroll;

	async function setText( text ) {
		const user = userEvent.setup();

		const field = screen.getAllByRole( 'textbox' )[ 1 ];
		await user.clear( field );
		if ( text.length ) {
			await user.type( field, text );
		}
	}

	function sendKeyDown( keyCode, shiftKey ) {
		fireEvent.keyDown( screen.getAllByRole( 'textbox' )[ 1 ], {
			keyCode,
			shiftKey: !! shiftKey,
		} );
	}

	function sendKeyPress( charCode ) {
		fireEvent.keyPress( screen.getAllByRole( 'textbox' )[ 1 ], {
			charCode,
		} );
	}

	function getTokensHTML( container ) {
		const textNodes = container.querySelectorAll( '.token-field__token-text' );

		return Array.from( textNodes ).map( ( node ) => node.innerHTML );
	}

	function getSuggestionsText( container, selector ) {
		const suggestionNodes = container.querySelectorAll( selector || '.token-field__suggestion' );

		return Array.from( suggestionNodes ).map( getSuggestionNodeText );
	}

	function getSuggestionNodeText( node ) {
		if ( ! node.querySelectorAll( 'span' ).length ) {
			return node.innerHTML;
		}

		// This suggestion is part of a partial match; return up to three
		// sections of the suggestion (before match, match, and after
		// match)
		const div = document.createElement( 'div' );
		div.innerHTML = node.querySelector( 'span' ).outerHTML;

		return map(
			filter(
				div.firstChild.childNodes,
				( childNode ) => childNode.nodeType !== window.Node.COMMENT_NODE
			),
			( childNode ) => childNode.textContent
		);
	}

	function getSelectedSuggestion( container ) {
		const selectedSuggestions = getSuggestionsText(
			container,
			'.token-field__suggestion.is-selected'
		);

		return selectedSuggestions[ 0 ] || null;
	}

	beforeAll( () => {
		originalScroll = window.scroll;
		window.scroll = () => null;
	} );

	afterAll( () => {
		window.scroll = originalScroll;
	} );

	describe( 'render', () => {
		test( 'should render tokens', () => {
			const { container } = render( <TokenFieldWrapper /> );

			expect( container ).toMatchSnapshot();
		} );
	} );

	describe( 'displaying tokens', () => {
		test( 'should render default tokens', () => {
			const { container } = render( <TokenFieldWrapper /> );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'bar' ] );
		} );

		test( 'should display tokens with escaped special characters properly', () => {
			const { container } = render(
				<TokenFieldWrapper tokens={ fixtures.specialTokens.textEscaped } />
			);

			expect( getTokensHTML( container ) ).toEqual( fixtures.specialTokens.htmlEscaped );
		} );

		test( 'should display tokens with special characters properly', () => {
			// This test is not as realistic as the previous one: if a WP site
			// contains tag names with special characters, the API will always
			// return the tag names already escaped.  However, this is still
			// worth testing, so we can be sure that token values with
			// dangerous characters in them don't have these characters carried
			// through unescaped to the HTML.
			const { container } = render(
				<TokenFieldWrapper tokens={ fixtures.specialTokens.textUnescaped } />
			);
			expect( getTokensHTML( container ) ).toEqual( fixtures.specialTokens.htmlUnescaped );
		} );
	} );

	describe( 'suggestions', () => {
		test( 'should render default suggestions', () => {
			const { container } = render( <TokenFieldWrapper /> );

			// limited by maxSuggestions (default 100 so doesn't matter here)
			expect( getSuggestionsText( container ) ).toEqual( suggestions );
		} );

		test( 'should remove already added tags from suggestions', () => {
			const { container } = render(
				<TokenFieldWrapper tokens={ Object.freeze( [ 'of', 'and' ] ) } />
			);
			expect( getSuggestionsText( container ) ).toEqual(
				expect.not.arrayContaining( getTokensHTML( container ) )
			);
		} );

		test( 'should suggest partial matches', async () => {
			const { container } = render( <TokenFieldWrapper /> );

			await setText( 't' );

			expect( getSuggestionsText( container ) ).toEqual( fixtures.matchingSuggestions.t );
		} );

		test( 'suggestions that begin with match are boosted', async () => {
			const { container } = render( <TokenFieldWrapper /> );

			await setText( 's' );

			expect( getSuggestionsText( container ) ).toEqual( fixtures.matchingSuggestions.s );
		} );

		test( 'should display suggestions with escaped special characters properly', () => {
			const { container } = render(
				<TokenFieldWrapper suggestions={ fixtures.specialSuggestions.textEscaped } />
			);

			expect( getSuggestionsText( container ) ).toEqual( fixtures.specialSuggestions.htmlEscaped );
		} );

		test( 'should display suggestions with special characters properly', () => {
			const { container } = render(
				<TokenFieldWrapper suggestions={ fixtures.specialSuggestions.textUnescaped } />
			);

			expect( getSuggestionsText( container ) ).toEqual(
				fixtures.specialSuggestions.htmlUnescaped
			);
		} );

		test( 'should match against the unescaped values of suggestions with special characters', async () => {
			const { container } = render(
				<TokenFieldWrapper suggestions={ fixtures.specialSuggestions.textUnescaped } />
			);

			await setText( '&' );

			expect( getSuggestionsText( container ) ).toEqual(
				fixtures.specialSuggestions.matchAmpersandUnescaped
			);
		} );

		test( 'should match against the unescaped values of suggestions with special characters (including spaces)', async () => {
			const { container } = render(
				<TokenFieldWrapper suggestions={ fixtures.specialSuggestions.textUnescaped } />
			);

			await setText( 's &' );

			expect( getSuggestionsText( container ) ).toEqual(
				fixtures.specialSuggestions.matchAmpersandSequence
			);
		} );

		test( 'should not match against the escaped values of suggestions with special characters', async () => {
			const { container } = render(
				<TokenFieldWrapper suggestions={ fixtures.specialSuggestions.textUnescaped } />
			);

			await setText( 'amp' );

			expect( getSuggestionsText( container ) ).toEqual(
				fixtures.specialSuggestions.matchAmpersandEscaped
			);
		} );

		test( 'should match suggestions even with trailing spaces', async () => {
			const { container } = render( <TokenFieldWrapper /> );

			await setText( '  at  ' );

			expect( getSuggestionsText( container ) ).toEqual( fixtures.matchingSuggestions.at );
		} );

		test( 'should manage the selected suggestion based on both keyboard and mouse events', async () => {
			const user = userEvent.setup();
			const { container } = render( <TokenFieldWrapper /> );

			await setText( 't' );

			expect( getSuggestionsText( container ) ).toEqual( fixtures.matchingSuggestions.t );
			expect( getSelectedSuggestion( container ) ).toBeNull();

			sendKeyDown( keyCodes.downArrow ); // 'the'

			expect( getSelectedSuggestion( container ) ).toEqual( [ 't', 'he' ] );

			sendKeyDown( keyCodes.downArrow ); // 'to'

			expect( getSelectedSuggestion( container ) ).toEqual( [ 't', 'o' ] );

			const hoverSuggestion = container.querySelectorAll( '.token-field__suggestion' )[ 5 ]; // 'it'
			expect( getSuggestionNodeText( hoverSuggestion ) ).toEqual( [ 'i', 't' ] );

			// before sending a hover event, we need to wait for
			// SuggestionList#_scrollingIntoView to become false
			await new Promise( ( resolve ) => setTimeout( () => resolve(), 200 ) );

			await user.hover( hoverSuggestion );

			sendKeyDown( keyCodes.upArrow );

			expect( getSelectedSuggestion( container ) ).toEqual( [ 'wi', 't', 'h' ] );

			sendKeyDown( keyCodes.upArrow );

			expect( getSelectedSuggestion( container ) ).toEqual( [ 't', 'his' ] );

			await user.click( hoverSuggestion );

			expect( getSelectedSuggestion( container ) ).toBeNull();
			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'bar', 'it' ] );
		} );
	} );

	describe( 'adding tokens', () => {
		test( 'should add a token when Tab pressed', async () => {
			const { container } = render( <TokenFieldWrapper /> );

			await setText( 'baz' );

			sendKeyDown( keyCodes.tab );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'bar', 'baz' ] );
			expect( screen.getAllByRole( 'textbox' )[ 1 ] ).toHaveAttribute( 'value', '' );
		} );

		test( 'should not allow adding blank tokens with Tab', () => {
			const { container } = render( <TokenFieldWrapper /> );

			sendKeyDown( keyCodes.tab );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'bar' ] );
		} );

		test( 'should not allow adding whitespace tokens with Tab', async () => {
			const { container } = render( <TokenFieldWrapper /> );

			await setText( '   ' );

			sendKeyDown( keyCodes.tab );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'bar' ] );
		} );

		test( 'should add a token when Enter pressed', async () => {
			const { container } = render( <TokenFieldWrapper /> );

			await setText( 'baz' );

			sendKeyDown( keyCodes.enter );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'bar', 'baz' ] );
			expect( screen.getAllByRole( 'textbox' )[ 1 ] ).toHaveAttribute( 'value', '' );
		} );

		test( 'should not allow adding blank tokens with Enter', () => {
			const { container } = render( <TokenFieldWrapper /> );

			sendKeyDown( keyCodes.enter );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'bar' ] );
		} );

		test( 'should not allow adding whitespace tokens with Enter', async () => {
			const { container } = render( <TokenFieldWrapper /> );

			await setText( '   ' );

			sendKeyDown( keyCodes.enter );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'bar' ] );
		} );

		test( 'should not allow adding whitespace tokens with comma', async () => {
			const { container } = render( <TokenFieldWrapper /> );

			await setText( '   ' );

			sendKeyPress( charCodes.comma );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'bar' ] );
		} );

		test( 'should add a token when comma pressed', async () => {
			const { container } = render( <TokenFieldWrapper /> );

			await setText( 'baz' );

			sendKeyPress( charCodes.comma );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'bar', 'baz' ] );
		} );

		test( 'should not add a token when < pressed', async () => {
			const { container } = render( <TokenFieldWrapper /> );

			await setText( 'baz' );

			sendKeyDown( keyCodes.comma, true );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'bar' ] );

			// The text input does not register the < keypress when it is sent this way.
			expect( screen.getAllByRole( 'textbox' )[ 1 ] ).toHaveAttribute( 'value', 'baz' );
		} );

		test( 'should trim token values when adding', async () => {
			const { container } = render( <TokenFieldWrapper /> );

			await setText( '  baz  ' );

			sendKeyDown( keyCodes.enter );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'bar', 'baz' ] );
		} );

		async function testOnBlur(
			container,
			initialText,
			selectSuggestion,
			expectedSuggestion,
			expectedTokens
		) {
			await setText( initialText );

			if ( selectSuggestion ) {
				sendKeyDown( keyCodes.downArrow ); // 'the'
				sendKeyDown( keyCodes.downArrow ); // 'to'
			}

			expect( getSelectedSuggestion( container ) ).toEqual( expectedSuggestion );

			function testSavedState( isActive ) {
				expect( getTokensHTML( container ) ).toEqual( expectedTokens );
				expect( screen.getAllByRole( 'textbox' )[ 1 ] ).toHaveAttribute( 'value', '' );
				expect( getSelectedSuggestion( container ) ).toBeNull();
				expect( container.querySelectorAll( '.is-active' ).length === 1 ).toBe( isActive );
			}

			const input = screen.getAllByRole( 'textbox' )[ 1 ];
			fireEvent.blur( input );
			testSavedState( false );
			fireEvent.focus( input );
			testSavedState( true );
		}

		test( 'should add the current text when the input field loses focus', async () => {
			const { container } = render( <TokenFieldWrapper /> );

			await testOnBlur(
				container,
				't', // initialText
				false, // selectSuggestion
				null, // expectedSuggestion
				[ 'foo', 'bar', 't' ] // expectedTokens
			);
		} );

		test( 'should add the suggested token when the (non-blank) input field loses focus', async () => {
			const { container } = render( <TokenFieldWrapper /> );

			await testOnBlur(
				container,
				't', // initialText
				true, // selectSuggestion
				[ 't', 'o' ], // expectedSuggestion
				[ 'foo', 'bar', 'to' ] // expectedTokens
			);
		} );

		test( 'should not add the suggested token when the (blank) input field loses focus', async () => {
			const { container } = render( <TokenFieldWrapper /> );

			await testOnBlur(
				container,
				'', // initialText
				true, // selectSuggestion
				'of', // expectedSuggestion
				[ 'foo', 'bar' ] // expectedTokens
			);
		} );

		// prevents regression of https://github.com/Automattic/wp-calypso/issues/1884
		test( 'should not lose focus when a suggestion is clicked', async () => {
			const user = userEvent.setup();
			const { container } = render( <TokenFieldWrapper /> );

			screen.getAllByRole( 'textbox' )[ 1 ].focus();

			const firstSuggestion = container.querySelectorAll( '.token-field__suggestion' )[ 0 ];

			await user.click( firstSuggestion );

			// wait for setState call
			await new Promise( ( resolve ) => setTimeout( () => resolve(), 100 ) );

			expect( container.querySelectorAll( '.is-active' ) ).toHaveLength( 1 );
		} );

		test( 'should add tokens in the middle of the current tokens', async () => {
			const { container } = render( <TokenFieldWrapper /> );

			sendKeyDown( keyCodes.leftArrow );

			await setText( 'baz' );

			sendKeyDown( keyCodes.tab );

			await setText( 'quux' );

			sendKeyDown( keyCodes.tab );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'baz', 'quux', 'bar' ] );
		} );

		test( 'should add tokens from the selected matching suggestion using Tab', async () => {
			const { container } = render( <TokenFieldWrapper /> );

			await setText( 't' );

			expect( getSelectedSuggestion( container ) ).toBeNull();

			sendKeyDown( keyCodes.downArrow ); // 'the'

			expect( getSelectedSuggestion( container ) ).toEqual( [ 't', 'he' ] );

			sendKeyDown( keyCodes.downArrow ); // 'to'

			expect( getSelectedSuggestion( container ) ).toEqual( [ 't', 'o' ] );

			sendKeyDown( keyCodes.tab );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'bar', 'to' ] );
			expect( getSelectedSuggestion( container ) ).toBeNull();
		} );

		test( 'should add tokens from the selected matching suggestion using Enter', async () => {
			const { container } = render( <TokenFieldWrapper /> );

			await setText( 't' );

			expect( getSelectedSuggestion( container ) ).toBeNull();

			sendKeyDown( keyCodes.downArrow ); // 'the'

			expect( getSelectedSuggestion( container ) ).toEqual( [ 't', 'he' ] );

			sendKeyDown( keyCodes.downArrow ); // 'to'

			expect( getSelectedSuggestion( container ) ).toEqual( [ 't', 'o' ] );

			sendKeyDown( keyCodes.enter );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'bar', 'to' ] );
			expect( getSelectedSuggestion( container ) ).toBeNull();
		} );

		test( 'should add tokens from the selected suggestion using Tab', () => {
			const { container } = render( <TokenFieldWrapper /> );

			expect( getSelectedSuggestion( container ) ).toBeNull();

			sendKeyDown( keyCodes.downArrow ); // 'the'

			expect( getSelectedSuggestion( container ) ).toBe( 'the' );

			sendKeyDown( keyCodes.downArrow ); // 'of'

			expect( getSelectedSuggestion( container ) ).toBe( 'of' );

			sendKeyDown( keyCodes.tab );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'bar', 'of' ] );
			expect( getSelectedSuggestion( container ) ).toBeNull();
		} );

		test( 'should add tokens from the selected suggestion using Enter', () => {
			const { container } = render( <TokenFieldWrapper /> );

			expect( getSelectedSuggestion( container ) ).toBeNull();

			sendKeyDown( keyCodes.downArrow ); // 'the'

			expect( getSelectedSuggestion( container ) ).toBe( 'the' );

			sendKeyDown( keyCodes.downArrow ); // 'of'

			expect( getSelectedSuggestion( container ) ).toBe( 'of' );

			sendKeyDown( keyCodes.enter );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'bar', 'of' ] );
			expect( getSelectedSuggestion( container ) ).toBeNull();
		} );
	} );

	describe( 'adding multiple tokens when pasting', () => {
		test( 'should add multiple comma-separated tokens when pasting', async () => {
			const { container } = render( <TokenFieldWrapper /> );

			await setText( 'baz, quux, wut' );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'bar', 'baz', 'quux' ] );

			expect( screen.getAllByRole( 'textbox' )[ 1 ] ).toHaveAttribute( 'value', ' wut' );

			await setText( 'wut,' );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'bar', 'baz', 'quux', 'wut' ] );
			expect( screen.getAllByRole( 'textbox' )[ 1 ] ).toHaveAttribute( 'value', '' );
		} );

		test( 'should add multiple tab-separated tokens when pasting', async () => {
			const { container } = render( <TokenFieldWrapper /> );

			await setText( 'baz\tquux\twut' );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'bar', 'baz', 'quux' ] );
			expect( screen.getAllByRole( 'textbox' )[ 1 ] ).toHaveAttribute( 'value', 'wut' );
		} );

		test( 'should not duplicate tokens when pasting', async () => {
			const { container } = render( <TokenFieldWrapper /> );

			await setText( 'baz \tbaz,  quux \tquux,quux , wut  \twut, wut' );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'bar', 'baz', 'quux', 'wut' ] );
			expect( screen.getAllByRole( 'textbox' )[ 1 ] ).toHaveAttribute( 'value', ' wut' );
		} );

		test( 'should skip empty tokens at the beginning of a paste', async () => {
			const { container } = render( <TokenFieldWrapper /> );

			await setText( ',  ,\t \t  ,,baz, quux' );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'bar', 'baz' ] );
			expect( screen.getAllByRole( 'textbox' )[ 1 ] ).toHaveAttribute( 'value', ' quux' );
		} );

		test( 'should skip empty tokens in the middle of a paste', async () => {
			const { container } = render( <TokenFieldWrapper /> );

			await setText( 'baz,  ,\t \t  ,,quux' );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'bar', 'baz' ] );
			expect( screen.getAllByRole( 'textbox' )[ 1 ] ).toHaveAttribute( 'value', '  quux' );
		} );

		test( 'should skip empty tokens at the end of a paste', async () => {
			const { container } = render( <TokenFieldWrapper /> );

			await setText( 'baz, quux,  ,\t \t  ,,   ' );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo', 'bar', 'baz', 'quux' ] );
			expect( screen.getAllByRole( 'textbox' )[ 1 ] ).toHaveAttribute( 'value', '     ' );
		} );
	} );

	describe( 'removing tokens', () => {
		test( 'should remove tokens when X icon clicked', async () => {
			const user = userEvent.setup();
			const { container } = render( <TokenFieldWrapper /> );

			screen.getAllByRole( 'textbox' )[ 1 ].focus();

			await user.click( container.querySelectorAll( '.token-field__remove-token' )[ 0 ] );

			expect( getTokensHTML( container ) ).toEqual( [ 'bar' ] );
		} );

		test( 'should remove the token to the left when backspace pressed', () => {
			const { container } = render( <TokenFieldWrapper />, { legacyRoot: true } );

			screen.getAllByRole( 'textbox' )[ 1 ].focus();

			sendKeyDown( keyCodes.backspace );

			expect( getTokensHTML( container ) ).toEqual( [ 'foo' ] );
		} );

		test( 'should remove the token to the right when delete pressed', () => {
			const { container } = render( <TokenFieldWrapper /> );

			screen.getAllByRole( 'textbox' )[ 1 ].focus();

			sendKeyDown( keyCodes.leftArrow );
			sendKeyDown( keyCodes.leftArrow );
			sendKeyDown( keyCodes.delete );

			expect( getTokensHTML( container ) ).toEqual( [ 'bar' ] );
		} );
	} );
} );
