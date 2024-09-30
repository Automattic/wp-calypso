import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { NextButton } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import Notice from 'calypso/components/notice';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useCredentialsForm } from '../hooks/use-credentials-form';
import { AccessMethodPicker } from './access-method-picker';
import { BackupFileField } from './backup-file-field';
import { ErrorMessage } from './error-message';
import { PasswordField } from './password-field';
import { SiteAddressField } from './site-address-field';
import { SpecialInstructions } from './special-instructions';
import { UsernameField } from './username-field';

interface CredentialsFormProps {
	onSubmit: ( platform?: string ) => void;
	onSkip: () => void;
}

export const CredentialsForm: FC< CredentialsFormProps > = ( { onSubmit, onSkip } ) => {
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();
	const {
		handleSubmit,
		control,
		errors,
		accessMethod,
		isPending,
		isSiteInfoLoading,
		submitHandler,
		importSiteQueryParam,
		getContinueButtonText,
	} = useCredentialsForm( onSubmit );

	const queryError = useQuery().get( 'error' ) || null;

	let errorMessage;
	if ( isEnglishLocale && errors.root && errors.root.type !== 'manual' && errors.root.message ) {
		errorMessage = errors.root.message;
	} else if ( queryError === 'ticket-creation' ) {
		errorMessage = translate(
			'We ran into a problem submitting your details. Please try again shortly.'
		);
	}
	return (
		<form className="site-migration-credentials__form" onSubmit={ handleSubmit( submitHandler ) }>
			{ errorMessage && (
				<Notice
					className="site-migration-credentials__error-notice"
					status="is-warning"
					showDismiss={ false }
				>
					{ errorMessage }
				</Notice>
			) }
			<div className="site-migration-credentials__content">
				<AccessMethodPicker control={ control } />

				<hr />

				{ accessMethod === 'credentials' && (
					<div className="site-migration-credentials">
						<SiteAddressField
							control={ control }
							errors={ errors }
							importSiteQueryParam={ importSiteQueryParam }
						/>
						<UsernameField control={ control } errors={ errors } />
						<PasswordField control={ control } errors={ errors } />
					</div>
				) }

				{ accessMethod === 'backup' && <BackupFileField control={ control } errors={ errors } /> }

				<SpecialInstructions control={ control } errors={ errors } />

				<ErrorMessage
					error={ errors.root && errors.root.type === 'manual' ? errors.root : undefined }
				/>

				<div className="site-migration-credentials__submit">
					<NextButton disabled={ isPending || isSiteInfoLoading } type="submit">
						{ getContinueButtonText() }
					</NextButton>
				</div>
			</div>

			<div className="site-migration-credentials__skip">
				<button
					className="button navigation-link step-container__navigation-link has-underline is-borderless"
					disabled={ isPending || isSiteInfoLoading }
					onClick={ onSkip }
					type="button"
				>
					{ isEnglishLocale
						? translate( 'I need help, please contact me' )
						: translate( 'Skip, I need help providing access' ) }
				</button>
			</div>
		</form>
	);
};
