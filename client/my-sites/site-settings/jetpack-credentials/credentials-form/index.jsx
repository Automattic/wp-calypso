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
import Gridicon from 'gridicons';

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

	handleFieldChange = ( { target: { name, value } } ) => {
		const changedProtocol = 'protocol' === name;
		const defaultPort = 'ftp' === value ? 21 : 22;

		const form = Object.assign(
			this.state.form,
			{ [ name ]: value },
			changedProtocol && { port: defaultPort }
		);

		this.setState( {
			form,
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

	handleDelete = () => this.props.deleteCredentials( this.props.siteId, this.props.role );

	togglePrivateKeyField = () =>
		this.setState( { showPrivateKeyField: ! this.state.showPrivateKeyField } );

	render() {
		const { formIsSubmitting, onCancel, translate } = this.props;

		const { showPrivateKeyField, formErrors } = this.state;

		return (
			<div>
				<FormFieldset>
					<FormLabel htmlFor="protocol-type">{ translate( 'Credential Type' ) }</FormLabel>
					<FormSelect
						name="protocol"
						id="protocol-type"
						value={ get( this.state.form, 'protocol', 'ssh' ) }
						onChange={ this.handleFieldChange }
						disabled={ formIsSubmitting }
					>
						<option value="ssh">{ translate( 'SSH' ) }</option>
						<option value="sftp">{ translate( 'SFTP' ) }</option>
						<option value="ftp">{ translate( 'FTP' ) }</option>
					</FormSelect>
				</FormFieldset>

				<div className="credentials-form__row">
					<FormFieldset className="credentials-form__server-address">
						<FormLabel htmlFor="host-address">{ translate( 'Server Address' ) }</FormLabel>
						<FormTextInput
							name="host"
							id="host-address"
							placeholder={ translate( 'YourGroovyDomain.com' ) }
							value={ get( this.state.form, 'host', '' ) }
							onChange={ this.handleFieldChange }
							disabled={ formIsSubmitting }
							isError={ !! formErrors.host }
						/>
						{ formErrors.host && <FormInputValidation isError={ true } text={ formErrors.host } /> }
					</FormFieldset>

					<FormFieldset className="credentials-form__port-number">
						<FormLabel htmlFor="server-port">{ translate( 'Port Number' ) }</FormLabel>
						<FormTextInput
							name="port"
							id="server-port"
							placeholder="22"
							value={ get( this.state.form, 'port', '' ) }
							onChange={ this.handleFieldChange }
							disabled={ formIsSubmitting }
							isError={ !! formErrors.port }
						/>
						{ formErrors.port && <FormInputValidation isError={ true } text={ formErrors.port } /> }
					</FormFieldset>
				</div>

				<div className="credentials-form__row">
					<FormFieldset className="credentials-form__username">
						<FormLabel htmlFor="server-username">{ translate( 'Username' ) }</FormLabel>
						<FormTextInput
							name="user"
							id="server-username"
							placeholder={ translate( 'username' ) }
							value={ get( this.state.form, 'user', '' ) }
							onChange={ this.handleFieldChange }
							disabled={ formIsSubmitting }
							isError={ !! formErrors.user }
						/>
						{ formErrors.user && <FormInputValidation isError={ true } text={ formErrors.user } /> }
					</FormFieldset>

					<FormFieldset className="credentials-form__password">
						<FormLabel htmlFor="server-password">{ translate( 'Password' ) }</FormLabel>
						<FormPasswordInput
							name="pass"
							id="server-password"
							placeholder={ translate( 'password' ) }
							value={ get( this.state.form, 'pass', '' ) }
							onChange={ this.handleFieldChange }
							disabled={ formIsSubmitting }
							isError={ !! formErrors.pass }
						/>
						{ formErrors.pass && <FormInputValidation isError={ true } text={ formErrors.pass } /> }
					</FormFieldset>
				</div>

				<FormFieldset>
					<FormLabel htmlFor="wordpress-path">{ translate( 'Upload Path' ) }</FormLabel>
					<FormTextInput
						name="abspath"
						id="wordpress-path"
						placeholder="/public_html/wordpress-site/"
						value={ get( this.state.form, 'abspath', '' ) }
						onChange={ this.handleFieldChange }
						disabled={ formIsSubmitting }
						isError={ !! formErrors.abspath }
					/>
					{ formErrors.abspath && (
						<FormInputValidation isError={ true } text={ formErrors.abspath } />
					) }
				</FormFieldset>

				<FormFieldset>
					<FormLabel>{ translate( 'Private Key' ) }</FormLabel>
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
								className="credentials-form__private-key"
							/>
							<p className="form-setting-explanation">
								{ translate(
									'This field is only required if your host uses key based authentication.'
								) }
							</p>
						</div>
					) }
				</FormFieldset>

				<FormFieldset>
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
					{ this.props.showDeleteButton && (
						<Button
							borderless={ true }
							disabled={ formIsSubmitting }
							onClick={ this.handleDelete }
							className="credentials-form__delete-button"
						>
							<Gridicon icon="trash" size={ 18 } />
							{ translate( 'Delete' ) }
						</Button>
					) }
				</FormFieldset>
			</div>
		);
	}
}

export default localize( CredentialsForm );
