import { FormInputValidation, FormLabel } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import emailValidator from 'email-validator';
import { ChangeEvent, FormEvent, useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInput from 'calypso/components/forms/form-text-input';
import Notice from 'calypso/components/notice';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import { ActionSection, StyledNextButton } from 'calypso/signup/steps/woocommerce-install';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
import './style.scss';

type FormFields = 'email' | 'password';

const EditEmail: Step = function EditEmail( { navigation } ) {
	const { goBack, submit } = navigation;
	const intent = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
		[]
	);
	const { __ } = useI18n();
	const [ errors, setErrors ] = useState( {} as Record< FormFields, string > );
	const stepProgress = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getStepProgress(),
		[]
	);
	const { setEditEmail } = useDispatch( ONBOARD_STORE );
	const [ email, setEmail ] = useState( '' );
	const [ sendError, setSendError ] = useState( '' );

	const headerText = __( 'Enter a new email address' );

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

			await setEditEmail( email );

			submit?.();
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
							onChange={ ( e: ChangeEvent< HTMLInputElement > ) => {
								setErrors( {} as Record< FormFields, string > );
								setEmail( e.target.value );
							} }
							className={ errors[ 'email' ] ? 'is-error' : '' }
						/>
						<ControlError error={ errors[ 'email' ] ?? '' } />
					</FormFieldset>

					<ActionSection>
						<StyledNextButton
							type="submit"
							disabled={ Object.values( errors ).filter( Boolean ).length > 0 }
						>
							{ __( 'Send a verification to my new email' ) }
						</StyledNextButton>
						{ sendError && (
							<Notice className="edit-email__error" showDismiss={ false } status="is-error">
								{ sendError }
							</Notice>
						) }
					</ActionSection>
				</form>
			</>
		);
	};

	return (
		<StepContainer
			stepName="edit-email"
			className={ `is-step-${ intent }` }
			skipButtonAlign="top"
			goBack={ goBack }
			isHorizontalLayout={ true }
			formattedHeader={
				<FormattedHeader
					id="edit-email-header"
					headerText={ headerText }
					subHeaderText={ __(
						"We'll send you an email to the new address to verify that you own it."
					) }
					align="left"
				/>
			}
			intent={ intent }
			stepContent={ getContent() }
			recordTracksEvent={ recordTracksEvent }
			stepProgress={ stepProgress }
		/>
	);
};

function ControlError( { error }: { error: string } ) {
	if ( error ) {
		return <FormInputValidation isError={ true } isValid={ false } text={ error } />;
	}
	return null;
}

export default EditEmail;
