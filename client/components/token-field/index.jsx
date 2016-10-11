/**
 * External dependencies
 */
var take = require( 'lodash/take' ),
	clone = require( 'lodash/clone' ),
	uniq = require( 'lodash/uniq' ),
	last = require( 'lodash/last' ),
	map = require( 'lodash/map' ),
	difference = require( 'lodash/difference' ),
	React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	each = require( 'lodash/each' ),
	identity = require( 'lodash/identity' ),
	classNames = require( 'classnames' ),
	debug = require( 'debug' )( 'calypso:token-field' ),
	some = require( 'lodash/some' ),
	forEach = require( 'lodash/forEach' );

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
		displayTransform: React.PropTypes.func,
		saveTransform: React.PropTypes.func,
		onChange: React.PropTypes.func,
		isBorderless: React.PropTypes.bool,
		maxLength: React.PropTypes.number,
		onFocus: React.PropTypes.func,
		disabled: React.PropTypes.bool,
		tokenizeOnSpace: React.PropTypes.bool,
		value: function( props ) {
			const value = props.value;
			if ( ! Array.isArray( value ) ) {
				return new Error( 'Value prop is expected to be an array.' );
			}

			forEach( value, ( item ) => {
				if ( 'object' === typeof item ) {
					if ( ! ( 'value' in item ) ) {
						return new Error(
							"When using object for value prop, each object is expected to have a 'value' property."
						);
					}
				}
			} );
		}
	},

	getDefaultProps: function() {
		return {
			suggestions: Object.freeze( [] ),
			maxSuggestions: 100,
			value: Object.freeze( [] ),
			displayTransform: identity,
			saveTransform: function( token ) {
				return token.trim();
			},
			onChange: function() {},
			isBorderless: false,
			disabled: false,
			tokenizeOnSpace: false
		};
	},

	mixins: [ PureRenderMixin ],

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

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.disabled && this.state.isActive ) {
			this.setState( {
				isActive: false,
				incompleteTokenValue: ''
			} );
		}
	},

	render: function() {
		var classes = classNames( 'token-field', {
			'is-active': this.state.isActive,
			'is-disabled': this.props.disabled
		} );

		var tokenFieldProps = {
			ref: 'main',
			className: classes,
			tabIndex: '-1'
		};

		if ( ! this.props.disabled ) {
			tokenFieldProps = Object.assign( {}, tokenFieldProps, {
				onKeyDown: this._onKeyDown,
				onKeyPress: this._onKeyPress,
				onFocus: this._onFocus
			} );
		}

		return (
			<div { ...tokenFieldProps } >
				<div ref="tokensAndInput"
					className="token-field__input-container"
					tabIndex="-1"
					onMouseDown={ this._onContainerTouched }
					onTouchStart={ this._onContainerTouched }
				>
					{ this._renderTokensAndInput() }
				</div>
				<SuggestionsList
					match={ this.props.saveTransform( this.state.incompleteTokenValue ) }
					displayTransform={ this.props.displayTransform }
					suggestions={ this._getMatchingSuggestions() }
					selectedIndex={ this.state.selectedSuggestionIndex }
					scrollIntoView={ this.state.selectedSuggestionScroll }
					isExpanded={ this.state.isActive }
					onHover={ this._onSuggestionHovered }
					onSelect={ this._onSuggestionSelected }
				/>
			</div>
		);
	},

	_renderTokensAndInput: function() {
		var components = map( this.props.value, this._renderToken );

		components.splice( this._getIndexOfInput(), 0, this._renderInput() );

		return components;
	},

	_renderToken: function( token ) {
		const value = this._getTokenValue( token );
		const status = token.status ? token.status : undefined;

		return (
			<Token
				key={ 'token-' + value }
				value={ value }
				status={ status }
				tooltip={ token.tooltip }
				displayTransform={ this.props.displayTransform }
				onClickRemove={ this._onTokenClickRemove }
				isBorderless={ token.isBorderless || this.props.isBorderless }
				onMouseEnter={ token.onMouseEnter }
				onMouseLeave={ token.onMouseLeave }
				disabled={ 'error' !== status && this.props.disabled } />
		);
	},

	_renderInput: function() {
		const { autoCapitalize, autoComplete, maxLength, value } = this.props;

		let props = {
			autoCapitalize,
			autoComplete,
			ref: 'input',
			key: 'input',
			disabled: this.props.disabled,
			value: this.state.incompleteTokenValue,
			onBlur: this._onBlur,
		};

		if ( ! ( maxLength && value.length >= maxLength ) ) {
			props = { ...props, onChange: this._onInputChange };
		}

		return (
			<TokenInput { ...props } />
		);
	},

	_onFocus: function( event ) {
		this.setState( { isActive: true } );
		if ( 'function' === typeof this.props.onFocus ) {
			this.props.onFocus( event );
		}
	},

	_onBlur: function( event ) { // eslint-disable-line no-unused-vars
		if ( this._inputHasValidValue() ) {
			debug( '_onBlur adding current token' );
			this.setState( { isActive: false }, this._addCurrentToken );
		} else {
			debug( '_onBlur not adding current token' );
			this.setState( this.getInitialState() );
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
		const text = event.value;
		const separator = this.props.tokenizeOnSpace ? /[ ,]+/ : /,+/;
		const items = text.split( separator );

		if ( items.length > 1 ) {
			this._addNewToken( items.slice( 0, -1 ), { isBatchOperation: true } );
		}

		this.setState( {
			incompleteTokenValue: last( items ) || '',
			selectedSuggestionIndex: -1,
			selectedSuggestionScroll: false
		} );
	},

	_onContainerTouched: function( event ) {
		// Prevent clicking/touching the tokensAndInput container from blurring
		// the input and adding the current token.
		if ( event.target === this.refs.tokensAndInput && this.state.isActive ) {
			event.preventDefault();
		}
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
			case 32: // space
				if ( this.props.tokenizeOnSpace ) {
					preventDefault = this._addCurrentToken();
				}
				break;
			default:
				break;
		}

		if ( preventDefault ) {
			event.preventDefault();
		}
	},

	_onKeyPress: function( event ) {
		var preventDefault = false;

		switch ( event.charCode ) {
			case 44: // comma
				preventDefault = this._handleCommaKey();
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
			match = this.props.saveTransform( this.state.incompleteTokenValue ),
			startsWithMatch = [],
			containsMatch = [];

		if ( match.length === 0 ) {
			suggestions = difference( suggestions, this.props.value );
		} else {
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

		return take( suggestions, this.props.maxSuggestions );
	},

	_getSelectedSuggestion: function() {
		if ( this.state.selectedSuggestionIndex !== -1 ) {
			return this._getMatchingSuggestions()[ this.state.selectedSuggestionIndex ];
		}
	},

	_addCurrentToken: function() {
		var preventDefault = false,
			selectedSuggestion = this._getSelectedSuggestion();

		if ( selectedSuggestion ) {
			this._addNewToken( selectedSuggestion );
			preventDefault = true;
		} else if ( this._inputHasValidValue() ) {
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

		if ( this._inputHasValidValue() ) {
			this._addNewToken( this.state.incompleteTokenValue );
		}

		return preventDefault;
	},

	_isInputEmpty: function() {
		return this.state.incompleteTokenValue.length === 0;
	},

	_inputHasValidValue: function() {
		return this.props.saveTransform( this.state.incompleteTokenValue ).length > 0;
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
		const newTokens = this.props.value.filter( ( item ) => {
			return this._getTokenValue( item ) !== this._getTokenValue( token );
		} );
		this.props.onChange( newTokens );
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

	_addNewToken: function( token, { isBatchOperation = false } = {} ) {
		const tokens = uniq(
			( Array.isArray( token ) ? token : [ token ] )
				.map( this.props.saveTransform )
				.filter( Boolean )
				.filter( token => ! this._valueContainsToken( token ) )
		);

		if ( tokens.length > 0 ) {
			const newValue = clone( this.props.value );
			newValue.splice.apply(
				newValue,
				[ this._getIndexOfInput(), 0 ].concat( tokens )
			);
			debug( '_addNewToken: onChange', newValue );
			this.props.onChange( newValue );
		}

		if ( isBatchOperation ) {
			return;
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

	_valueContainsToken( token ) {
		return some( this.props.value, ( item ) => {
			return this._getTokenValue( token ) === this._getTokenValue( item );
		} );
	},

	_getTokenValue( token ) {
		if ( 'object' === typeof token ) {
			return token.value;
		}

		return token;
	},

	_getIndexOfInput: function() {
		return this.props.value.length - this.state.inputOffsetFromEnd;
	}
} );

module.exports = TokenField;
