/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';

export class ResetPasswordFormComponent extends Component {
	static defaultProps = {
		translate: identity,
	};

	static propTypes = {
		translate: PropTypes.func.isRequired,
	};

	state = {
		isSubmitting: false,
		selectedResetOption: null,
	};

	submitForm = () => {
		this.setState( { isSubmitting: true } );
	};

	onResetOptionChanged = ( event ) => {
		this.setState( { selectedResetOption: event.currentTarget.value } );
	};

	render() {
		const { translate } = this.props;
		const { isSubmitting, selectedResetOption } = this.state;
		const isPrimaryButtonEnabled = selectedResetOption && ! isSubmitting;

		return (
			<div className="reset-password-form">
				<h2 className="reset-password-form__title">
					{ translate( 'Reset your password' ) }
				</h2>
				<p>
					{ translate(
						'To reset your password and recover access to your account, ' +
						'select one of these options and follow the instructions.'
					) }
				</p>
				<Card>
					<FormFieldset className="reset-password-form__field-set">
						<FormLegend className="reset-password-form__legend">
							{ translate( 'How would you like to reset your password?' ) }
						</FormLegend>
						<FormLabel>
							<FormRadio
								className="reset-password-form__primary-email-option"
								value="primaryEmail"
								checked={ 'primaryEmail' === selectedResetOption }
								disabled={ isSubmitting }
								onChange={ this.onResetOptionChanged } />
							<span>
								{ translate(
									'Email a reset link to {{strong}}your main email address{{/strong}}',
									{ components: { strong: <strong /> } }
								) }
							</span>
						</FormLabel>
						<FormLabel>
							<FormRadio
								className="reset-password-form__secondary-email-option"
								value="secondaryEmail"
								checked={ 'secondaryEmail' === selectedResetOption }
								disabled={ isSubmitting }
								onChange={ this.onResetOptionChanged } />
							<span>
								{ translate(
									'Email a reset link to {{strong}}your recovery email address{{/strong}}',
									{ components: { strong: <strong /> } }
								) }
							</span>
						</FormLabel>
						<FormLabel>
							<FormRadio
								className="reset-password-form__sms-option"
								value="sms"
								checked={ 'sms' === selectedResetOption }
								disabled={ isSubmitting }
								onChange={ this.onResetOptionChanged } />
							<span>
								{ translate(
									'Send a reset code to {{strong}}your phone{{/strong}}',
									{ components: { strong: <strong /> } }
								) }
							</span>
						</FormLabel>
					</FormFieldset>
					<Button
						className="reset-password-form__submit-button"
						onClick={ this.submitForm }
						disabled={ ! isPrimaryButtonEnabled }
						primary>
						{ translate( 'Continue' ) }
					</Button>
				</Card>
			</div>
		);
	}
}

export default localize( ResetPasswordFormComponent );
