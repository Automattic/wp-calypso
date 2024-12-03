import { NextButton } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import Notice from 'calypso/components/notice';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { ErrorMessage } from '../../site-migration-credentials/components/error-message';
import { PasswordField } from '../../site-migration-credentials/components/password-field';
import { SpecialInstructions } from '../../site-migration-credentials/components/special-instructions';
import { UsernameField } from '../../site-migration-credentials/components/username-field';
import { useFallbackCredentialsForm } from '../hooks/use-credentials-form';

interface CredentialsFormProps {
	onSubmit: ( from?: string ) => void;
	onSkip: () => void;
}

export const CredentialsForm: FC< CredentialsFormProps > = ( { onSubmit, onSkip } ) => {
	const translate = useTranslate();
	const { control, errors, isBusy, submitHandler, canBypassVerification } =
		useFallbackCredentialsForm( onSubmit );

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
		if ( isBusy && ! canBypassVerification ) {
			return translate( 'Verifying credentials' );
		}
		if ( canBypassVerification ) {
			return translate( 'Continue anyway' );
		}

		return translate( 'Continue' );
	};

	return (
		<form className="site-migration-credentials__form" onSubmit={ submitHandler }>
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
				<div className="site-migration-credentials">
					<UsernameField control={ control } errors={ errors } />
					<PasswordField control={ control } errors={ errors } />
				</div>

				<SpecialInstructions control={ control } errors={ errors } />

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
