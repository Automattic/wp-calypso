import { useTranslate } from 'i18n-calypso';
import { FC, ReactNode } from 'react';
import FormPasswordInput from 'calypso/components/forms/form-password-input';
import FormRadio from 'calypso/components/forms/form-radio';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { AccordionNotice } from '../components/accordion-notice';

interface StepShareSSHAccessProps {
	authMethod: 'password' | 'key';
	username: string;
	password: string;
	error?: Error | null;
	onAuthMethodChange: ( method: 'password' | 'key' ) => void;
	onUsernameChange: ( username: string ) => void;
	onPasswordChange: ( password: string ) => void;
	helpLink: ReactNode;
}

export const StepShareSSHAccess: FC< StepShareSSHAccessProps > = ( {
	authMethod,
	username,
	password,
	error,
	onAuthMethodChange,
	onUsernameChange,
	onPasswordChange,
	helpLink,
} ) => {
	const translate = useTranslate();

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
				<p className="site-migration-ssh__step-share-ssh-auth-label">
					{ translate( 'Authentication method' ) }
				</p>
				<div className="site-migration-ssh__step-share-ssh-radio-group">
					<div className="site-migration-ssh__step-share-ssh-radio-option">
						<FormRadio
							name="auth-method"
							value="password"
							checked={ authMethod === 'password' }
							onChange={ () => onAuthMethodChange( 'password' ) }
							label={ translate( 'Username and password' ) }
						/>
					</div>

					<div className="site-migration-ssh__step-share-ssh-radio-option">
						<FormRadio
							name="auth-method"
							value="key"
							checked={ authMethod === 'key' }
							onChange={ () => onAuthMethodChange( 'key' ) }
							label={ translate( 'SSH key' ) }
						/>
					</div>
				</div>
			</div>

			<div className="site-migration-ssh__step-share-ssh-form">
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
					/>
				</div>

				{ authMethod === 'password' ? (
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
						/>
					</div>
				) : (
					<>{ /* Private key form */ }</>
				) }
			</div>
		</div>
	);
};
