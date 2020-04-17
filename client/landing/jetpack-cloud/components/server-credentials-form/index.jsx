/**
 * External dependendies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import withServerCredentialsForm from '../with-server-credentials-form';
import { Button } from '@automattic/components';
import FormFieldset from 'components/forms/form-fieldset';
import FormSelect from 'components/forms/form-select';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormInputValidation from 'components/forms/form-input-validation';
import FormPasswordInput from 'components/forms/form-password-input';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextArea from 'components/forms/form-textarea';

/**
 * Style dependencies
 */
import './style.scss';

const ServerCredentialsForm = ( {
	formIsSubmitting,
	formSubmissionStatus,
	onCancel,
	onComplete,
	translate,
	handleFieldChange,
	handleSubmit,
	form,
	formErrors,
	labels = {},
} ) => {
	React.useEffect( () => {
		// I'm letting the user jump to the next step even if the submission failed
		// so one can test the UI without having to enter real credentials. On the next
		// iteration we should fix this.
		if ( formSubmissionStatus === 'failed' || formSubmissionStatus === 'success' ) {
			onComplete && onComplete();
		}
	}, [ formSubmissionStatus, onComplete ] );

	return (
		<div className="server-credentials-form">
			<FormFieldset>
				<FormLabel htmlFor="protocol-type">{ translate( 'Credential Type' ) }</FormLabel>
				<FormSelect
					name="protocol"
					id="protocol-type"
					value={ get( form, 'protocol', 'ssh' ) }
					onChange={ handleFieldChange }
					disabled={ formIsSubmitting }
				>
					<option value="ssh">{ translate( 'SSH/SFTP' ) }</option>
					<option value="ftp">{ translate( 'FTP' ) }</option>
				</FormSelect>
			</FormFieldset>

			<div className="server-credentials-form__row">
				<FormFieldset className="server-credentials-form__server-address">
					<FormLabel htmlFor="host-address">
						{ labels.host || translate( 'Server Address' ) }
					</FormLabel>
					<FormTextInput
						name="host"
						id="host-address"
						placeholder={ translate( 'YourGroovyDomain.com' ) }
						value={ get( form, 'host', '' ) }
						onChange={ handleFieldChange }
						disabled={ formIsSubmitting }
						isError={ !! formErrors.host }
					/>
					{ formErrors.host && <FormInputValidation isError={ true } text={ formErrors.host } /> }
				</FormFieldset>

				<FormFieldset className="server-credentials-form__port-number">
					<FormLabel htmlFor="server-port">{ labels.port || translate( 'Port Number' ) }</FormLabel>
					<FormTextInput
						name="port"
						id="server-port"
						placeholder="22"
						value={ get( form, 'port', '' ) }
						onChange={ handleFieldChange }
						disabled={ formIsSubmitting }
						isError={ !! formErrors.port }
					/>
					{ formErrors.port && <FormInputValidation isError={ true } text={ formErrors.port } /> }
				</FormFieldset>
			</div>

			<div className="server-credentials-form__row server-credentials-form__user-pass">
				<FormFieldset className="server-credentials-form__username">
					<FormLabel htmlFor="server-username">
						{ labels.user || translate( 'Server username' ) }
					</FormLabel>
					<FormTextInput
						name="user"
						id="server-username"
						placeholder={ translate( 'username' ) }
						value={ get( form, 'user', '' ) }
						onChange={ handleFieldChange }
						disabled={ formIsSubmitting }
						isError={ !! formErrors.user }
						// Hint to LastPass not to attempt autofill
						data-lpignore="true"
					/>
					{ formErrors.user && <FormInputValidation isError={ true } text={ formErrors.user } /> }
				</FormFieldset>

				<FormFieldset className="server-credentials-form__password">
					<FormLabel htmlFor="server-password">
						{ labels.pass || translate( 'Server password' ) }
					</FormLabel>
					<FormPasswordInput
						name="pass"
						id="server-password"
						placeholder={ translate( 'password' ) }
						value={ get( form, 'pass', '' ) }
						onChange={ handleFieldChange }
						disabled={ formIsSubmitting }
						isError={ !! formErrors.pass }
						// Hint to LastPass not to attempt autofill
						data-lpignore="true"
					/>
					{ formErrors.pass && <FormInputValidation isError={ true } text={ formErrors.pass } /> }
				</FormFieldset>
			</div>

			<FormFieldset className="server-credentials-form__path">
				<FormLabel htmlFor="wordpress-path">
					{ labels.path || translate( 'WordPress installation path' ) }
				</FormLabel>
				<FormTextInput
					name="path"
					id="wordpress-path"
					placeholder="/public_html/wordpress-site/"
					value={ get( form, 'path', '' ) }
					onChange={ handleFieldChange }
					disabled={ formIsSubmitting }
					isError={ !! formErrors.path }
				/>
				{ formErrors.path && <FormInputValidation isError={ true } text={ formErrors.path } /> }
			</FormFieldset>

			<FormFieldset className="server-credentials-form__kpri">
				<FormLabel htmlFor="private-key">{ labels.kpri || translate( 'Private Key' ) }</FormLabel>
				<FormTextArea
					name="kpri"
					id="private-key"
					value={ get( form, 'kpri', '' ) }
					onChange={ handleFieldChange }
					disabled={ formIsSubmitting }
					className="server-credentials-form__private-key"
				/>
				<FormSettingExplanation>
					{ translate( 'Only non-encrypted private keys are supported.' ) }
				</FormSettingExplanation>
			</FormFieldset>

			<FormFieldset className="dialog__action-buttons server-credentials-form__buttons">
				<Button
					disabled={ formIsSubmitting }
					onClick={ onCancel }
					className="server-credentials-form__btn server-credentials-form__btn--cancel"
				>
					{ labels.cancel || translate( 'Cancel' ) }
				</Button>
				<Button
					primary
					className="server-credentials-form__btn"
					disabled={ formIsSubmitting }
					onClick={ handleSubmit }
				>
					{ labels.save || translate( 'Save' ) }
				</Button>
			</FormFieldset>
		</div>
	);
};
ServerCredentialsForm.propTypes = {
	allowCancel: PropTypes.bool,
	allowDelete: PropTypes.bool,
	onCancel: PropTypes.func,
	onComplete: PropTypes.func,
	labels: PropTypes.object,
	showAdvancedSettings: PropTypes.bool,
	toggleAdvancedSettings: PropTypes.func,
	// The following props are provided by the withServerCredentials HOC
	requirePath: PropTypes.bool,
	form: PropTypes.object,
	formErrors: PropTypes.object,
	formIsSubmitting: PropTypes.bool,
	formSubmissionStatus: PropTypes.string,
	handleFieldChange: PropTypes.func,
	handleSubmit: PropTypes.func,
	handleDelete: PropTypes.func,
};

export default withServerCredentialsForm( localize( ServerCredentialsForm ) );
