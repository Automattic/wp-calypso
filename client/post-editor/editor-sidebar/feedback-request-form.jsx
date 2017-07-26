/**
 * External dependencies
 */
import React, { PropTypes, PureComponent } from 'react';
import { localize } from 'i18n-calypso';
import { debounce } from 'lodash';
import EmailValidator from 'email-validator';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import Button from 'components/button';

const initialState = {
	emailValue: '',
	pendingValidation: false,
	shouldShowValidationError: false,
};

export class FeedbackRequestForm extends PureComponent {
	static propTypes = {
		translate: PropTypes.func.isRequired,
		requestFeedback: PropTypes.func.isRequired,
	};

	state = initialState;

	onEmailChange = ( { target: { value } } ) => {
		this.debouncedUpdateValidationState();

		this.setState( {
			emailValue: value,
			pendingValidation: true,
		} );
	};

	updateValidationDisplay = () => {
		const { emailValue } = this.state;

		this.setState( {
			pendingValidation: false,
			shouldShowValidationError: emailValue.length > 0 && ! EmailValidator.validate( emailValue ),
		} );
	};

	debouncedUpdateValidationState = debounce( () => this.updateValidationDisplay(), 1000 );

	onSubmit = event => {
		event.preventDefault();

		const { emailValue } = this.state;

		if ( emailValue.length > 0 ) {
			if ( EmailValidator.validate( emailValue ) ) {
				this.props.requestFeedback( emailValue );
				this.setState( initialState );
			} else {
				// Give immediate validation feedback since the user tried to submit
				this.updateValidationDisplay();
			}
		}
	};

	render() {
		const { translate } = this.props;
		const { emailValue, shouldShowValidationError } = this.state;

		const description = translate(
			'Send your friends a link to read your draft before you publish.',
		);

		// TODO: Make the validation error message accessible
		return (
			<form className="editor-sidebar__feedback-request-form" onSubmit={ this.onSubmit }>
				<p>
					{ description }
				</p>
				<label>
					<span className="editor-sidebar__feedback-request-input-label">
						{ translate( "Friend's Email" ) }
					</span>
					<FormTextInput
						type="email"
						className="editor-sidebar__feedback-request-input"
						onChange={ this.onEmailChange }
						placeholder="name@domain.com"
						value={ emailValue }
						isError={ shouldShowValidationError }
					/>
				</label>
				{ shouldShowValidationError &&
						<div className="editor-sidebar__feedback-request-input-invalid-message">
							{ translate( 'Invalid email address.' ) }
						</div> }
				<Button type="submit" className="editor-sidebar__feedback-request-button">
					{ translate( 'Send to a Friend' ) }
				</Button>
			</form>
		);
	}
}

export default localize( FeedbackRequestForm );
