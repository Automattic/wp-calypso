/** @format */
/* eslint-disable */
/**
 * External dependendies
 */
import React, { Component } from 'react';
import { get, isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormFieldset from 'components/forms/form-fieldset';
import FormSelect from 'components/forms/form-select';
import FormTextInput from 'components/forms/form-text-input';
import FormLabel from 'components/forms/form-label';
import FormTextArea from 'components/forms/form-textarea';
import FormInputValidation from 'components/forms/form-input-validation';
import FormPasswordInput from 'components/forms/form-password-input';

export class CredentialsForm extends Component {
	state = {
		showPrivateKeyField: false,
		form: {
			protocol: this.props.protocol,
			host: this.props.host,
			port: this.props.port,
			user: this.props.user,
			pass: this.props.pass,
			abspath: this.props.abspath,
			kpri: this.props.kpri,
		},
		formErrors: {
			host: false,
			port: false,
			user: false,
			pass: false,
			abspath: false,
		},
	};

	handleFieldChange = event => {
		this.setState( {
			form: { ...this.state.form, [ event.target.name ]: event.target.value },
			formErrors: { ...this.state.formErrors, [ event.target.name ]: false },
		} );
	};

	handleSubmit = () => {
		const { siteId, updateCredentials, translate } = this.props;

		const payload = {
			...this.state.form,
			role: 'main',
		};

		const errors = Object.assign(
			! payload.host && { host: translate( 'Please enter a valid server address.' ) },
			! payload.port && { port: translate( 'Please enter a valid server port.' ) },
			isNaN( payload.port ) && { port: translate( 'Port number must be numeric.' ) },
			! payload.user && { user: translate( 'Please enter your server username.' ) },
			! payload.pass && { pass: translate( 'Please enter your server password.' ) },
			! payload.abspath && { abspath: translate( 'Please enter a valid upload path.' ) }
		);

		return isEmpty( errors )
			? updateCredentials( siteId, payload )
			: this.setState( { formErrors: errors } );
	};

	togglePrivateKeyField = () =>
		this.setState( { showPrivateKeyField: ! this.state.showPrivateKeyField } );

	render() {
		const { formIsSubmitting, onCancel, translate } = this.props;

		const { showPrivateKeyField, formErrors } = this.state;

		return (
			<FormFieldset className="credentials-form">
				<table>
					<tbody>
						<tr>
							<td colSpan="2" className="credentials-form__protocol-field">
								<FormLabel>
									<div>{ translate( 'Credential Type' ) }</div>
									<FormSelect
										name="protocol"
										value={ get( this.state.form, 'protocol', 'ssh' ) }
										onChange={ this.handleFieldChange }
										disabled={ formIsSubmitting }
									>
										<option value="ssh">{ translate( 'SSH' ) }</option>
										<option value="sftp">{ translate( 'SFTP' ) }</option>
										<option value="ftp">{ translate( 'FTP' ) }</option>
									</FormSelect>
								</FormLabel>
							</td>
						</tr>
						<tr>
							<td className="credentials-form__host-field">
								<FormLabel>
									<div>{ translate( 'Server Address' ) }</div>
									<FormTextInput
										name="host"
										placeholder={ translate( 'yoursite.com' ) }
										value={ get( this.state.form, 'host', '' ) }
										onChange={ this.handleFieldChange }
										disabled={ formIsSubmitting }
										isError={ !! formErrors.host }
									/>
									{ formErrors.host && (
										<FormInputValidation isError={ true } text={ formErrors.host } />
									) }
								</FormLabel>
							</td>
							<td className="credentials-form__port-field">
								<FormLabel>
									<div>{ translate( 'Port Number' ) }</div>
									<FormTextInput
										name="port"
										placeholder={ translate( '22' ) }
										value={ get( this.state.form, 'port', '' ) }
										onChange={ this.handleFieldChange }
										disabled={ formIsSubmitting }
										isError={ !! formErrors.port }
									/>
									{ formErrors.port && (
										<FormInputValidation isError={ true } text={ formErrors.port } />
									) }
								</FormLabel>
							</td>
						</tr>
						<tr>
							<td colSpan="2" className="credentials-form__user-field">
								<FormLabel>
									<div>{ translate( 'Username' ) }</div>
									<FormTextInput
										name="user"
										placeholder={ translate( 'username' ) }
										value={ get( this.state.form, 'user', '' ) }
										onChange={ this.handleFieldChange }
										disabled={ formIsSubmitting }
										isError={ !! formErrors.user }
									/>
									{ formErrors.user && (
										<FormInputValidation isError={ true } text={ formErrors.user } />
									) }
								</FormLabel>
							</td>
						</tr>
						<tr>
							<td colSpan="2" className="credentials-form__pass-field">
								<FormLabel>
									<div>{ translate( 'Password' ) }</div>
									<FormPasswordInput
										name="pass"
										placeholder={ translate( 'password' ) }
										value={ get( this.state.form, 'pass', '' ) }
										onChange={ this.handleFieldChange }
										disabled={ formIsSubmitting }
										isError={ !! formErrors.pass }
									/>
									{ formErrors.pass && (
										<FormInputValidation isError={ true } text={ formErrors.pass } />
									) }
								</FormLabel>
							</td>
						</tr>
						<tr>
							<td colSpan="2" className="credentials-form__abspath-field">
								<FormLabel>
									<div>{ translate( 'Upload Path' ) }</div>
									<FormTextInput
										name="abspath"
										placeholder={ translate( '/public_html' ) }
										value={ get( this.state.form, 'abspath', '' ) }
										onChange={ this.handleFieldChange }
										disabled={ formIsSubmitting }
										isError={ !! formErrors.abspath }
									/>
									{ formErrors.abspath && (
										<FormInputValidation isError={ true } text={ formErrors.abspath } />
									) }
								</FormLabel>
							</td>
						</tr>
						<tr>
							<td colSpan="2" className="credentials-form__kpri-field">
								<FormLabel>
									<div>{ translate( 'Private Key' ) }</div>
									<Button disabled={ formIsSubmitting } onClick={ this.togglePrivateKeyField }>
										{ showPrivateKeyField
											? translate( 'Hide Private Key' )
											: translate( 'Show Private Key' ) }
									</Button>
									{ showPrivateKeyField && (
										<div>
											<FormTextArea
												name="kpri"
												value={ get( this.state.form, 'kpri', '' ) }
												onChange={ this.handleFieldChange }
												disabled={ formIsSubmitting }
											/>
											<p className="credentials-form__private-key-description">
												This field is only required if your host uses key based authentication.
											</p>
										</div>
									) }
								</FormLabel>
							</td>
						</tr>
						<tr>
							<td colSpan="2">
								<Button primary disabled={ formIsSubmitting } onClick={ this.handleSubmit }>
									{ translate( 'Save' ) }
								</Button>
								{ this.props.showCancelButton && (
									<Button
										disabled={ formIsSubmitting }
										onClick={ onCancel }
										className="credentials-form__cancel-button"
									>
										{ translate( 'Cancel' ) }
									</Button>
								) }
							</td>
						</tr>
					</tbody>
				</table>
			</FormFieldset>
		);
	}
}

export default localize( CredentialsForm );
