/**
 * External dependencies
 */
import { filter, map } from 'lodash';
import { mount } from 'enzyme';

/**
 * Internal dependencies
 */
import fixtures from './lib/fixtures';
import TokenFieldWrapper from './lib/token-field-wrapper';

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

describe( 'FormTokenField', function() {
	let wrapper, textInputNode;

	function setText( text ) {
		textInputNode.simulate( 'change', { target: { value: text } } );
	}

	function sendKeyDown( keyCode, shiftKey ) {
		wrapper.simulate( 'keyDown', {
			keyCode: keyCode,
			shiftKey: ! ! shiftKey,
		} );
	}

	function sendKeyPress( charCode ) {
		wrapper.simulate( 'keyPress', {
			charCode: charCode,
		} );
	}

	function getNodeInnerHtml( node ) {
		const div = document.createElement( 'div' );
		div.innerHTML = node.html();
		return div.firstChild.innerHTML;
	}

	function getTokensHTML() {
		const textNodes = wrapper.find( '.components-form-token-field__token-text span[aria-hidden]' );

		return textNodes.map( getNodeInnerHtml );
	}

	function getSuggestionsText( selector ) {
		const suggestionNodes = wrapper.find( selector || '.components-form-token-field__suggestion' );

		return suggestionNodes.map( getSuggestionNodeText );
	}

	function getSuggestionNodeText( node ) {
		if ( ! node.find( 'span' ).length ) {
			return getNodeInnerHtml( node );
		}

		// This suggestion is part of a partial match; return up to three
		// sections of the suggestion (before match, match, and after
		// match)
		const div = document.createElement( 'div' );
		div.innerHTML = node.find( 'span' ).html();

		return map(
			filter(
				div.firstChild.childNodes,
				( childNode ) => childNode.nodeType !== window.Node.COMMENT_NODE
			),
			( childNode ) => childNode.textContent
		);
	}

	function getSelectedSuggestion() {
		const selectedSuggestions = getSuggestionsText( '.components-form-token-field__suggestion.is-selected' );

		return selectedSuggestions[ 0 ] || null;
	}

	beforeEach( function() {
		wrapper = mount( <TokenFieldWrapper /> );
		textInputNode = wrapper.find( '.components-form-token-field__input' );
		textInputNode.simulate( 'focus' );
	} );

	describe( 'displaying tokens', function() {
		it( 'should render default tokens', function() {
			expect( wrapper.state( 'tokens' ) ).toEqual( [ 'foo', 'bar' ] );
		} );

		it( 'should display tokens with escaped special characters properly', function() {
			wrapper.setState( {
				tokens: fixtures.specialTokens.textEscaped,
			} );
			expect( getTokensHTML() ).toEqual( fixtures.specialTokens.htmlEscaped );
		} );

		it( 'should display tokens with special characters properly', function() {
			// This test is not as realistic as the previous one: if a WP site
			// contains tag names with special characters, the API will always
			// return the tag names already escaped.  However, this is still
			// worth testing, so we can be sure that token values with
			// dangerous characters in them don't have these characters carried
			// through unescaped to the HTML.
			wrapper.setState( {
				tokens: fixtures.specialTokens.textUnescaped,
			} );
			expect( getTokensHTML() ).toEqual( fixtures.specialTokens.htmlUnescaped );
		} );
	} );

	describe( 'suggestions', function() {
		it( 'should not render suggestions unless we type at least two characters', function() {
			expect( getSuggestionsText() ).toEqual( [] );
			setText( 'th' );
			expect( getSuggestionsText() ).toEqual( fixtures.matchingSuggestions.th );
		} );

		it( 'should remove already added tags from suggestions', function() {
			wrapper.setState( {
				tokens: Object.freeze( [ 'of', 'and' ] ),
			} );
			expect( getSuggestionsText() ).not.toEqual( getTokensHTML() );
		} );

		it( 'suggestions that begin with match are boosted', function() {
			setText( 'so' );
			expect( getSuggestionsText() ).toEqual( fixtures.matchingSuggestions.so );
		} );

		it( 'should match against the unescaped values of suggestions with special characters', function() {
			setText( '& S' );
			wrapper.setState( {
				tokenSuggestions: fixtures.specialSuggestions.textUnescaped,
			} );
			expect( getSuggestionsText() ).toEqual( fixtures.specialSuggestions.matchAmpersandUnescaped );
		} );

		it( 'should match against the unescaped values of suggestions with special characters (including spaces)', function() {
			setText( 's &' );
			wrapper.setState( {
				tokenSuggestions: fixtures.specialSuggestions.textUnescaped,
			} );
			expect( getSuggestionsText() ).toEqual( fixtures.specialSuggestions.matchAmpersandSequence );
		} );

		it( 'should not match against the escaped values of suggestions with special characters', function() {
			setText( 'amp' );
			wrapper.setState( {
				tokenSuggestions: fixtures.specialSuggestions.textUnescaped,
			} );
			expect( getSuggestionsText() ).toEqual( fixtures.specialSuggestions.matchAmpersandEscaped );
		} );

		it( 'should match suggestions even with trailing spaces', function() {
			setText( '  at  ' );
			expect( getSuggestionsText() ).toEqual( fixtures.matchingSuggestions.at );
		} );

		it( 'should manage the selected suggestion based on both keyboard and mouse events', function() {
			setText( 'th' );
			expect( getSuggestionsText() ).toEqual( fixtures.matchingSuggestions.th );
			expect( getSelectedSuggestion() ).toBe( null );
			sendKeyDown( keyCodes.downArrow ); // 'the'
			expect( getSelectedSuggestion() ).toEqual( [ 'th', 'e' ] );
			sendKeyDown( keyCodes.downArrow ); // 'that'
			expect( getSelectedSuggestion() ).toEqual( [ 'th', 'at' ] );

			const hoverSuggestion = wrapper.find( '.components-form-token-field__suggestion' ).at( 3 ); // 'with'
			expect( getSuggestionNodeText( hoverSuggestion ) ).toEqual( [ 'wi', 'th' ] );

			// before sending a hover event, we need to wait for
			// SuggestionList#_scrollingIntoView to become false
			jest.runTimersToTime( 100 );

			hoverSuggestion.simulate( 'mouseEnter' );
			expect( getSelectedSuggestion() ).toEqual( [ 'wi', 'th' ] );
			sendKeyDown( keyCodes.upArrow );
			expect( getSelectedSuggestion() ).toEqual( [ 'th', 'is' ] );
			sendKeyDown( keyCodes.upArrow );
			expect( getSelectedSuggestion() ).toEqual( [ 'th', 'at' ] );
			hoverSuggestion.simulate( 'click' );
			expect( getSelectedSuggestion() ).toBe( null );
			expect( getTokensHTML() ).toEqual( [ 'foo', 'bar', 'with' ] );
		} );
	} );

	describe( 'adding tokens', function() {
		it( 'should not allow adding blank tokens with Tab', function() {
			sendKeyDown( keyCodes.tab );
			expect( wrapper.state( 'tokens' ) ).toEqual( [ 'foo', 'bar' ] );
		} );

		it( 'should not allow adding whitespace tokens with Tab', function() {
			setText( '   ' );
			sendKeyDown( keyCodes.tab );
			expect( wrapper.state( 'tokens' ) ).toEqual( [ 'foo', 'bar' ] );
		} );

		it( 'should add a token when Enter pressed', function() {
			setText( 'baz' );
			sendKeyDown( keyCodes.enter );
			expect( wrapper.state( 'tokens' ) ).toEqual( [ 'foo', 'bar', 'baz' ] );
			expect( textInputNode.prop( 'value' ) ).toBe( '' );
		} );

		it( 'should not allow adding blank tokens with Enter', function() {
			sendKeyDown( keyCodes.enter );
			expect( wrapper.state( 'tokens' ) ).toEqual( [ 'foo', 'bar' ] );
		} );

		it( 'should not allow adding whitespace tokens with Enter', function() {
			setText( '   ' );
			sendKeyDown( keyCodes.enter );
			expect( wrapper.state( 'tokens' ) ).toEqual( [ 'foo', 'bar' ] );
		} );

		it( 'should not allow adding whitespace tokens with comma', function() {
			setText( '   ' );
			sendKeyPress( charCodes.comma );
			expect( wrapper.state( 'tokens' ) ).toEqual( [ 'foo', 'bar' ] );
		} );

		it( 'should add a token when comma pressed', function() {
			setText( 'baz' );
			sendKeyPress( charCodes.comma );
			expect( wrapper.state( 'tokens' ) ).toEqual( [ 'foo', 'bar', 'baz' ] );
		} );

		it( 'should trim token values when adding', function() {
			setText( '  baz  ' );
			sendKeyDown( keyCodes.enter );
			expect( wrapper.state( 'tokens' ) ).toEqual( [ 'foo', 'bar', 'baz' ] );
		} );
	} );

	describe( 'removing tokens', function() {
		it( 'should remove tokens when X icon clicked', function() {
			wrapper.find( '.components-form-token-field__remove-token' ).first().simulate( 'click' );
			expect( wrapper.state( 'tokens' ) ).toEqual( [ 'bar' ] );
		} );
	} );
} );
