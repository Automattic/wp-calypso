/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react/addons' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	FocusMixin = require( './focus-mixin.js' );

module.exports = React.createClass( {
	displayName: 'Input',

	mixins: [ FocusMixin( 'input' ) ],

	getDefaultProps: function() {
		return { type: 'text', autofocus: false };
	},

	componentDidMount: function() {
		this.setupInputModeHandlers();
		this.autofocusInput();
	},

	setupInputModeHandlers: function() {
		var inputElement = ReactDom.findDOMNode( this.refs.input );

		if ( this.props.inputMode === 'numeric' ) {
			// This forces mobile browsers to use a numeric keyboard. We have to
			// toggle the pattern on and off to avoid getting errors against the
			// masked value (which could contain characters other than digits).
			//
			// This workaround is based on the following StackOverflow post:
			// http://stackoverflow.com/a/19998430/821706
			inputElement.addEventListener( 'touchstart', function() {
				inputElement.pattern = '\\d*';
			} );

			[ 'keydown', 'blur' ].forEach( function( eventName ) {
				inputElement.addEventListener( eventName, function() {
					inputElement.pattern = '.*';
				} );
			} );
		}
	},

	componentDidUpdate( oldProps ) {
		if ( oldProps.disabled && ! this.props.disabled ) {
			// We focus when the state goes from disabled to enabled. This is needed because we show a disabled input
			// until we receive data from the server.
			this.autofocusInput();
		}
	},

	autofocusInput() {
		if ( this.props.autofocus ) {
			ReactDom.findDOMNode( this.refs.input ).focus();
		}
	},

	recordFieldClick: function() {
		if ( this.props.eventFormName ) {
			analytics.ga.recordEvent( 'Upgrades', `Clicked ${ this.props.eventFormName } Field`, this.props.name );
		}
	},

	render: function() {
		var classes = classNames( this.props.additionalClasses, this.props.name, this.props.labelClass, {
			focus: this.state.focus,
			active: Boolean( this.props.value ),
			invalid: this.props.invalid
		}, this.props.classes );

		return (
			<div className={ classes }>
				<label htmlFor={ this.props.name } className="form-label">{ this.props.label }</label>
				<input
					type={ this.props.type }
					placeholder={ this.props.label }
					id={ this.props.name }
					value={ this.props.value }
					name={ this.props.name }
					ref="input"
					autofocus={ this.props.autofocus }
					disabled={ this.props.disabled }
					onChange={ this.props.onChange }
					onClick={ this.recordFieldClick }
					onBlur={ this.handleBlur }
					onFocus={ this.handleFocus } />
			</div>
		);
	}
} );
