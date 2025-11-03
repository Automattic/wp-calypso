import { Button, Icon } from '@wordpress/components';
import { check, edit, copy } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { FC, ReactNode, useState } from 'react';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import FormPasswordInput from 'calypso/components/forms/form-password-input';
import FormRadio from 'calypso/components/forms/form-radio';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { AccordionNotice } from '../components/accordion-notice';

interface StepShareSSHAccessProps {
	authMethod: 'password' | 'key';
	username: string;
	password: string;
	sshPublicKey: string;
	isGeneratingKey: boolean;
	isUsernameLockedForKey: boolean;
	hostDisplayName?: string;
	generateError?: Error | null;
	error?: Error | null;
	onAuthMethodChange: ( method: 'password' | 'key' ) => void;
	onUsernameChange: ( username: string ) => void;
	onPasswordChange: ( password: string ) => void;
	onGenerateSSHKey: () => void;
	onEditUsername: () => void;
	helpLink: ReactNode;
	isTransferring: boolean;
	shouldGenerateKey: boolean;
	isInputDisabled: boolean;
}

export const StepShareSSHAccess: FC< StepShareSSHAccessProps > = ( {
	authMethod,
	username,
	password,
	sshPublicKey,
	isGeneratingKey,
	isUsernameLockedForKey,
	hostDisplayName,
	generateError,
	error,
	onAuthMethodChange,
	onUsernameChange,
	onPasswordChange,
	onGenerateSSHKey,
	onEditUsername,
	helpLink,
	isTransferring,
	shouldGenerateKey,
	isInputDisabled,
} ) => {
	const translate = useTranslate();
	const [ copied, setCopied ] = useState( false );

	return (
		<div className="site-migration-ssh__step-share-ssh">
			<p className="site-migration-ssh__step-share-ssh-description">
				{ translate(
					"We need SSH access to start transferring your site. Don't worry, your information is encrypted and deleted as soon as we're done."
				) }
			</p>

			{ helpLink }

			{ error && (
				<AccordionNotice variant="error">
					{ translate(
						'We ran into a problem starting the migration. Please check your details and try again.'
					) }
				</AccordionNotice>
			) }

			<div className="site-migration-ssh__step-share-ssh-auth-method">
				<label className="site-migration-ssh__step-share-ssh-label">
					{ translate( 'Authentication method' ) }
				</label>
				<div className="site-migration-ssh__step-share-ssh-radio-group">
					<div className="site-migration-ssh__step-share-ssh-radio-option">
						<FormRadio
							name="auth-method"
							value="password"
							disabled={ isInputDisabled }
							checked={ authMethod === 'password' }
							onChange={ () => onAuthMethodChange( 'password' ) }
							label={ translate( 'Username and password' ) }
						/>
					</div>

					<div className="site-migration-ssh__step-share-ssh-radio-option">
						<FormRadio
							name="auth-method"
							value="key"
							disabled={ isInputDisabled }
							checked={ authMethod === 'key' }
							onChange={ () => onAuthMethodChange( 'key' ) }
							label={ translate( 'SSH key' ) }
						/>
					</div>
				</div>
			</div>

			<div className="site-migration-ssh__step-share-ssh-form">
				{ authMethod === 'password' && (
					<>
						<div>
							<label htmlFor="ssh-username" className="site-migration-ssh__step-share-ssh-label">
								{ translate( 'SSH username' ) }
							</label>
							<FormTextInput
								id="ssh-username"
								value={ username }
								onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) =>
									onUsernameChange( e.target.value )
								}
								placeholder={ translate( 'Enter your SSH username' ) }
								disabled={ isInputDisabled }
								className={ isInputDisabled ? 'is-disabled' : '' }
							/>
						</div>

						<div>
							<label htmlFor="ssh-password" className="site-migration-ssh__step-share-ssh-label">
								{ translate( 'SSH password' ) }
							</label>
							<FormPasswordInput
								id="ssh-password"
								value={ password }
								onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) =>
									onPasswordChange( e.target.value )
								}
								placeholder={ translate( 'Enter your SSH password' ) }
								disabled={ isInputDisabled }
								className={ isInputDisabled ? 'is-disabled' : '' }
							/>
						</div>
					</>
				) }

				{ authMethod === 'key' && (
					<>
						<div className="site-migration-ssh__step-share-ssh-username-container">
							<div className="site-migration-ssh__step-share-ssh-username-field">
								<label htmlFor="ssh-username" className="site-migration-ssh__step-share-ssh-label">
									{ translate( 'SSH username' ) }
								</label>
								<FormTextInput
									id="ssh-username"
									value={ username }
									onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) =>
										onUsernameChange( e.target.value )
									}
									placeholder={ translate( 'Enter your SSH username' ) }
									disabled={ isUsernameLockedForKey }
									className={ isUsernameLockedForKey ? 'is-disabled' : '' }
								/>
							</div>
							{ isUsernameLockedForKey && (
								<Button
									icon={ edit }
									label={ translate( 'Edit username' ) }
									className="site-migration-ssh__step-share-ssh-edit-button"
									onClick={ onEditUsername }
								/>
							) }
						</div>

						{ generateError && (
							<AccordionNotice variant="error">
								{ translate(
									'We ran into a problem generating the SSH key. Please check your details and try again.'
								) }
							</AccordionNotice>
						) }

						{ ! sshPublicKey && (
							<div>
								<Button
									variant="secondary"
									onClick={ onGenerateSSHKey }
									disabled={
										! username || isGeneratingKey || ( isTransferring && shouldGenerateKey )
									}
									isBusy={ isGeneratingKey || ( isTransferring && shouldGenerateKey ) }
								>
									{ translate( 'Generate SSH key' ) }
								</Button>
							</div>
						) }

						{ sshPublicKey && (
							<div>
								<label
									htmlFor="ssh-public-key"
									className="site-migration-ssh__step-share-ssh-label"
								>
									{ translate( 'SSH public key' ) }
								</label>
								<div className="site-migration-ssh__step-share-ssh-key-container">
									<textarea
										id="ssh-public-key"
										className="site-migration-ssh__step-share-ssh-textarea"
										value={ sshPublicKey }
										readOnly
										rows={ 5 }
									/>
									<ClipboardButton
										text={ sshPublicKey }
										transparent
										className="site-migration-ssh__step-share-ssh-copy-button"
										onCopy={ () => {
											setCopied( true );
											setTimeout( () => setCopied( false ), 2000 );
										} }
									>
										<Icon icon={ copied ? check : copy } />
									</ClipboardButton>
								</div>
								<p className="site-migration-ssh__step-share-ssh-help-text">
									{ hostDisplayName
										? translate(
												'Copy and paste your SSH key in your %(hostName)s account. Then come back to start your migration.',
												{
													args: { hostName: hostDisplayName },
												}
										  )
										: translate(
												'Copy and paste your SSH key in your hosting account. Then come back to start your migration.'
										  ) }
								</p>
							</div>
						) }
					</>
				) }
			</div>
		</div>
	);
};
