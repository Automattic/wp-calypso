/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */

import FormInputValidation from 'components/forms/form-input-validation';
import analytics from 'analytics';
import FocusMixin from './focus-mixin';
import scrollIntoViewport from 'lib/scroll-into-viewport';

export default React.createClass( {
	displayName: 'Input',

	mixins: [ FocusMixin( 'input' ) ],

	getDefaultProps() {
		return { type: 'text', autofocus: false };
	},

	componentDidMount() {
		this.setupInputModeHandlers();
		this.autofocusInput();
	},

	setupInputModeHandlers() {
		const inputElement = ReactDom.findDOMNode( this.refs.input );

		if ( this.props.inputMode === 'numeric' ) {
			// This forces mobile browsers to use a numeric keyboard. We have to
			// toggle the pattern on and off to avoid getting errors against the
			// masked value (which could contain characters other than digits).
			//
			// This workaround is based on the following StackOverflow post:
			// http://stackoverflow.com/a/19998430/821706
			inputElement.addEventListener( 'touchstart', () => inputElement.pattern = '\\d*' );

			[ 'keydown', 'blur' ].forEach( ( eventName ) =>
				inputElement.addEventListener( eventName, () => inputElement.pattern = '.*' ) );
		}
	},

	componentDidUpdate( oldProps ) {
		if ( oldProps.disabled && ! this.props.disabled ) {
			// We focus when the state goes from disabled to enabled. This is needed because we show a disabled input
			// until we receive data from the server.
			this.autofocusInput();
		}
	},

	focus() {
		var node = ReactDom.findDOMNode( this.refs.input );
		node.focus();
		scrollIntoViewport( node );
	},

	autofocusInput() {
		if ( this.props.autofocus ) {
			this.focus();
		}
	},

	recordFieldClick() {
		if ( this.props.eventFormName ) {
			analytics.ga.recordEvent( 'Upgrades', `Clicked ${ this.props.eventFormName } Field`, this.props.name );
		}
	},

	render() {
		const classes = classNames( this.props.additionalClasses, this.props.name, this.props.labelClass, {
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
				{ this.props.errorMessage && <FormInputValidation text={ this.props.errorMessage } isError /> }
			</div>
		);
	}
} );
