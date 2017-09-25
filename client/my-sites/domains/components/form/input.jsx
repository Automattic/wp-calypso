/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import analytics from 'lib/analytics';
import scrollIntoViewport from 'lib/scroll-into-viewport';

export default React.createClass( {
	displayName: 'Input',

	getDefaultProps() {
		return { autoFocus: false, autoComplete: 'on' };
	},

	componentDidMount() {
		this.setupInputModeHandlers();
		this.autoFocusInput();
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
			this.autoFocusInput();
		}
	},

	focus() {
		const node = ReactDom.findDOMNode( this.refs.input );
		node.focus();
		scrollIntoViewport( node );
	},

	autoFocusInput() {
		if ( this.props.autoFocus ) {
			this.focus();
		}
	},

	recordFieldClick() {
		if ( this.props.eventFormName ) {
			analytics.ga.recordEvent( 'Upgrades', `Clicked ${ this.props.eventFormName } Field`, this.props.name );
		}
	},

	render() {
		const classes = classNames( this.props.additionalClasses, this.props.name, this.props.labelClass, this.props.classes );

		return (
			<div className={ classes }>
				<FormLabel htmlFor={ this.props.name }>{ this.props.label }</FormLabel>
				<FormTextInput
					placeholder={ this.props.placeholder ? this.props.placeholder : this.props.label }
					id={ this.props.name }
					value={ this.props.value }
					name={ this.props.name }
					ref="input"
					autoFocus={ this.props.autoFocus }
					autoComplete={ this.props.autoComplete }
					disabled={ this.props.disabled }
					maxLength={ this.props.maxLength }
					onChange={ this.props.onChange }
					onClick={ this.recordFieldClick }
					isError={ this.props.isError }
					inputRef={ this.props.inputRef } />
				{ this.props.errorMessage && <FormInputValidation text={ this.props.errorMessage } isError /> }
			</div>
		);
	}
} );
