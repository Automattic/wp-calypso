/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormInputValidation from 'components/forms/form-input-validation';
import { gaRecordEvent } from 'lib/analytics/ga';
import scrollIntoViewport from 'lib/scroll-into-viewport';

export default class Input extends React.Component {
	static defaultProps = { autoFocus: false, autoComplete: 'on' };

	inputRef = element => {
		this.inputElement = element;

		if ( ! this.props.inputRef ) {
			return;
		}

		if ( typeof inputRef === 'function' ) {
			this.props.inputRef( element );
		} else {
			this.props.inputRef.current = element;
		}
	};

	componentDidMount() {
		this.setupInputModeHandlers();
		this.autoFocusInput();
	}

	setupInputModeHandlers = () => {
		const inputElement = this.inputRef.current;

		if ( inputElement && this.props.inputMode === 'numeric' ) {
			// This forces mobile browsers to use a numeric keyboard. We have to
			// toggle the pattern on and off to avoid getting errors against the
			// masked value (which could contain characters other than digits).
			//
			// This workaround is based on the following StackOverflow post:
			// http://stackoverflow.com/a/19998430/821706
			inputElement.addEventListener( 'touchstart', () => ( inputElement.pattern = '\\d*' ) );

			[ 'keydown', 'blur' ].forEach( eventName =>
				inputElement.addEventListener( eventName, () => ( inputElement.pattern = '.*' ) )
			);
		}
	};

	componentDidUpdate( oldProps ) {
		if ( oldProps.disabled && ! this.props.disabled ) {
			// We focus when the state goes from disabled to enabled. This is needed because we show a disabled input
			// until we receive data from the server.
			this.autoFocusInput();
		}
	}

	focus = () => {
		const node = this.inputElement;
		if ( node ) {
			node.focus();
			scrollIntoViewport( node, {
				behavior: 'smooth',
				scrollMode: 'if-needed',
			} );
		}
	};

	autoFocusInput = () => {
		if ( this.props.autoFocus ) {
			this.focus();
		}
	};

	recordFieldClick = () => {
		if ( this.props.eventFormName ) {
			gaRecordEvent( 'Upgrades', `Clicked ${ this.props.eventFormName } Field`, this.props.name );
		}
	};

	render() {
		const classes = classNames(
			this.props.additionalClasses,
			this.props.name,
			this.props.labelClass,
			this.props.classes
		);

		const validationId = `validation-field-${ this.props.name }`;

		return (
			<div className={ classes }>
				<FormLabel htmlFor={ this.props.name } { ...this.props.labelProps }>
					{ this.props.label }
				</FormLabel>
				<FormTextInput
					aria-invalid={ this.props.isError }
					aria-describedby={ validationId }
					placeholder={ this.props.placeholder ? this.props.placeholder : this.props.label }
					id={ this.props.name }
					value={ this.props.value }
					name={ this.props.name }
					autoFocus={ this.props.autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
					autoComplete={ this.props.autoComplete }
					disabled={ this.props.disabled }
					maxLength={ this.props.maxLength }
					onBlur={ this.props.onBlur }
					onChange={ this.props.onChange }
					onClick={ this.recordFieldClick }
					isError={ this.props.isError }
					inputRef={ this.inputRef }
				/>
				{ this.props.errorMessage && (
					<FormInputValidation id={ validationId } text={ this.props.errorMessage } isError />
				) }
			</div>
		);
	}
}
