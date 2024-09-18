import { Card } from '@automattic/components';
import { NextButton } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import Banner from 'calypso/components/banner';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useCredentialsForm } from '../use-credentials-form';
import { AccessMethodPicker } from './access-method-picker';
import { BackupFileField } from './backup-file-field';
import { ErrorMessage } from './error-message';
import { PasswordField } from './password-field';
import { SiteAddressField } from './site-address-field';
import { SpecialInstructions } from './special-instructions';
import { UsernameField } from './username-field';

interface CredentialsFormProps {
	onSubmit: () => void;
	onSkip: () => void;
}

export const CredentialsForm: FC< CredentialsFormProps > = ( { onSubmit, onSkip } ) => {
	const translate = useTranslate();
	const {
		handleSubmit,
		control,
		errors,
		accessMethod,
		isPending,
		submitHandler,
		importSiteQueryParam,
	} = useCredentialsForm( onSubmit );

	const queryError = useQuery().get( 'error' ) || null;

	return (
		<form onSubmit={ handleSubmit( submitHandler ) }>
			{ queryError === 'ticket-creation' && (
				<Banner
					className="site-migration-credentials__error-banner"
					showIcon={ false }
					title=""
					description={ translate(
						'We ran into a problem submitting your details. Please try again shortly.'
					) }
				></Banner>
			) }
			<Card>
				<AccessMethodPicker control={ control } />

				<hr />

				{ accessMethod === 'credentials' && (
					<div className="site-migration-credentials">
						<div className="site-migration-credentials__form">
							<SiteAddressField
								control={ control }
								error={ errors.siteAddress?.message }
								importSiteQueryParam={ importSiteQueryParam }
							/>
							<UsernameField control={ control } error={ errors.username?.message } />
							<PasswordField control={ control } error={ errors.password?.message } />
						</div>
					</div>
				) }

				{ accessMethod === 'backup' && (
					<BackupFileField control={ control } error={ errors.backupFileLocation?.message } />
				) }

				<SpecialInstructions control={ control } error={ errors.root?.message } />

				<ErrorMessage error={ errors.root?.message } />

				<div className="site-migration-credentials__submit">
					<NextButton disabled={ isPending } type="submit">
						{ translate( 'Continue' ) }
					</NextButton>
				</div>
			</Card>

			<div className="site-migration-credentials__skip">
				<button
					className="button navigation-link step-container__navigation-link has-underline is-borderless"
					disabled={ isPending }
					onClick={ onSkip }
					type="button"
				>
					{ translate( 'Skip, I need help providing access' ) }
				</button>
			</div>
		</form>
	);
};
