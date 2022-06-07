import { FormInputValidation } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import emailValidator from 'email-validator';
import React, { FormEvent, ReactElement, useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormInput from 'calypso/components/forms/form-text-input';
import Notice from 'calypso/components/notice';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import { ActionSection, StyledNextButton } from 'calypso/signup/steps/woocommerce-install';
import type { Step } from '../../types';
import './style.scss';

type FormFields = 'email' | 'password';

const EditEmail: Step = function EditEmail( { navigation } ) {
	const { goBack } = navigation;
	const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
	const { __ } = useI18n();
	const [ errors, setErrors ] = useState( {} as Record< FormFields, string > );
	const stepProgress = useSelect( ( select ) => select( ONBOARD_STORE ).getStepProgress() );
	const [ email, setEmail ] = useState( '' );
	const [ submitted, setSubmitted ] = useState( false );
	const [ sendError, setSendError ] = useState( '' );

	const headerText = __( 'Enter a new email address, and your current password' );

	const validate = (): boolean => {
		const errors = {} as Record< FormFields, string >;

		errors[ 'email' ] = ! emailValidator.validate( email )
			? __( 'Please add a valid email address' )
			: '';

		setErrors( errors );

		return Object.values( errors ).filter( Boolean ).length === 0;
	};

	const onSubmit = async ( event: FormEvent ) => {
		event.preventDefault();

		if ( ! validate() ) {
			return;
		}

		try {
			await wpcom.req.post( '/me/settings', {
				apiVersion: '1.1',
				user_email: email,
			} );

			setSubmitted( true );
		} catch ( err: any ) {
			setSendError( err.message );
		}
	};

	const getContent = () => {
		return (
			<>
				<form onSubmit={ onSubmit }>
					<FormFieldset>
						<FormLabel htmlFor="email">{ __( 'New email' ) }</FormLabel>
						<FormInput
							value={ email }
							name="email"
							id="email"
							onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) => {
								setErrors( {} as Record< FormFields, string > );
								setEmail( e.target.value );
							} }
							className={ errors[ 'email' ] ? 'is-error' : '' }
						/>
						<ControlError error={ errors[ 'email' ] ?? '' } />
					</FormFieldset>

					<ActionSection>
						{ ! submitted && (
							<StyledNextButton
								type="submit"
								disabled={ Object.values( errors ).filter( Boolean ).length > 0 }
							>
								{ __( 'Send a verification to my new email' ) }
							</StyledNextButton>
						) }
						{ sendError && (
							<Notice className="edit-email__error" showDismiss={ false } status="is-error">
								{ sendError }
							</Notice>
						) }
						{ submitted && (
							<Notice className="edit-email__notice" showDismiss={ false } status="is-info">
								{ __(
									'Your email change is pending. Please take a moment to check for an email with the subject "[WordPress.com] New Email Address" to confirm your change.'
								) }
							</Notice>
						) }
					</ActionSection>
				</form>
			</>
		);
	};

	return (
		<StepContainer
			stepName={ 'edit-email' }
			className={ `is-step-${ intent }` }
			skipButtonAlign={ 'top' }
			goBack={ goBack }
			isHorizontalLayout={ true }
			formattedHeader={
				<FormattedHeader
					id={ 'edit-email-header' }
					headerText={ headerText }
					subHeaderText={ __(
						"We'll send you an email to the new address to verify that you own it."
					) }
					align={ 'left' }
				/>
			}
			intent={ intent }
			stepContent={ getContent() }
			recordTracksEvent={ recordTracksEvent }
			stepProgress={ stepProgress }
		/>
	);
};

function ControlError( { error }: { error: string } ): ReactElement | null {
	if ( error ) {
		return <FormInputValidation isError={ true } isValid={ false } text={ error } />;
	}
	return null;
}

export default EditEmail;
