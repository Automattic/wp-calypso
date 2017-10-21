/** @format */
/* eslint-disable */
/**
 * External dependendies
 */
import React, { Component } from 'react';
import { get } from 'lodash';
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

export class CredentialsForm extends Component {
	state = {
		showPublicKeyField: false,
		form: {
			protocol: this.props.protocol,
			host: this.props.host,
			port: this.props.port,
			user: this.props.user,
			pass: this.props.pass,
			abspath: this.props.abspath,
			kpub: this.props.kpub,
		},
		formErrors: {
			host: false,
			port: false,
			user: false,
			pass: false,
		},
	};

	componentWillReceiveProps( nextProps ) {
		const changedFields = [ 'protocol', 'host', 'port', 'user' ].filter(
			key => nextProps[ key ] !== this.props[ key ]
		);

		const changedForm = changedFields.reduce(
			( props, key ) => ( { ...props, [ key ]: nextProps[ key ] } ),
			{}
		);
		const resetErrors = changedFields.reduce(
			( props, key ) => ( { ...props, [ key ]: false } ),
			{}
		);

		this.setState( {
			form: { ...this.state.form, ...changedForm },
			formError: { ...this.state.formErrors, resetErrors },
		} );
	}

	handleFieldChange = event => {
		const formState = get( this.state, 'form', {} );
		const { formErrors } = this.state;

		formState[ event.target.name ] = event.target.value;
		formErrors[ event.target.name ] = false;
		this.setState( {
			form: formState,
			formErrors,
		} );
	};

	handleSubmit = () => {
		const { siteId, updateCredentials, translate } = this.props;

		const payload = {
			...this.state.form,
			role: 'main',
		};

		let error = false;
		const errors = this.state.formErrors;

		if ( '' === payload.host ) {
			errors.host = translate( 'Please enter a valid server address.' );
			error = true;
		}

		if ( '' === payload.port ) {
			errors.port = translate( 'Please enter a valid server port.' );
			error = true;
		}

		if ( isNaN( payload.port ) ) {
			errors.port = translate( 'Port number must be numeric.' );
			error = true;
		}

		if ( '' === payload.user ) {
			errors.user = translate( 'Please enter your server username.' );
			error = true;
		}

		if ( '' === payload.pass ) {
			errors.pass = translate( 'Please enter your server password.' );
			error = true;
		}

		if ( error ) {
			this.setState( { formErrors: errors } );
			return;
		}

		updateCredentials( siteId, payload );
	};

	togglePublicKeyField = () =>
		this.setState( { showPublicKeyField: ! this.state.showPublicKeyField } );

	render() {
		const { credentialsUpdating, onCancel, translate } = this.props;

		const { showPublicKeyField, formErrors } = this.state;

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
										disabled={ credentialsUpdating }
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
										disabled={ credentialsUpdating }
										isError={ !! formErrors.host }
									/>
									{ formErrors.host ? (
										<FormInputValidation isError={ true } text={ formErrors.host } />
									) : null }
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
										disabled={ credentialsUpdating }
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
										disabled={ credentialsUpdating }
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
									<FormTextInput
										name="pass"
										placeholder={ translate( 'password' ) }
										value={ get( this.state.form, 'pass', '' ) }
										onChange={ this.handleFieldChange }
										disabled={ credentialsUpdating }
										isError={ !! formErrors.pass }
									/>
									{ formErrors.pass && (
										<FormInputValidation isError={ true } text={ formErrors.pass } />
									) }
								</FormLabel>
							</td>
						</tr>
						<tr>
							<td colSpan="2" className="credentials-form__kpub-field">
								<FormLabel>
									<div>{ translate( 'Public Key' ) }</div>
									<Button disabled={ credentialsUpdating } onClick={ this.togglePublicKeyField }>
										{ showPublicKeyField ? (
											translate( 'Hide Public Key' )
										) : (
											translate( 'Show Public Key' )
										) }
									</Button>
									{ showPublicKeyField && (
										<FormTextArea
											name="kpub"
											value={ get( this.state.form, 'kpub', '' ) }
											onChange={ this.handleFieldChange }
											disabled={ credentialsUpdating }
										/>
									) }
								</FormLabel>
							</td>
						</tr>
						<tr>
							<td colSpan="2">
								<Button primary disabled={ credentialsUpdating } onClick={ this.handleSubmit }>
									{ translate( 'Save' ) }
								</Button>
								{ ! this.props.hasMainCredentials && (
									<Button
										disabled={ credentialsUpdating }
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
