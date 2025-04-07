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
import { SiteAddressField } from './site-address-field';
import { SpecialInstructions } from './special-instructions';

interface CredentialsFormProps {
	onSubmit: (
		siteInfo?: UrlData | undefined,
		applicationPasswordsInfo?: ApplicationPasswordsInfo
	) => void;
}

export const CredentialsForm: FC< CredentialsFormProps > = ( { onSubmit } ) => {
	const translate = useTranslate();

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

	let errorMessage;
	if ( errors.root && errors.root.type !== 'manual' && errors.root.message ) {
		errorMessage = errors.root.message;
	} else if ( queryError === 'ticket-creation' ) {
		errorMessage = translate(
			'We ran into a problem submitting your details. Please try again shortly.'
		);
	}

	const getContinueButtonText = () => {
		if ( isBusy ) {
			return translate( 'Scanning site' );
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

	const showSpecialInstructions = accessMethod === 'backup';

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
		</form>
	);
};
