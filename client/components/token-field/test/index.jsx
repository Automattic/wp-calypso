require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
var expect = require( 'chai' ).expect,
	ReactDom = require( 'react-dom' ),
	React = require( 'react/addons' ),
	TestUtils = React.addons.TestUtils;

/**
 * Internal dependencies
 */
var TokenFieldWrapper = require( './token-field-wrapper' ),
	fixtures = require( './fixtures' );

/**
 * Module variables
 */
var keyCodes = {
	backspace: 8,
	tab: 9,
	enter: 13,
	leftArrow: 37,
	upArrow: 38,
	rightArrow: 39,
	downArrow: 40,
	delete: 46,
	comma: 188
};

describe( 'TokenField', function() {
	var wrapper, tokenFieldNode, textInputNode;

	function setText( text ) {
		TestUtils.Simulate.change( textInputNode, { target: { value: text } } );
	}

	function sendKey( keyCode, shiftKey ) {
		TestUtils.Simulate.keyDown( textInputNode, {
			keyCode: keyCode,
			shiftKey: !! shiftKey
		} );
	}

	function getTokensHTML() {
		var textNodes = tokenFieldNode.querySelectorAll( '.token-field__token-text' );
		return Array.prototype.slice.call( textNodes ).map( function( el ) {
			return el.innerHTML;
		} );
	}

	function getSuggestionsHTML( selector ) {
		var suggestionNodes = tokenFieldNode.querySelectorAll( selector || '.token-field__suggestion' );
		return Array.prototype.slice.call( suggestionNodes ).map( getSuggestionNodeHTML );
	}

	function getSuggestionNodeHTML( node ) {
		var suggestionContent = node.childNodes[0];
		if ( suggestionContent.nodeName === '#text' ) {
			// This suggestion is not part of a partial match; just return
			// the whole suggestion
			return node.innerHTML;
		} else {
			// This suggestion is part of a partial match; return the three
			// sections of the suggestion (before match, match, and after
			// match)
			return Array.prototype.slice.call( suggestionContent.childNodes ).map( function( child ) {
				return child.innerHTML;
			} );
		}
	}

	function getSelectedSuggestion() {
		var selectedSuggestions = getSuggestionsHTML( '.token-field__suggestion.is-selected' );
		return selectedSuggestions[0] || null;
	}

	beforeEach( function() {
		wrapper = ReactDom.render( <TokenFieldWrapper />, document.body );
		tokenFieldNode = ReactDom.findDOMNode( wrapper.refs.tokenField );
		textInputNode = tokenFieldNode.querySelector( '.token-field__input' );
		TestUtils.Simulate.focus( textInputNode );
	} );

	afterEach( function() {
		ReactDom.unmountComponentAtNode( document.body );
	} );

	describe( 'displaying tokens', function() {

		it( 'should render default tokens', function() {
			expect( wrapper.state.tokens ).to.deep.equal( [ 'foo', 'bar' ] );
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
			expect( getSuggestionsHTML() ).to.deep.equal( wrapper.state.tokenSuggestions );
		} );

		it( 'should suggest partial matches', function() {
			setText( 't' );
			expect( getSuggestionsHTML() ).to.deep.equal( fixtures.matchingSuggestions.t );
		} );

		it( 'suggestions that begin with match are boosted', function() {
			setText( 's' );
			expect( getSuggestionsHTML() ).to.deep.equal( fixtures.matchingSuggestions.s );
		} );

		it( 'should display suggestions with escaped special characters properly', function() {
			wrapper.setState( {
				tokenSuggestions: fixtures.specialSuggestions.textEscaped
			} );
			expect( getSuggestionsHTML() ).to.deep.equal( fixtures.specialSuggestions.htmlEscaped );
		} );

		it( 'should display suggestions with special characters properly', function() {
			wrapper.setState( {
				tokenSuggestions: fixtures.specialSuggestions.textUnescaped
			} );
			expect( getSuggestionsHTML() ).to.deep.equal( fixtures.specialSuggestions.htmlUnescaped );
		} );

		it( 'should match against the unescaped values of suggestions with special characters', function() {
			setText( '&' );
			wrapper.setState( {
				tokenSuggestions: fixtures.specialSuggestions.textUnescaped
			} );
			expect( getSuggestionsHTML() ).to.deep.equal( fixtures.specialSuggestions.matchAmpersandUnescaped );
		} );

		it( 'should match against the unescaped values of suggestions with special characters (including spaces)', function() {
			setText( 's &' );
			wrapper.setState( {
				tokenSuggestions: fixtures.specialSuggestions.textUnescaped
			} );
			expect( getSuggestionsHTML() ).to.deep.equal( fixtures.specialSuggestions.matchAmpersandSequence );
		} );

		it( 'should not match against the escaped values of suggestions with special characters', function() {
			setText( 'amp' );
			wrapper.setState( {
				tokenSuggestions: fixtures.specialSuggestions.textUnescaped
			} );
			expect( getSuggestionsHTML() ).to.deep.equal( fixtures.specialSuggestions.matchAmpersandEscaped );
		} );

		it( 'should manage the selected suggestion based on both keyboard and mouse events', function( done ) {
			var hoverSuggestion;
			setText( 't' );
			expect( getSuggestionsHTML() ).to.deep.equal( fixtures.matchingSuggestions.t );
			expect( getSelectedSuggestion() ).to.equal( null );
			sendKey( keyCodes.downArrow ); // 'the'
			expect( getSelectedSuggestion() ).to.deep.equal( [ '', 't', 'he' ] );
			sendKey( keyCodes.downArrow ); // 'to'
			expect( getSelectedSuggestion() ).to.deep.equal( [ '', 't', 'o' ] );
			hoverSuggestion = tokenFieldNode.querySelectorAll( '.token-field__suggestion' )[5]; // 'it'
			expect( getSuggestionNodeHTML( hoverSuggestion ) ).to.deep.equal( [ 'i', 't', '' ] );
			// before sending a hover event, we need to wait for
			// SuggestionList#_scrollingIntoView to become false
			setTimeout( function() {
				// TestUtils.Simulate.mouseEnter does not work - more details
				// at https://github.com/facebook/react/issues/1297
				TestUtils.SimulateNative.mouseOut( textInputNode, { relatedTarget: hoverSuggestion } );
				// this would happen in a real browser but doesn't seem to be needed here
				// TestUtils.SimulateNative.mouseOver( hoverSuggestion, { relatedTarget: textInputNode } );
				expect( getSelectedSuggestion() ).to.deep.equal( [ 'i', 't', '' ] );
				sendKey( keyCodes.upArrow );
				expect( getSelectedSuggestion() ).to.deep.equal( [ 'wi', 't', 'h' ] );
				sendKey( keyCodes.upArrow );
				expect( getSelectedSuggestion() ).to.deep.equal( [ '', 't', 'his' ] );
				TestUtils.Simulate.click( hoverSuggestion );
				expect( getSelectedSuggestion() ).to.equal( null );
				expect( getTokensHTML() ).to.deep.equal( [ 'foo', 'bar', 'it' ] );
				done();
			}, 110 );
		} );

	} );

	describe( 'adding tokens', function() {

		it( 'should add a token when Tab pressed', function() {
			setText( 'baz' );
			sendKey( keyCodes.tab );
			expect( wrapper.state.tokens ).to.deep.equal( [ 'foo', 'bar', 'baz' ] );
			expect( textInputNode.value ).to.equal( '' );
		} );

		it( 'should not allow adding blank tokens with Tab', function() {
			sendKey( keyCodes.tab );
			expect( wrapper.state.tokens ).to.deep.equal( [ 'foo', 'bar' ] );
		} );

		it( 'should not allow adding whitespace tokens with Tab', function() {
			setText( '   ' );
			sendKey( keyCodes.tab );
			expect( wrapper.state.tokens ).to.deep.equal( [ 'foo', 'bar' ] );
		} );

		it( 'should add a token when Enter pressed', function() {
			setText( 'baz' );
			sendKey( keyCodes.enter );
			expect( wrapper.state.tokens ).to.deep.equal( [ 'foo', 'bar', 'baz' ] );
			expect( textInputNode.value ).to.equal( '' );
		} );

		it( 'should not allow adding blank tokens with Enter', function() {
			sendKey( keyCodes.enter );
			expect( wrapper.state.tokens ).to.deep.equal( [ 'foo', 'bar' ] );
		} );

		it( 'should not allow adding whitespace tokens with Enter', function() {
			setText( '   ' );
			sendKey( keyCodes.enter );
			expect( wrapper.state.tokens ).to.deep.equal( [ 'foo', 'bar' ] );
		} );

		it( 'should add a token when comma pressed', function() {
			setText( 'baz' );
			sendKey( keyCodes.comma );
			expect( wrapper.state.tokens ).to.deep.equal( [ 'foo', 'bar', 'baz' ] );
		} );

		it( 'should not add a token when < pressed', function() {
			setText( 'baz' );
			sendKey( keyCodes.comma, true );
			expect( wrapper.state.tokens ).to.deep.equal( [ 'foo', 'bar' ] );
			// The text input does not register the < keypress when it is sent this way.
			expect( textInputNode.value ).to.equal( 'baz' );
		} );

		function testOnBlur( initialText, selectSuggestion, expectedSuggestion, expectedTokens, done ) {
			setText( initialText );
			if ( selectSuggestion ) {
				sendKey( keyCodes.downArrow ); // 'the'
				sendKey( keyCodes.downArrow ); // 'to'
			}
			expect( getSelectedSuggestion() ).to.deep.equal( expectedSuggestion );

			function testSavedState( isActive ) {
				expect( wrapper.state.tokens ).to.deep.equal( expectedTokens );
				expect( textInputNode.value ).to.equal( '' );
				expect( getSelectedSuggestion() ).to.equal( null );
				expect( wrapper.refs.tokenField.state.isActive ).to.equal( isActive );
			}

			TestUtils.Simulate.blur( textInputNode );
			setTimeout( function() {
				// After blur, need to wait for TokenField#_blurTimeoutID
				testSavedState( false );
				TestUtils.Simulate.focus( textInputNode );
				testSavedState( true );
				done();
			}, 10 );
		}

		it( 'should add the current text when the input field loses focus', function( done ) {
			testOnBlur(
				't',                   // initialText
				false,                 // selectSuggestion
				null,                  // expectedSuggestion
				[ 'foo', 'bar', 't' ], // expectedTokens
				done
			);
		} );

		it( 'should add the suggested token when the (non-blank) input field loses focus', function( done ) {
			testOnBlur(
				't',                    // initialText
				true,                   // selectSuggestion
				[ '', 't', 'o' ],       // expectedSuggestion
				[ 'foo', 'bar', 'to' ], // expectedTokens
				done
			);
		} );

		it( 'should not add the suggested token when the (blank) input field loses focus', function( done ) {
			testOnBlur(
				'',               // initialText
				true,             // selectSuggestion
				'of',             // expectedSuggestion
				[ 'foo', 'bar' ], // expectedTokens
				done
			);
		} );

		// Firefox on OS X first sends a blur event, then a click event as the
		// mouse is released.  These two tests ensure that the component
		// activates correctly in this situation.

		it( 'should allow clicking on the field in Firefox (click event from input container)', function( done ) {
			TestUtils.Simulate.blur( textInputNode );
			setTimeout( function() {
				// The click event comes from here the first time you click to
				// activate the token field.
				TestUtils.Simulate.click( wrapper.refs.tokenField.refs.tokensAndInput );
				expect( wrapper.refs.tokenField.state.isActive ).to.equal( true );
				done();
			}, 50 ); // 50ms is a fast click
		} );

		it( 'should allow clicking on the field in Firefox (click event from <input>)', function( done ) {
			TestUtils.Simulate.blur( textInputNode );
			setTimeout( function() {
				// The click event comes from here if you click on the token
				// field when it is already active.
				TestUtils.Simulate.click( textInputNode );
				expect( wrapper.refs.tokenField.state.isActive ).to.equal( true );
				done();
			}, 50 ); // 50ms is a fast click
		} );

		it( 'should add tokens in the middle of the current tokens', function() {
			sendKey( keyCodes.leftArrow );
			setText( 'baz' );
			sendKey( keyCodes.tab );
			setText( 'quux' );
			sendKey( keyCodes.tab );
			expect( wrapper.state.tokens ).to.deep.equal( [ 'foo', 'baz', 'quux', 'bar' ] );
		} );

		it( 'should add tokens from the selected matching suggestion using Tab', function() {
			setText( 't' );
			expect( getSelectedSuggestion() ).to.equal( null );
			sendKey( keyCodes.downArrow ); // 'the'
			expect( getSelectedSuggestion() ).to.deep.equal( [ '', 't', 'he' ] );
			sendKey( keyCodes.downArrow ); // 'to'
			expect( getSelectedSuggestion() ).to.deep.equal( [ '', 't', 'o' ] );
			sendKey( keyCodes.tab );
			expect( wrapper.state.tokens ).to.deep.equal( [ 'foo', 'bar', 'to' ] );
			expect( getSelectedSuggestion() ).to.equal( null );
		} );

		it( 'should add tokens from the selected matching suggestion using Enter', function() {
			setText( 't' );
			expect( getSelectedSuggestion() ).to.equal( null );
			sendKey( keyCodes.downArrow ); // 'the'
			expect( getSelectedSuggestion() ).to.deep.equal( [ '', 't', 'he' ] );
			sendKey( keyCodes.downArrow ); // 'to'
			expect( getSelectedSuggestion() ).to.deep.equal( [ '', 't', 'o' ] );
			sendKey( keyCodes.enter );
			expect( wrapper.state.tokens ).to.deep.equal( [ 'foo', 'bar', 'to' ] );
			expect( getSelectedSuggestion() ).to.equal( null );
		} );

		it( 'should add tokens from the selected suggestion using Tab', function() {
			expect( getSelectedSuggestion() ).to.equal( null );
			sendKey( keyCodes.downArrow ); // 'the'
			expect( getSelectedSuggestion() ).to.equal( 'the' );
			sendKey( keyCodes.downArrow ); // 'of'
			expect( getSelectedSuggestion() ).to.equal( 'of' );
			sendKey( keyCodes.tab );
			expect( wrapper.state.tokens ).to.deep.equal( [ 'foo', 'bar', 'of' ] );
			expect( getSelectedSuggestion() ).to.equal( null );
		} );

		it( 'should add tokens from the selected suggestion using Enter', function() {
			expect( getSelectedSuggestion() ).to.equal( null );
			sendKey( keyCodes.downArrow ); // 'the'
			expect( getSelectedSuggestion() ).to.equal( 'the' );
			sendKey( keyCodes.downArrow ); // 'of'
			expect( getSelectedSuggestion() ).to.equal( 'of' );
			sendKey( keyCodes.enter );
			expect( wrapper.state.tokens ).to.deep.equal( [ 'foo', 'bar', 'of' ] );
			expect( getSelectedSuggestion() ).to.equal( null );
		} );

	} );

	describe( 'removing tokens', function() {

		it( 'should remove tokens when X icon clicked', function() {
			TestUtils.Simulate.click( tokenFieldNode.querySelector( '.token-field__remove-token' ) );
			expect( wrapper.state.tokens ).to.deep.equal( [ 'bar' ] );
		} );

		it( 'should remove the token to the left when backspace pressed', function() {
			sendKey( keyCodes.backspace );
			expect( wrapper.state.tokens ).to.deep.equal( [ 'foo' ] );
		} );

		it( 'should remove the token to the right when delete pressed', function() {
			sendKey( keyCodes.leftArrow );
			sendKey( keyCodes.leftArrow );
			sendKey( keyCodes.delete );
			expect( wrapper.state.tokens ).to.deep.equal( [ 'bar' ] );
		} );

	} );

} );
