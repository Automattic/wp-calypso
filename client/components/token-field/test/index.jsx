/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { filter, map } from 'lodash';
import { test } from 'sinon';

/**
 * Internal dependencies
 */
import EmptyComponent from 'test/helpers/react/empty-component';
import fixtures from './lib/fixtures';
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

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
	'delete': 46,
	comma: 188
};

const charCodes = {
	comma: 44
};

describe( 'TokenField', function() {
	let wrapper, tokenFieldNode, textInputNode, TokenFieldWrapper, mount;

	function setText( text ) {
		textInputNode.simulate( 'change', { target: { value: text } } );
	}

	function sendKeyDown( keyCode, shiftKey ) {
		tokenFieldNode.simulate( 'keyDown', {
			keyCode: keyCode,
			shiftKey: ! ! shiftKey
		} );
	}

	function sendKeyPress( charCode ) {
		tokenFieldNode.simulate( 'keyPress', {
			charCode: charCode
		} );
	}

	function getNodeInnerHtml( node ) {
		const div = document.createElement( 'div' );
		div.innerHTML = node.html();
		return div.firstChild.innerHTML;
	}

	function getTokensHTML() {
		const textNodes = tokenFieldNode.find( '.token-field__token-text' );

		return textNodes.map( getNodeInnerHtml );
	}

	function getSuggestionsText( selector ) {
		const suggestionNodes = tokenFieldNode.find( selector || '.token-field__suggestion' );

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
				childNode => childNode.nodeType !== window.Node.COMMENT_NODE
			),
			childNode => childNode.textContent
		);
	}

	function getSelectedSuggestion() {
		const selectedSuggestions = getSuggestionsText( '.token-field__suggestion.is-selected' );

		return selectedSuggestions[ 0 ] || null;
	}

	useFakeDom();

	useMockery( mockery => {
		mount = require( 'enzyme' ).mount;
		mockery.registerMock( 'components/tooltip', EmptyComponent );
		TokenFieldWrapper = require( './lib/token-field-wrapper' );
	} );

	beforeEach( function() {
		wrapper = mount( <TokenFieldWrapper /> );
		tokenFieldNode = wrapper.ref( 'tokenField' );
		textInputNode = tokenFieldNode.find( '.token-field__input' );
		textInputNode.simulate( 'focus' );
	} );

	describe( 'displaying tokens', function() {
		it( 'should render default tokens', function() {
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar' ] );
		} );

		it( 'should display tokens with escaped special characters properly', function() {
			wrapper.setState( {
				tokens: fixtures.specialTokens.textEscaped
			} );
			expect( getTokensHTML() ).to.deep.equal( fixtures.specialTokens.htmlEscaped );
		} );

		it( 'should display tokens with special characters properly', function() {
			// This test is not as realistic as the previous one: if a WP site
			// contains tag names with special characters, the API will always
			// return the tag names already escaped.  However, this is still
			// worth testing, so we can be sure that token values with
			// dangerous characters in them don't have these characters carried
			// through unescaped to the HTML.
			wrapper.setState( {
				tokens: fixtures.specialTokens.textUnescaped
			} );
			expect( getTokensHTML() ).to.deep.equal( fixtures.specialTokens.htmlUnescaped );
		} );
	} );

	describe( 'suggestions', function() {
		it( 'should render default suggestions', function() {
			// limited by maxSuggestions (default 100 so doesn't matter here)
			expect( getSuggestionsText() ).to.deep.equal( wrapper.state( 'tokenSuggestions' ) );
		} );

		it( 'should remove already added tags from suggestions', function() {
			wrapper.setState( {
				tokens: Object.freeze( [ 'of', 'and' ] )
			} );
			expect( getSuggestionsText() ).to.not.include.members( getTokensHTML() );
		} );

		it( 'should suggest partial matches', function() {
			setText( 't' );
			expect( getSuggestionsText() ).to.deep.equal( fixtures.matchingSuggestions.t );
		} );

		it( 'suggestions that begin with match are boosted', function() {
			setText( 's' );
			expect( getSuggestionsText() ).to.deep.equal( fixtures.matchingSuggestions.s );
		} );

		it( 'should display suggestions with escaped special characters properly', function() {
			wrapper.setState( {
				tokenSuggestions: fixtures.specialSuggestions.textEscaped
			} );
			expect( getSuggestionsText() ).to.deep.equal( fixtures.specialSuggestions.htmlEscaped );
		} );

		it( 'should display suggestions with special characters properly', function() {
			wrapper.setState( {
				tokenSuggestions: fixtures.specialSuggestions.textUnescaped
			} );
			expect( getSuggestionsText() ).to.deep.equal( fixtures.specialSuggestions.htmlUnescaped );
		} );

		it( 'should match against the unescaped values of suggestions with special characters', function() {
			setText( '&' );
			wrapper.setState( {
				tokenSuggestions: fixtures.specialSuggestions.textUnescaped
			} );
			expect( getSuggestionsText() ).to.deep.equal( fixtures.specialSuggestions.matchAmpersandUnescaped );
		} );

		it( 'should match against the unescaped values of suggestions with special characters (including spaces)', function() {
			setText( 's &' );
			wrapper.setState( {
				tokenSuggestions: fixtures.specialSuggestions.textUnescaped
			} );
			expect( getSuggestionsText() ).to.deep.equal( fixtures.specialSuggestions.matchAmpersandSequence );
		} );

		it( 'should not match against the escaped values of suggestions with special characters', function() {
			setText( 'amp' );
			wrapper.setState( {
				tokenSuggestions: fixtures.specialSuggestions.textUnescaped
			} );
			expect( getSuggestionsText() ).to.deep.equal( fixtures.specialSuggestions.matchAmpersandEscaped );
		} );

		it( 'should match suggestions even with trailing spaces', function() {
			setText( '  at  ' );
			expect( getSuggestionsText() ).to.deep.equal( fixtures.matchingSuggestions.at );
		} );

		it( 'should manage the selected suggestion based on both keyboard and mouse events', test( function() {
			setText( 't' );
			expect( getSuggestionsText() ).to.deep.equal( fixtures.matchingSuggestions.t );
			expect( getSelectedSuggestion() ).to.equal( null );
			sendKeyDown( keyCodes.downArrow ); // 'the'
			expect( getSelectedSuggestion() ).to.deep.equal( [ 't', 'he' ] );
			sendKeyDown( keyCodes.downArrow ); // 'to'
			expect( getSelectedSuggestion() ).to.deep.equal( [ 't', 'o' ] );

			const hoverSuggestion = tokenFieldNode.find( '.token-field__suggestion' ).at( 5 ); // 'it'
			expect( getSuggestionNodeText( hoverSuggestion ) ).to.deep.equal( [ 'i', 't' ] );

			// before sending a hover event, we need to wait for
			// SuggestionList#_scrollingIntoView to become false
			this.clock.tick( 100 );

			hoverSuggestion.simulate( 'mouseEnter' );
			expect( getSelectedSuggestion() ).to.deep.equal( [ 'i', 't' ] );
			sendKeyDown( keyCodes.upArrow );
			expect( getSelectedSuggestion() ).to.deep.equal( [ 'wi', 't', 'h' ] );
			sendKeyDown( keyCodes.upArrow );
			expect( getSelectedSuggestion() ).to.deep.equal( [ 't', 'his' ] );
			hoverSuggestion.simulate( 'click' );
			expect( getSelectedSuggestion() ).to.equal( null );
			expect( getTokensHTML() ).to.deep.equal( [ 'foo', 'bar', 'it' ] );
		} ) );
	} );

	describe( 'adding tokens', function() {
		it( 'should add a token when Tab pressed', function() {
			setText( 'baz' );
			sendKeyDown( keyCodes.tab );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'baz' ] );
			expect( textInputNode.prop( 'value' ) ).to.equal( '' );
		} );

		it( 'should not allow adding blank tokens with Tab', function() {
			sendKeyDown( keyCodes.tab );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar' ] );
		} );

		it( 'should not allow adding whitespace tokens with Tab', function() {
			setText( '   ' );
			sendKeyDown( keyCodes.tab );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar' ] );
		} );

		it( 'should add a token when Enter pressed', function() {
			setText( 'baz' );
			sendKeyDown( keyCodes.enter );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'baz' ] );
			expect( textInputNode.prop( 'value' ) ).to.equal( '' );
		} );

		it( 'should not allow adding blank tokens with Enter', function() {
			sendKeyDown( keyCodes.enter );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar' ] );
		} );

		it( 'should not allow adding whitespace tokens with Enter', function() {
			setText( '   ' );
			sendKeyDown( keyCodes.enter );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar' ] );
		} );

		it( 'should not allow adding whitespace tokens with comma', function() {
			setText( '   ' );
			sendKeyPress( charCodes.comma );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar' ] );
		} );

		it( 'should add a token when comma pressed', function() {
			setText( 'baz' );
			sendKeyPress( charCodes.comma );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'baz' ] );
		} );

		it( 'should not add a token when < pressed', function() {
			setText( 'baz' );
			sendKeyDown( keyCodes.comma, true );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar' ] );
			// The text input does not register the < keypress when it is sent this way.
			expect( textInputNode.prop( 'value' ) ).to.equal( 'baz' );
		} );

		it( 'should trim token values when adding', function() {
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
				expect( textInputNode.prop( 'value' ) ).to.equal( '' );
				expect( getSelectedSuggestion() ).to.equal( null );
				expect( tokenFieldNode.find( 'div' ).first().hasClass( 'is-active' ) ).to.equal( isActive );
			}

			document.activeElement.blur();
			textInputNode.simulate( 'blur' );
			testSavedState( false );
			textInputNode.simulate( 'focus' );
			testSavedState( true );
		}

		it( 'should add the current text when the input field loses focus', test( function() {
			testOnBlur(
				't',                   // initialText
				false,                 // selectSuggestion
				null,                  // expectedSuggestion
				[ 'foo', 'bar', 't' ] // expectedTokens
			);
		} ) );

		it( 'should add the suggested token when the (non-blank) input field loses focus', test( function() {
			testOnBlur(
				't',                    // initialText
				true,                   // selectSuggestion
				[ 't', 'o' ],       // expectedSuggestion
				[ 'foo', 'bar', 'to' ] // expectedTokens
			);
		} ) );

		it( 'should not add the suggested token when the (blank) input field loses focus', test( function() {
			testOnBlur(
				'',               // initialText
				true,             // selectSuggestion
				'of',             // expectedSuggestion
				[ 'foo', 'bar' ], // expectedTokens
				this.clock
			);
		} ) );

		it( 'should not lose focus when a suggestion is clicked', test( function() {
			// prevents regression of https://github.com/Automattic/wp-calypso/issues/1884

			const firstSuggestion = tokenFieldNode.find( '.token-field__suggestion' ).at( 0 );
			firstSuggestion.simulate( 'click' );

			// wait for setState call
			this.clock.tick( 10 );

			expect( tokenFieldNode.find( 'div' ).first().hasClass( 'is-active' ) ).to.equal( true );
		} ) );

		it( 'should add tokens in the middle of the current tokens', function() {
			sendKeyDown( keyCodes.leftArrow );
			setText( 'baz' );
			sendKeyDown( keyCodes.tab );
			setText( 'quux' );
			sendKeyDown( keyCodes.tab );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'baz', 'quux', 'bar' ] );
		} );

		it( 'should add tokens from the selected matching suggestion using Tab', function() {
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

		it( 'should add tokens from the selected matching suggestion using Enter', function() {
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

		it( 'should add tokens from the selected suggestion using Tab', function() {
			expect( getSelectedSuggestion() ).to.equal( null );
			sendKeyDown( keyCodes.downArrow ); // 'the'
			expect( getSelectedSuggestion() ).to.equal( 'the' );
			sendKeyDown( keyCodes.downArrow ); // 'of'
			expect( getSelectedSuggestion() ).to.equal( 'of' );
			sendKeyDown( keyCodes.tab );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'of' ] );
			expect( getSelectedSuggestion() ).to.equal( null );
		} );

		it( 'should add tokens from the selected suggestion using Enter', function() {
			expect( getSelectedSuggestion() ).to.equal( null );
			sendKeyDown( keyCodes.downArrow ); // 'the'
			expect( getSelectedSuggestion() ).to.equal( 'the' );
			sendKeyDown( keyCodes.downArrow ); // 'of'
			expect( getSelectedSuggestion() ).to.equal( 'of' );
			sendKeyDown( keyCodes.enter );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'of' ] );
			expect( getSelectedSuggestion() ).to.equal( null );
		} );

		it( 'should add multiple comma-separated tokens when pasting', function() {
			setText( 'baz, quux, wut' );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'baz', 'quux' ] );
			expect( textInputNode.prop( 'value' ) ).to.equal( ' wut' );
			setText( 'wut,' );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'baz', 'quux', 'wut' ] );
			expect( textInputNode.prop( 'value' ) ).to.equal( '' );
		} );

		it( 'should add multiple newline-separated tokens when pasting', function() {
			setText( 'baz\nquux\nwut' );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'baz', 'quux' ] );
			expect( textInputNode.prop( 'value' ) ).to.equal( 'wut' );
		} );

		it( 'should add multiple tab-separated tokens when pasting', function() {
			setText( 'baz\tquux\twut' );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo', 'bar', 'baz', 'quux' ] );
			expect( textInputNode.prop( 'value' ) ).to.equal( 'wut' );
		} );
	} );

	describe( 'removing tokens', function() {
		it( 'should remove tokens when X icon clicked', function() {
			tokenFieldNode.find( '.token-field__remove-token' ).first().simulate( 'click' );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'bar' ] );
		} );

		it( 'should remove the token to the left when backspace pressed', function() {
			sendKeyDown( keyCodes.backspace );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'foo' ] );
		} );

		it( 'should remove the token to the right when delete pressed', function() {
			sendKeyDown( keyCodes.leftArrow );
			sendKeyDown( keyCodes.leftArrow );
			sendKeyDown( keyCodes.delete );
			expect( wrapper.state( 'tokens' ) ).to.deep.equal( [ 'bar' ] );
		} );
	} );
} );
