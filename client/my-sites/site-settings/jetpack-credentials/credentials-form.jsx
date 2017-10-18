/** @format */
/* eslint-disable */
/**
 * External dependendies
 */
import React from 'react';
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

export const CredentialsForm = ( { props, state } ) => {
	const { translate } = props;
	const { showPublicKeyField, formErrors } = state;

	return (
		<FormFieldset>
			<table className="site-settings__form-table">
				<tbody>
					<tr>
						<td colSpan="2">
							<FormLabel>
								<div>{ translate( 'Credential Type' ) }</div>
								<FormSelect
									name="protocol"
									value={ get( state.form, 'protocol', 'ssh' ) }
									onChange={ handleFieldChange }
									disabled={ props.credentialsUpdating }
								>
									<option value="ssh">{ translate( 'SSH' ) }</option>
									<option value="sftp">{ translate( 'SFTP' ) }</option>
									<option value="ftp">{ translate( 'FTP' ) }</option>
								</FormSelect>
							</FormLabel>
						</td>
					</tr>
					<tr>
						<td className="site-settings__host-field">
							<FormLabel>
								<div>{ translate( 'Server Address' ) }</div>
								<FormTextInput
									name="host"
									placeholder={ translate( 'yoursite.com' ) }
									value={ get( state.form, 'host', '' ) }
									onChange={ handleFieldChange }
									disabled={ props.credentialsUpdating }
									isError={ !! formErrors.host }
								/>
								{ formErrors.host ? (
									<FormInputValidation isError={ true } text={ formErrors.host } />
								) : null }
							</FormLabel>
						</td>
						<td className="site-settings__port-field">
							<FormLabel>
								<div>{ translate( 'Port Number' ) }</div>
								<FormTextInput
									name="port"
									placeholder={ translate( '22' ) }
									value={ get( state.form, 'port', '' ) }
									onChange={ handleFieldChange }
									disabled={ props.credentialsUpdating }
									isError={ !! formErrors.port }
								/>
								{ formErrors.port ? (
									<FormInputValidation isError={ true } text={ formErrors.port } />
								) : null }
							</FormLabel>
						</td>
					</tr>
					<tr>
						<td colSpan="2">
							<FormLabel>
								<div>{ translate( 'Username' ) }</div>
								<FormTextInput
									name="user"
									placeholder={ translate( 'username' ) }
									value={ get( state.form, 'user', '' ) }
									onChange={ handleFieldChange }
									disabled={ props.credentialsUpdating }
									isError={ !! formErrors.user }
								/>
								{ formErrors.user ? (
									<FormInputValidation isError={ true } text={ formErrors.user } />
								) : null }
							</FormLabel>
						</td>
					</tr>
					<tr>
						<td colSpan="2">
							<FormLabel>
								<div>{ translate( 'Password' ) }</div>
								<FormTextInput
									name="pass"
									placeholder={ translate( 'password' ) }
									value={ get( state.form, 'pass', '' ) }
									onChange={ handleFieldChange }
									disabled={ props.credentialsUpdating }
									isError={ !! formErrors.pass }
								/>
								{ formErrors.pass ? (
									<FormInputValidation isError={ true } text={ formErrors.pass } />
								) : null }
							</FormLabel>
						</td>
					</tr>
					<tr>
						<td colSpan="2">
							<FormLabel>
								<div>{ translate( 'Public Key' ) }</div>
								<Button disabled={ props.credentialsUpdating } onClick={ togglePublicKeyField }>
									{ showPublicKeyField ? (
										translate( 'Hide Public Key' )
									) : (
										translate( 'Show Public Key' )
									) }
								</Button>
								{ showPublicKeyField ? (
									<FormTextArea
										name="kpub"
										value={ get( state.form, 'kpub', '' ) }
										onChange={ handleFieldChange }
										disabled={ props.credentialsUpdating }
									/>
								) : null }
							</FormLabel>
						</td>
					</tr>
					<tr>
						<td colSpan="2">
							{ ! props.hasMainCredentials ? (
								<Button disabled={ props.credentialsUpdating } onClick={ resetSetup }>
									{ translate( 'Cancel' ) }
								</Button>
							) : null }
							<Button primary disabled={ props.credentialsUpdating } onClick={ handleSubmit }>
								{ translate( 'Save' ) }
							</Button>
						</td>
					</tr>
				</tbody>
			</table>
		</FormFieldset>
	);
};

export default localize( CredentialsForm );
