/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormTextInput from 'components/forms/form-text-input';
import './style.scss';

class CancelAutoRenewalForm extends Component {
	state = {
		checkedRadio: '',
		feedback: '',
	};

	onSubmit = () => {
		this.props.onClose();
	};

	closeDialog = () => {
		this.props.onClose();
	};

	onRadioChange = event => {
		this.setState( {
			checkedRadio: event.currentTarget.value,
		} );
	};

	onEnterFeedback = event => {
		this.setState( {
			feedback: event.target.value,
		} );
	};

	render() {
		const { translate, isVisible } = this.props;
		const { checkedRadio, feedback } = this.state;

		return (
			<Dialog
				className="cancel-auto-renewal-form__dialog"
				isVisible={ isVisible }
				onClose={ this.closeDialog }
			>
				<FormSectionHeading className="cancel-auto-renewal-form__header">
					{ translate( 'Your thoughts are needed.' ) }
				</FormSectionHeading>
				<FormFieldset>
					<p>
						{ translate(
							'We have processed your request. Your feedback could help us improve our products.' +
								'Do you think you might use your current subscription after it expires?'
						) }
					</p>
					<FormLabel>
						<FormRadio
							value="radio-1"
							onChange={ this.onRadioChange }
							checked={ checkedRadio === 'radio-1' }
						/>
						<span>{ translate( "Yes, I'm just taking a break for now." ) }</span>
					</FormLabel>
					<FormLabel>
						<FormRadio
							value="radio-2"
							onChange={ this.onRadioChange }
							checked={ checkedRadio === 'radio-2' }
						/>
						<span>{ translate( 'Yes, I want to renew manually.' ) }</span>
					</FormLabel>
					<FormLabel>
						<FormRadio
							value="radio-3"
							onChange={ this.onRadioChange }
							checked={ checkedRadio === 'radio-3' }
						/>
						<span>{ translate( 'No, I don’t have any plans to renew it.' ) }</span>
					</FormLabel>
					<FormLabel>
						<FormRadio
							value="radio-4"
							onChange={ this.onRadioChange }
							checked={ checkedRadio === 'radio-4' }
						/>
						<span>{ translate( 'Another reason' ) }</span>
					</FormLabel>
					{ checkedRadio === 'radio-4' && (
						<FormTextInput
							placeholder={ translate( 'Please enter your feedback here.' ) }
							value={ feedback }
							onChange={ this.onEnterFeedback }
						/>
					) }
				</FormFieldset>

				<FormButtonsBar>
					<FormButton onClick={ this.onSubmit }>{ translate( 'Submit' ) }</FormButton>
					<FormButton isPrimary={ false } onClick={ this.closeDialog }>
						{ translate( 'Skip' ) }
					</FormButton>
				</FormButtonsBar>
			</Dialog>
		);
	}
}

export default connect()( localize( CancelAutoRenewalForm ) );
