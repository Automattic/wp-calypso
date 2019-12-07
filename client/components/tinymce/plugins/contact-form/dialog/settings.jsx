/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormTextValidation from 'components/forms/form-input-validation';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import { validateSettingsToEmail } from './validations';

class ContactFormDialogFormSettings extends React.Component {
	static displayName = 'ContactFormDialogFormSettings';

	static propTypes = {
		to: PropTypes.string,
		subject: PropTypes.string,
		email: PropTypes.string,
		title: PropTypes.string,
		onUpdate: PropTypes.func.isRequired,
	};

	onToChange = event => {
		this.props.onUpdate( { to: event.target.value } );
	};

	onSubjectChange = event => {
		this.props.onUpdate( { subject: event.target.value } );
	};

	render() {
		const emailValidationError = ! validateSettingsToEmail( this.props.to );

		return (
			<div className="editor-contact-form-modal-settings">
				<SectionHeader label={ this.props.translate( 'Contact Form Notification Settings' ) } />
				<Card>
					<p>
						{ this.props.postType === 'post'
							? this.props.translate(
									'If you don’t make any changes here, feedback will be sent to the author of the post and the subject will be the name of this post.'
							  )
							: this.props.translate(
									'If you don’t make any changes here, feedback will be sent to the author of the page and the subject will be the name of this page.'
							  ) }
					</p>

					<FormFieldset>
						<FormLabel>{ this.props.translate( 'Enter your email address' ) }</FormLabel>
						<FormTextInput
							value={ this.props.to }
							placeholder={ this.props.email }
							isError={ emailValidationError }
							onChange={ this.onToChange }
						/>
						{ emailValidationError && (
							<FormTextValidation
								isError={ true }
								text={ this.props.translate( '%(email)s is not a valid email address.', {
									args: { email: this.props.to },
								} ) }
							/>
						) }
						<FormSettingExplanation>
							{ this.props.translate(
								'You can enter multiple email addresses in the Email address field, and separate them with commas.' +
									' A notification email will then be sent to each email address.'
							) }
						</FormSettingExplanation>
					</FormFieldset>

					<FormFieldset>
						<FormLabel>{ this.props.translate( 'What should the subject line be?' ) }</FormLabel>
						<FormTextInput
							value={ this.props.subject }
							placeholder={ this.props.title }
							onChange={ this.onSubjectChange }
						/>
					</FormFieldset>
				</Card>
			</div>
		);
	}
}

export default localize( ContactFormDialogFormSettings );
