/**
 * External dependencies
 */
var take = require( 'lodash/array/take' ),
	clone = require( 'lodash/lang/clone' ),
	contains = require( 'lodash/collection/contains' ),
	map = require( 'lodash/collection/map' ),
	React = require( 'react/addons' ),
	without = require( 'lodash/array/without' ),
	each = require( 'lodash/collection/each' ),
	identity = require( 'lodash/utility/identity' ),
	classNames = require( 'classnames' ),
	debug = require( 'debug' )( 'calypso:token-field' );

/**
 * Internal dependencies
 */
var SuggestionsList = require( './suggestions-list' ),
	Token = require( './token' ),
	TokenInput = require( './token-input' );

var TokenField = React.createClass( {
	propTypes: {
		suggestions: React.PropTypes.array,
		maxSuggestions: React.PropTypes.number,
		value: React.PropTypes.array,
		valueTransform: React.PropTypes.func,
		onChange: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			suggestions: Object.freeze( [] ),
			maxSuggestions: 100,
			value: Object.freeze( [] ),
			valueTransform: identity,
			onChange: function() {}
		};
	},

	mixins: [ React.addons.PureRenderMixin ],

	getInitialState: function() {
		return {
			incompleteTokenValue: '',
			inputOffsetFromEnd: 0,
			isActive: false,
			selectedSuggestionIndex: -1,
			selectedSuggestionScroll: false
		};
	},

	componentDidUpdate: function() {
		if ( this.state.isActive && ! this.refs.input.hasFocus() ) {
			debug( 'componentDidUpdate focusing input' );
			this.refs.input.focus(); // make sure focus is on input
		}
	},

	componentWillUnmount: function() {
		debug( 'componentWillUnmount' );
		this._clearBlurTimeout();
	},

	render: function() {
		var classes = classNames( 'token-field', {
			'is-active': this.state.isActive
		} );

		return (
			<div className={ classes } tabIndex="-1" onKeyDown={ this._onKeyDown } onBlur={ this._onBlur } onFocus={ this._onFocus }>
				<div ref="tokensAndInput" className="token-field__input-container" onClick={ this._onClick } tabIndex="-1">
					{ this._renderTokensAndInput() }
				</div>
				<SuggestionsList
					match={ this.state.incompleteTokenValue }
					valueTransform={ this.props.valueTransform }
					suggestions={ this._getMatchingSuggestions() }
					selectedIndex={ this.state.selectedSuggestionIndex }
					scrollIntoView={ this.state.selectedSuggestionScroll }
					isExpanded={ this.state.isActive }
					onHover={ this._onSuggestionHovered }
					onSelect={ this._onSuggestionSelected } />
			</div>
		);
	},

	_renderTokensAndInput: function() {
		var components = map( this.props.value, this._renderToken );

		components.splice( this._getIndexOfInput(), 0, this._renderInput() );

		return components;
	},

	_renderToken: function( token ) {
		return (
			<Token
				key={ 'token-' + token }
				value={ token }
				valueTransform={ this.props.valueTransform }
				onClickRemove={ this._onTokenClickRemove }
			/>
		);
	},

	_renderInput: function() {
		return (
			<TokenInput
				ref="input"
				key="input"
				value={ this.state.incompleteTokenValue }
				onChange={ this._onInputChange } />
		);
	},

	_onFocus: function() {
		if ( this._blurTimeoutID ) {
			this._clearBlurTimeout();
			return;
		} else if ( this.state.isActive ) {
			return; // already active
		}

		this.setState( { isActive: true } );
	},

	_onBlur: function( event ) {
		var stillActive = event.target.contains( event.relatedTarget );

		if ( stillActive ) {
			debug( '_onBlur but component still active; not doing anything' );
			return; // we didn't leave the component, so don't do anything
		} else {
			debug( '_onBlur before timeout setting component inactive' );
			this.setState( {
				isActive: false
			} );
			/* When the component blurs, we need to add the current text, or
			 * the selected suggestion (if any).
			 *
			 * Two reasons to set a timeout rather than do this immediately:
			 *  - Some other user action (like tapping on a suggestion) may
			 *    have caused this blur.  If there is another user-triggered
			 *    event, we need to give it a chance to complete first.
			 *  - At one point, using the right arrow key to move the text
			 *    input was causing a blur to outside the component?! (left
			 *    arrow key does not do this).  So, we delay the resetting of
			 *    the state and cancel it if we get focus back quick enough.
			 */
			debug( '_onBlur waiting to add current token' );
			this._blurTimeoutID = window.setTimeout( function() {
				// Add the current token, UNLESS the text input is empty and
				// there is a suggested token selected.  In that case, we don't
				// want to add it, because it's easy to inadvertently hover
				// over a suggestion.
				if ( this._isInputEmptyOrWhitespace() ) {
					debug( '_onBlur after timeout not adding current token' );
				} else {
					debug( '_onBlur after timeout adding current token' );
					this._addCurrentToken();
				}
				debug( '_onBlur resetting component state' );
				this.setState( this.getInitialState() );
				this._clearBlurTimeout();
			}.bind( this ), 0 );
		}
	},

	_clearBlurTimeout: function() {
		if ( this._blurTimeoutID ) {
			debug( '_blurTimeoutID cleared' );
			window.clearTimeout( this._blurTimeoutID );
			this._blurTimeoutID = null;
		}
	},

	_onClick: function( event ) {
		var inputContainer = this.refs.tokensAndInput;
		if ( event.target === inputContainer || inputContainer.contains( event.target ) ) {
			debug( '_onClick activating component' );
			this.setState( {
				isActive: true
			} );
		}
	},

	_onTokenClickRemove: function( event ) {
		this._deleteToken( event.value );
	},

	_onSuggestionHovered: function( suggestion ) {
		var index = this._getMatchingSuggestions().indexOf( suggestion );

		if ( index >= 0 ) {
			this.setState( {
				selectedSuggestionIndex: index,
				selectedSuggestionScroll: false
			} );
		}
	},

	_onSuggestionSelected: function( suggestion ) {
		debug( '_onSuggestionSelected', suggestion );
		this._addNewToken( suggestion );
	},

	_onInputChange: function( event ) {
		this.setState( {
			incompleteTokenValue: event.value,
			selectedSuggestionIndex: -1,
			selectedSuggestionScroll: false
		} );
	},

	_onKeyDown: function( event ) {
		var preventDefault = false;

		switch ( event.keyCode ) {
			case 8: // backspace (delete to left)
				preventDefault = this._handleDeleteKey( this._deleteTokenBeforeInput );
				break;
			case 9: // tab
				preventDefault = this._addCurrentToken();
				break;
			case 13: // enter/return
				preventDefault = this._addCurrentToken();
				break;
			case 37: // left arrow
				preventDefault = this._handleLeftArrowKey();
				break;
			case 38: // up arrow
				preventDefault = this._handleUpArrowKey();
				break;
			case 39: // right arrow
				preventDefault = this._handleRightArrowKey();
				break;
			case 40: // down arrow
				preventDefault = this._handleDownArrowKey();
				break;
			case 46: // delete (to right)
				preventDefault = this._handleDeleteKey( this._deleteTokenAfterInput );
				break;
			case 188: // comma
				if ( ! event.shiftKey ) { // ignore <
					preventDefault = this._handleCommaKey();
				}
				break;
			default:
				break;
		}

		if ( preventDefault ) {
			event.preventDefault();
		}
	},

	_handleDeleteKey: function( deleteToken ) {
		var preventDefault = false;

		if ( this.refs.input.hasFocus() && this._isInputEmpty() ) {
			deleteToken();
			preventDefault = true;
		}

		return preventDefault;
	},

	_getMatchingSuggestions: function() {
		var suggestions = this.props.suggestions,
			match = this.state.incompleteTokenValue,
			startsWithMatch = [],
			containsMatch = [];

		if ( match.length > 0 ) {
			match = match.toLocaleLowerCase();

			each( suggestions, function( suggestion ) {
				var index = suggestion.toLocaleLowerCase().indexOf( match );
				if ( this.props.value.indexOf( suggestion ) === -1 ) {
					if ( index === 0 ) {
						startsWithMatch.push( suggestion );
					} else if ( index > 0 ) {
						containsMatch.push( suggestion );
					}
				}
			}.bind( this ) );

			suggestions = startsWithMatch.concat( containsMatch );
		}

		return take( suggestions, this.props.maxSuggestions )
	},

	_getSelectedSuggestion: function() {
		if ( this.state.selectedSuggestionIndex !== -1 ) {
			return this._getMatchingSuggestions()[ this.state.selectedSuggestionIndex ];
		}
	},

	_addCurrentToken: function() {
		var preventDefault = false,
			isInputEmpty = this._isInputEmptyOrWhitespace(),
			selectedSuggestion = this._getSelectedSuggestion();

		if ( selectedSuggestion ) {
			this._addNewToken( selectedSuggestion );
			preventDefault = true;
		} else if ( ! isInputEmpty ) {
			this._addNewToken( this.state.incompleteTokenValue );
			preventDefault = true;
		}

		return preventDefault;
	},

	_handleLeftArrowKey: function() {
		var preventDefault = false;

		if ( this._isInputEmpty() ) {
			this._moveInputBeforePreviousToken();
			preventDefault = true;
		}

		return preventDefault;
	},

	_handleRightArrowKey: function() {
		var preventDefault = false;

		if ( this._isInputEmpty() ) {
			this._moveInputAfterNextToken();
			preventDefault = true;
		}

		return preventDefault;
	},

	_handleUpArrowKey: function() {
		this.setState( {
			selectedSuggestionIndex: Math.max( ( this.state.selectedSuggestionIndex || 0 ) - 1, 0 ),
			selectedSuggestionScroll: true
		} );

		return true; // preventDefault
	},

	_handleDownArrowKey: function() {
		this.setState( {
			selectedSuggestionIndex: Math.min(
				( this.state.selectedSuggestionIndex + 1 ) || 0,
				this._getMatchingSuggestions().length - 1
			),
			selectedSuggestionScroll: true
		} );

		return true; // preventDefault
	},

	_handleCommaKey: function() {
		var preventDefault = true;

		if ( ! this._isInputEmpty() ) {
			this._addNewToken( this.state.incompleteTokenValue );
			preventDefault = true;
		}

		return preventDefault;
	},

	_isInputEmpty: function() {
		return this.state.incompleteTokenValue.length === 0;
	},

	_isInputEmptyOrWhitespace: function() {
		return /^\s*$/.test( this.state.incompleteTokenValue );
	},

	_deleteTokenBeforeInput: function() {
		var index = this._getIndexOfInput() - 1;

		if ( index > -1 ) {
			this._deleteToken( this.props.value[ index ] );
		}
	},

	_deleteTokenAfterInput: function() {
		var index = this._getIndexOfInput();

		if ( index < this.props.value.length ) {
			this._deleteToken( this.props.value[ index ] );
			// update input offset since it's the offset from the last token
			this._moveInputToIndex( index );
		}
	},

	_deleteToken: function( token ) {
		this.props.onChange( without( this.props.value, token ) );
	},

	_moveInputToIndex: function( index ) {
		this.setState( {
			inputOffsetFromEnd: this.props.value.length - Math.max( index, -1 ) - 1
		} );
	},

	_moveInputBeforePreviousToken: function() {
		this.setState( {
			inputOffsetFromEnd: Math.min( this.state.inputOffsetFromEnd + 1, this.props.value.length )
		} );
	},

	_moveInputAfterNextToken: function() {
		this.setState( {
			inputOffsetFromEnd: Math.max( this.state.inputOffsetFromEnd - 1, 0 )
		} );
	},

	_addNewToken: function( token ) {
		var newValue;

		if ( ! contains( this.props.value, token ) ) {
			newValue = clone( this.props.value );
			newValue.splice( this._getIndexOfInput(), 0, token );

			this.props.onChange( newValue );
		}

		this.setState( {
			incompleteTokenValue: '',
			selectedSuggestionIndex: -1,
			selectedSuggestionScroll: false
		} );

		if ( this.state.isActive ) {
			debug( '_addNewToken focusing input' );
			this.refs.input.focus();
		}
	},

	_getIndexOfInput: function() {
		return this.props.value.length - this.state.inputOffsetFromEnd;
	}
} );

module.exports = TokenField;
