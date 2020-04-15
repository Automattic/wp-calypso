/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { render, mount } from 'enzyme';
import { filter, map } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import fixtures from './lib/fixtures';
import TokenFieldWrapper from './lib/token-field-wrapper';

/**
 * Module constants
 */
const jestExpect = global.expect;
jest.mock( 'components/tooltip', () => require( 'components/empty-component' ) );

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
	let wrapper, tokenFieldNode, textInputNode;

	function setText( text ) {
		textInputNode.simulate( 'change', { target: { value: text } } );
	}

	function sendKeyDown( keyCode, shiftKey ) {
		tokenFieldNode.simulate( 'keyDown', {
			keyCode: keyCode,
			shiftKey: !! shiftKey,
		} );
	}

	function sendKeyPress( charCode ) {
		tokenFieldNode.simulate( 'keyPress', {
			charCode: charCode,
		} );
	}

	function getNodeInnerHtml( node ) {
		const div = document.createElement( 'div' );
		div.innerHTML = node.html();
		return div.firstChild.innerHTML;
	}

	function getTokensHTML() {
		const textNodes = wrapper.find( '.token-field__token-text' );

		return textNodes.map( getNodeInnerHtml );
	}

	function getSuggestionsText( selector ) {
		const suggestionNodes = wrapper.find( selector || '.token-field__suggestion' );

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
		const selectedSuggestions = getSuggestionsText( '.token-field__suggestion.is-selected' );

		return selectedSuggestions[ 0 ] || null;
	}

	beforeEach( () => {
		wrapper = mount( <TokenFieldWrapper /> );
		tokenFieldNode = wrapper.find( '.token-field' );
		textInputNode = wrapper.find( '.token-field__input' );
		textInputNode.simulate( 'focus' );
	} );

	describe( 'render', () => {
		test( 'should render tokens', () => {
			const tree = render( <TokenFieldWrapper /> );
			jestExpect( tree ).toMatchSnapshot();
		} );
	} );

	describe( 'displaying tokens', () => {
		test( 'should render default tokens', () => {
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar' ] );
		} );

		test( 'should display tokens with escaped special characters properly', () => {
			wrapper.instance().setState( {
				tokens: fixtures.specialTokens.textEscaped,
			} );
			wrapper.update();
			expect( getTokensHTML() ).to.deep.equal( fixtures.specialTokens.htmlEscaped );
		} );

		test( 'should display tokens with special characters properly', () => {
			// This test is not as realistic as the previous one: if a WP site
			// contains tag names with special characters, the API will always
			// return the tag names already escaped.  However, this is still
			// worth testing, so we can be sure that token values with
			// dangerous characters in them don't have these characters carried
			// through unescaped to the HTML.
			wrapper.setState( {
				tokens: fixtures.specialTokens.textUnescaped,
			} );
			expect( getTokensHTML() ).to.deep.equal( fixtures.specialTokens.htmlUnescaped );
		} );
	} );

	describe( 'suggestions', () => {
		test( 'should render default suggestions', () => {
			// limited by maxSuggestions (default 100 so doesn't matter here)
			expect( getSuggestionsText() ).to.deep.equal( wrapper.state( 'tokenSuggestions' ) );
		} );

		test( 'should remove already added tags from suggestions', () => {
			wrapper.setState( {
				tokens: Object.freeze( [ 'of', 'and' ] ),
			} );
			expect( getSuggestionsText() ).to.not.include.members( getTokensHTML() );
		} );

		test( 'should suggest partial matches', () => {
			setText( 't' );
			expect( getSuggestionsText() ).to.deep.equal( fixtures.matchingSuggestions.t );
		} );

		test( 'suggestions that begin with match are boosted', () => {
			setText( 's' );
			expect( getSuggestionsText() ).to.deep.equal( fixtures.matchingSuggestions.s );
		} );

		test( 'should display suggestions with escaped special characters properly', () => {
			wrapper.setState( {
				tokenSuggestions: fixtures.specialSuggestions.textEscaped,
			} );
			expect( getSuggestionsText() ).to.deep.equal( fixtures.specialSuggestions.htmlEscaped );
		} );

		test( 'should display suggestions with special characters properly', () => {
			wrapper.setState( {
				tokenSuggestions: fixtures.specialSuggestions.textUnescaped,
			} );
			expect( getSuggestionsText() ).to.deep.equal( fixtures.specialSuggestions.htmlUnescaped );
		} );

		test( 'should match against the unescaped values of suggestions with special characters', () => {
			setText( '&' );
			wrapper.setState( {
				tokenSuggestions: fixtures.specialSuggestions.textUnescaped,
			} );
			expect( getSuggestionsText() ).to.deep.equal(
				fixtures.specialSuggestions.matchAmpersandUnescaped
			);
		} );

		test( 'should match against the unescaped values of suggestions with special characters (including spaces)', () => {
			setText( 's &' );
			wrapper.setState( {
				tokenSuggestions: fixtures.specialSuggestions.textUnescaped,
			} );
			expect( getSuggestionsText() ).to.deep.equal(
				fixtures.specialSuggestions.matchAmpersandSequence
			);
		} );

		test( 'should not match against the escaped values of suggestions with special characters', () => {
			setText( 'amp' );
			wrapper.setState( {
				tokenSuggestions: fixtures.specialSuggestions.textUnescaped,
			} );
			expect( getSuggestionsText() ).to.deep.equal(
				fixtures.specialSuggestions.matchAmpersandEscaped
			);
		} );

		test( 'should match suggestions even with trailing spaces', () => {
			setText( '  at  ' );
			expect( getSuggestionsText() ).to.deep.equal( fixtures.matchingSuggestions.at );
		} );

		test( 'should manage the selected suggestion based on both keyboard and mouse events', () => {
			jest.useFakeTimers();
			setText( 't' );
			expect( getSuggestionsText() ).to.deep.equal( fixtures.matchingSuggestions.t );
			expect( getSelectedSuggestion() ).to.equal( null );
			sendKeyDown( keyCodes.downArrow ); // 'the'
			expect( getSelectedSuggestion() ).to.deep.equal( [ 't', 'he' ] );
			sendKeyDown( keyCodes.downArrow ); // 'to'
			expect( getSelectedSuggestion() ).to.deep.equal( [ 't', 'o' ] );

			const hoverSuggestion = wrapper.find( '.token-field__suggestion' ).at( 5 ); // 'it'
			expect( getSuggestionNodeText( hoverSuggestion ) ).to.deep.equal( [ 'i', 't' ] );

			// before sending a hover event, we need to wait for
			// SuggestionList#_scrollingIntoView to become false
			jest.runAllTimers();

			hoverSuggestion.simulate( 'mouseEnter' );
			expect( getSelectedSuggestion() ).to.deep.equal( [ 'i', 't' ] );
			sendKeyDown( keyCodes.upArrow );
			expect( getSelectedSuggestion() ).to.deep.equal( [ 'wi', 't', 'h' ] );
			sendKeyDown( keyCodes.upArrow );
			expect( getSelectedSuggestion() ).to.deep.equal( [ 't', 'his' ] );
			hoverSuggestion.simulate( 'click' );
			expect( getSelectedSuggestion() ).to.equal( null );
			expect( getTokensHTML() ).to.deep.equal( [ 'foo', 'bar', 'it' ] );
		} );
	} );

	describe( 'adding tokens', () => {
		test( 'should add a token when Tab pressed', () => {
			setText( 'baz' );
			sendKeyDown( keyCodes.tab );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'baz' ] );
			expect( textInputNode.instance().value ).to.equal( '' );
		} );

		test( 'should not allow adding blank tokens with Tab', () => {
			sendKeyDown( keyCodes.tab );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar' ] );
		} );

		test( 'should not allow adding whitespace tokens with Tab', () => {
			setText( '   ' );
			sendKeyDown( keyCodes.tab );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar' ] );
		} );

		test( 'should add a token when Enter pressed', () => {
			setText( 'baz' );
			sendKeyDown( keyCodes.enter );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'baz' ] );
			expect( textInputNode.instance().value ).to.equal( '' );
		} );

		test( 'should not allow adding blank tokens with Enter', () => {
			sendKeyDown( keyCodes.enter );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar' ] );
		} );

		test( 'should not allow adding whitespace tokens with Enter', () => {
			setText( '   ' );
			sendKeyDown( keyCodes.enter );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar' ] );
		} );

		test( 'should not allow adding whitespace tokens with comma', () => {
			setText( '   ' );
			sendKeyPress( charCodes.comma );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar' ] );
		} );

		test( 'should add a token when comma pressed', () => {
			setText( 'baz' );
			sendKeyPress( charCodes.comma );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'baz' ] );
		} );

		test( 'should not add a token when < pressed', () => {
			setText( 'baz' );
			sendKeyDown( keyCodes.comma, true );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar' ] );
			// The text input does not register the < keypress when it is sent this way.
			expect( textInputNode.instance().value ).to.equal( 'baz' );
		} );

		test( 'should trim token values when adding', () => {
			setText( '  baz  ' );
			sendKeyDown( keyCodes.enter );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'baz' ] );
		} );

		function testOnBlur( initialText, selectSuggestion, expectedSuggestion, expectedTokens ) {
			setText( initialText );
			if ( selectSuggestion ) {
				sendKeyDown( keyCodes.downArrow ); // 'the'
				sendKeyDown( keyCodes.downArrow ); // 'to'
			}
			expect( getSelectedSuggestion() ).to.deep.equal( expectedSuggestion );

			function testSavedState( isActive ) {
				expect( wrapper.state( 'tokens' ) ).to.deep.equal( expectedTokens );
				expect( textInputNode.instance().value ).to.equal( '' );
				expect( getSelectedSuggestion() ).to.equal( null );
				expect( wrapper.find( '.is-active' ).length === 1 ).to.equal( isActive );
			}

			document.activeElement.blur();
			textInputNode.simulate( 'blur' );
			testSavedState( false );
			textInputNode.simulate( 'focus' );
			testSavedState( true );
		}

		test( 'should add the current text when the input field loses focus', () => {
			testOnBlur(
				't', // initialText
				false, // selectSuggestion
				null, // expectedSuggestion
				[ 'foo', 'bar', 't' ] // expectedTokens
			);
		} );

		test( 'should add the suggested token when the (non-blank) input field loses focus', () => {
			testOnBlur(
				't', // initialText
				true, // selectSuggestion
				[ 't', 'o' ], // expectedSuggestion
				[ 'foo', 'bar', 'to' ] // expectedTokens
			);
		} );

		test( 'should not add the suggested token when the (blank) input field loses focus', () => {
			testOnBlur(
				'', // initialText
				true, // selectSuggestion
				'of', // expectedSuggestion
				[ 'foo', 'bar' ] // expectedTokens
			);
		} );

		test( 'should not lose focus when a suggestion is clicked', () => {
			// prevents regression of https://github.com/Automattic/wp-calypso/issues/1884

			const firstSuggestion = tokenFieldNode.find( '.token-field__suggestion' ).at( 0 );
			firstSuggestion.simulate( 'click' );

			// wait for setState call
			jest.runTimersToTime( 10 );
			expect( wrapper.find( '.is-active' ).length ).to.equal( 1 );
		} );

		test( 'should add tokens in the middle of the current tokens', () => {
			sendKeyDown( keyCodes.leftArrow );
			setText( 'baz' );
			sendKeyDown( keyCodes.tab );
			setText( 'quux' );
			sendKeyDown( keyCodes.tab );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'baz', 'quux', 'bar' ] );
		} );

		test( 'should add tokens from the selected matching suggestion using Tab', () => {
			setText( 't' );
			expect( getSelectedSuggestion() ).to.equal( null );
			sendKeyDown( keyCodes.downArrow ); // 'the'
			expect( getSelectedSuggestion() ).to.deep.equal( [ 't', 'he' ] );
			sendKeyDown( keyCodes.downArrow ); // 'to'
			expect( getSelectedSuggestion() ).to.deep.equal( [ 't', 'o' ] );
			sendKeyDown( keyCodes.tab );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'to' ] );
			expect( getSelectedSuggestion() ).to.equal( null );
		} );

		test( 'should add tokens from the selected matching suggestion using Enter', () => {
			setText( 't' );
			expect( getSelectedSuggestion() ).to.equal( null );
			sendKeyDown( keyCodes.downArrow ); // 'the'
			expect( getSelectedSuggestion() ).to.deep.equal( [ 't', 'he' ] );
			sendKeyDown( keyCodes.downArrow ); // 'to'
			expect( getSelectedSuggestion() ).to.deep.equal( [ 't', 'o' ] );
			sendKeyDown( keyCodes.enter );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'to' ] );
			expect( getSelectedSuggestion() ).to.equal( null );
		} );

		test( 'should add tokens from the selected suggestion using Tab', () => {
			expect( getSelectedSuggestion() ).to.equal( null );
			sendKeyDown( keyCodes.downArrow ); // 'the'
			expect( getSelectedSuggestion() ).to.equal( 'the' );
			sendKeyDown( keyCodes.downArrow ); // 'of'
			expect( getSelectedSuggestion() ).to.equal( 'of' );
			sendKeyDown( keyCodes.tab );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'of' ] );
			expect( getSelectedSuggestion() ).to.equal( null );
		} );

		test( 'should add tokens from the selected suggestion using Enter', () => {
			expect( getSelectedSuggestion() ).to.equal( null );
			sendKeyDown( keyCodes.downArrow ); // 'the'
			expect( getSelectedSuggestion() ).to.equal( 'the' );
			sendKeyDown( keyCodes.downArrow ); // 'of'
			expect( getSelectedSuggestion() ).to.equal( 'of' );
			sendKeyDown( keyCodes.enter );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'of' ] );
			expect( getSelectedSuggestion() ).to.equal( null );
		} );
	} );

	describe( 'adding multiple tokens when pasting', () => {
		test( 'should add multiple comma-separated tokens when pasting', () => {
			setText( 'baz, quux, wut' );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'baz', 'quux' ] );
			expect( textInputNode.instance().value ).to.equal( ' wut' );
			setText( 'wut,' );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'baz', 'quux', 'wut' ] );
			expect( textInputNode.instance().value ).to.equal( '' );
		} );

		test( 'should add multiple tab-separated tokens when pasting', () => {
			setText( 'baz\tquux\twut' );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'baz', 'quux' ] );
			expect( textInputNode.instance().value ).to.equal( 'wut' );
		} );

		test( 'should not duplicate tokens when pasting', () => {
			setText( 'baz \tbaz,  quux \tquux,quux , wut  \twut, wut' );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'baz', 'quux', 'wut' ] );
			expect( textInputNode.instance().value ).to.equal( ' wut' );
		} );

		test( 'should skip empty tokens at the beginning of a paste', () => {
			setText( ',  ,\t \t  ,,baz, quux' );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'baz' ] );
			expect( textInputNode.instance().value ).to.equal( ' quux' );
		} );

		test( 'should skip empty tokens at the beginning of a paste', () => {
			setText( ',  ,\t \t  ,,baz, quux' );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'baz' ] );
			expect( textInputNode.instance().value ).to.equal( ' quux' );
		} );

		test( 'should skip empty tokens in the middle of a paste', () => {
			setText( 'baz,  ,\t \t  ,,quux' );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'baz' ] );
			expect( textInputNode.instance().value ).to.equal( 'quux' );
		} );

		test( 'should skip empty tokens at the end of a paste', () => {
			setText( 'baz, quux,  ,\t \t  ,,   ' );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'baz', 'quux' ] );
			expect( textInputNode.instance().value ).to.equal( '   ' );
		} );
	} );

	describe( 'removing tokens', () => {
		test( 'should remove tokens when X icon clicked', () => {
			tokenFieldNode.find( '.token-field__remove-token' ).first().simulate( 'click' );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'bar' ] );
		} );

		test( 'should remove the token to the left when backspace pressed', () => {
			sendKeyDown( keyCodes.backspace );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo' ] );
		} );

		test( 'should remove the token to the right when delete pressed', () => {
			sendKeyDown( keyCodes.leftArrow );
			sendKeyDown( keyCodes.leftArrow );
			sendKeyDown( keyCodes.delete );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'bar' ] );
		} );
	} );
} );
