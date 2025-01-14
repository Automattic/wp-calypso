import { isEnabled } from '@automattic/calypso-config';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { NextButton } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import { UrlData } from 'calypso/blocks/import/types';
import Notice from 'calypso/components/notice';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useCredentialsForm } from '../hooks/use-credentials-form';
import { ApplicationPasswordsInfo } from '../types';
import { AccessMethodPicker } from './access-method-picker';
import { BackupFileField } from './backup-file-field';
import { ErrorMessage } from './error-message';
import { PasswordField } from './password-field';
import { SiteAddressField } from './site-address-field';
import { SpecialInstructions } from './special-instructions';
import { UsernameField } from './username-field';

interface CredentialsFormProps {
	onSubmit: (
		siteInfo?: UrlData | undefined,
		applicationPasswordsInfo?: ApplicationPasswordsInfo
	) => void;
	onSkip: () => void;
}

export const CredentialsForm: FC< CredentialsFormProps > = ( { onSubmit, onSkip } ) => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();

	const {
		control,
		errors,
		accessMethod,
		isBusy,
		submitHandler,
		canBypassVerification,
		clearErrors,
	} = useCredentialsForm( onSubmit );

	const queryError = useQuery().get( 'error' ) || null;

	const applicationPasswordEnabled = isEnabled( 'automated-migration/application-password' );

	let errorMessage;
	if ( errors.root && errors.root.type !== 'manual' && errors.root.message ) {
		errorMessage = errors.root.message;
	} else if ( queryError === 'ticket-creation' ) {
		errorMessage = translate(
			'We ran into a problem submitting your details. Please try again shortly.'
		);
	}

	const getContinueButtonText = () => {
		if ( isBusy && ! canBypassVerification ) {
			const hasScanningTranslation = hasEnTranslation( 'Scanning site' );
			if ( applicationPasswordEnabled && hasScanningTranslation ) {
				return translate( 'Scanning site' );
			}
			return translate( 'Verifying credentials' );
		}
		if ( canBypassVerification ) {
			return translate( 'Continue anyways' );
		}

		return translate( 'Continue' );
	};

	const onSubmitLocal = ( e: React.FormEvent< HTMLFormElement > ) => {
		e.preventDefault();
		clearErrors();
		submitHandler();
	};

	const showSpecialInstructions = ! applicationPasswordEnabled || accessMethod === 'backup';

	return (
		<form className="site-migration-credentials__form" onSubmit={ onSubmitLocal }>
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
						<SiteAddressField control={ control } errors={ errors } />
						{ ! applicationPasswordEnabled && (
							<>
								<UsernameField control={ control } errors={ errors } />
								<PasswordField control={ control } errors={ errors } />
							</>
						) }
					</div>
				) }

				{ accessMethod === 'backup' && <BackupFileField control={ control } errors={ errors } /> }

				{ showSpecialInstructions && <SpecialInstructions control={ control } errors={ errors } /> }

				<ErrorMessage
					error={ errors.root && errors.root.type === 'manual' ? errors.root : undefined }
				/>

				<div className="site-migration-credentials__submit">
					<NextButton disabled={ isBusy } type="submit">
						{ getContinueButtonText() }
					</NextButton>
				</div>
			</div>

			<div className="site-migration-credentials__skip">
				<button
					className="button navigation-link step-container__navigation-link has-underline is-borderless"
					onClick={ onSkip }
					type="button"
				>
					{ translate( 'I need help, please contact me' ) }
				</button>
			</div>
		</form>
	);
};
