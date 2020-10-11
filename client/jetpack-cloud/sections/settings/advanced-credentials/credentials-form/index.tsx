/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useState, FormEventHandler } from 'react';

/**
 * Internal dependencies
 */
// import FormInputValidation from 'components/forms/form-input-validation';
import { Button } from '@automattic/components';
import { FormState } from '../form';
import { getHostInfoFromId } from '../host-info';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormPasswordInput from 'components/forms/form-password-input';
import FormSelect from 'components/forms/form-select';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextArea from 'components/forms/form-textarea';
import FormTextInput from 'components/forms/form-text-input';
import Gridicon from 'components/gridicon';
import InfoPopover from 'components/info-popover';
import InlineInfo from './inline-info';
import SegmentedControl from 'components/segmented-control';

/**
 * Style dependencies
 */
import './style.scss';

enum Mode {
	Password,
	PrivateKey,
}

interface Props {
	// formErrors: formErrorsState;
	disabled?: boolean;
	formState: FormState;
	handleFormChange: FormEventHandler< HTMLInputElement >;
	host: string;
}

const ServerCredentialsForm: FunctionComponent< Props > = ( {
	children,
	disabled = false,
	formState,
	handleFormChange,
	host,
} ) => {
	const translate = useTranslate();
	const [ mode, setMode ] = useState( Mode.Password );
	const hostInfo = getHostInfoFromId( host );

	const renderPasswordForm = () => (
		<div className="credentials-form__row credentials-form__user-pass">
			<FormFieldset className="credentials-form__username">
				<FormLabel htmlFor="server-username">{ translate( 'Server username' ) }</FormLabel>
				<FormTextInput
					name="user"
					id="server-username"
					placeholder={ translate( 'username' ) }
					value={ formState.user }
					onChange={ handleFormChange }
					disabled={ disabled }
					// isError={ !! formErrors.user }
					// Hint to LastPass not to attempt autofill
					data-lpignore="true"
				/>
				{ /* { formErrors.user && <FormInputValidation isError={ true } text={ formErrors.user } /> } */ }
			</FormFieldset>

			<FormFieldset className="credentials-form__password">
				<FormLabel htmlFor="server-password">{ translate( 'Server password' ) }</FormLabel>
				<FormPasswordInput
					name="pass"
					id="server-password"
					placeholder={ translate( 'password' ) }
					value={ formState.pass }
					onChange={ handleFormChange }
					disabled={ disabled }
					// isError={ !! formErrors.pass }
					// Hint to LastPass not to attempt autofill
					data-lpignore="true"
				/>
				{ /* { formErrors.pass && <FormInputValidation isError={ true } text={ formErrors.pass } /> } */ }
			</FormFieldset>
		</div>
	);

	const renderPrivateKeyForm = () => (
		<FormFieldset className="credentials-form__kpri">
			<FormLabel htmlFor="private-key">{ translate( 'Private key' ) }</FormLabel>
			<FormTextArea
				name="kpri"
				id="private-key"
				value={ formState.kpri }
				onChange={ handleFormChange }
				disabled={ disabled }
				className="credentials-form__private-key"
			/>
			<FormSettingExplanation>
				{ translate( 'Only non-encrypted private keys are supported.' ) }
			</FormSettingExplanation>
		</FormFieldset>
	);

	const getSubHeaderText = () => {
		if ( hostInfo !== null && hostInfo.inline !== undefined ) {
			return translate( 'Check the information icons for details on %(hostName)s', {
				args: {
					hostName: hostInfo?.name,
				},
			} );
		} else if ( hostInfo !== null && hostInfo.supportLink !== undefined ) {
			return translate(
				'Read through the {{a}}%(hostName)s support site{{/a}} to learn how to obtain your credentials.',
				{
					args: {
						hostName: hostInfo.name,
					},
					components: {
						a: <a target="_blank" rel="noopener noreferrer" href={ hostInfo.supportLink } />,
					},
				}
			);
		}
		return translate( 'Your hosting provider will be able to supply this information to you.' );
	};

	const renderCredentialLinks = () => {
		if ( hostInfo !== null && hostInfo.credentialLinks !== undefined ) {
			if ( 'ftp' === formState.protocol && hostInfo.credentialLinks.ftp !== undefined ) {
				return (
					<Button href={ hostInfo.credentialLinks.ftp } target="_blank">
						{ translate( 'Read the %(hostName)s credentials guide', {
							args: {
								hostName: hostInfo.name,
							},
						} ) }
						<Gridicon icon="external" />
					</Button>
				);
			}
			if ( 'ssh' === formState.protocol && hostInfo.credentialLinks.sftp !== undefined ) {
				return (
					<Button href={ hostInfo.credentialLinks.sftp } target="_blank">
						{ translate( 'Read the %(hostName)s credentials guide', {
							args: {
								hostName: hostInfo.name,
							},
						} ) }
						<Gridicon icon="external" />
					</Button>
				);
			}
		}
		return null;
	};

	return (
		<div className="credentials-form">
			<h3>{ translate( 'Provide your SSH, SFTP or FTP server credentials' ) }</h3>
			<p>{ getSubHeaderText() }</p>
			{ renderCredentialLinks() }
			<FormFieldset className="credentials-form__protocol-type">
				<div className="credentials-form__support-info">
					<FormLabel htmlFor="protocol-type">{ translate( 'Credential type' ) }</FormLabel>
					{ hostInfo?.inline?.credentialType && (
						<InfoPopover>
							<InlineInfo
								credentialType={ formState.protocol }
								info={ hostInfo.inline.credentialType }
							/>
						</InfoPopover>
					) }
				</div>
				<FormSelect
					name="protocol"
					id="protocol-type"
					value={ formState.protocol }
					onChange={ handleFormChange }
					disabled={ disabled }
				>
					<option value="ssh">{ translate( 'SSH/SFTP' ) }</option>
					<option value="ftp">{ translate( 'FTP' ) }</option>
				</FormSelect>
			</FormFieldset>

			<div className="credentials-form__row">
				<FormFieldset className="credentials-form__server-address">
					<div className="credentials-form__support-info">
						<FormLabel htmlFor="host-address">{ translate( 'Server address' ) }</FormLabel>
						{ hostInfo?.inline?.serverAddress && (
							<InfoPopover>
								<InlineInfo
									credentialType={ formState.protocol }
									info={ hostInfo.inline.serverAddress }
								/>
							</InfoPopover>
						) }
					</div>
					<FormTextInput
						name="host"
						id="host-address"
						placeholder={ translate( 'example.com' ) }
						value={ formState.host }
						onChange={ handleFormChange }
						disabled={ disabled }
						// isError={ !! formErrors.host }
					/>
					{ /* { formErrors.host && <FormInputValidation isError={ true } text={ formErrors.host } /> } */ }
				</FormFieldset>

				<FormFieldset className="credentials-form__port-number">
					<div className="credentials-form__support-info">
						<FormLabel htmlFor="server-port">{ translate( 'Port number' ) }</FormLabel>
						{ hostInfo?.inline?.portNumber && (
							<InfoPopover>
								<InlineInfo
									credentialType={ formState.protocol }
									info={ hostInfo.inline.portNumber }
								/>
							</InfoPopover>
						) }
					</div>
					<FormTextInput
						name="port"
						id="server-port"
						placeholder="22"
						value={ formState.port }
						onChange={ handleFormChange }
						disabled={ disabled }
						// isError={ !! formErrors.port }
					/>
					{ /* { formErrors.port && <FormInputValidation isError={ true } text={ formErrors.port } /> } */ }
				</FormFieldset>
			</div>

			<FormFieldset className="credentials-form__path">
				<div className="credentials-form__support-info">
					<FormLabel htmlFor="wordpress-path">
						{ translate( 'WordPress installation path' ) }
					</FormLabel>
					{ hostInfo?.inline?.installationPath && (
						<InfoPopover>
							<InlineInfo
								credentialType={ formState.protocol }
								info={ hostInfo.inline.installationPath }
							/>
						</InfoPopover>
					) }
				</div>
				<FormTextInput
					name="path"
					id="wordpress-path"
					placeholder="/public_html/wordpress-site/"
					value={ formState.path }
					onChange={ handleFormChange }
					disabled={ disabled }
					// isError={ !! formErrors.path }
				/>

				{ /* { formErrors.path && <FormInputValidation isError={ true } text={ formErrors.path } /> } */ }
			</FormFieldset>

			<div className="credentials-form__mode-control">
				<SegmentedControl>
					<SegmentedControl.Item
						selected={ mode === Mode.Password }
						onClick={ () => setMode( Mode.Password ) }
					>
						{ translate( 'Use password' ) }
					</SegmentedControl.Item>
					<SegmentedControl.Item
						selected={ mode === Mode.PrivateKey }
						onClick={ () => setMode( Mode.PrivateKey ) }
					>
						{ translate( 'Use private key' ) }
					</SegmentedControl.Item>
				</SegmentedControl>
			</div>

			{ mode === Mode.Password ? renderPasswordForm() : renderPrivateKeyForm() }

			<FormFieldset className="dialog__action-buttons credentials-form__buttons">
				{ children }
			</FormFieldset>
		</div>
	);
};

export default ServerCredentialsForm;
