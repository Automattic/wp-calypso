import {
	smsCountryCodesQuery,
	setupTwoStepAuthSMSMutation,
	resendTwoStepAuthSMSCodeMutation,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { __experimentalVStack as VStack, Button, Card, CardBody } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import PhoneNumberInput, { type SecuritySMSNumber } from '../../components/phone-number-input';
import { SectionHeader } from '../../components/section-header';
import { validatePhone } from '../../utils/phone-number';
import VerifyCodeForm from '../security-two-step-auth/common/verify-code-form';
import type { UserSettings } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

type SMSSetupFormData = {
	phoneNumber: SecuritySMSNumber;
};

export default function SetupPhoneNumber( { userSettings }: { userSettings: UserSettings } ) {
	const router = useRouter();

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const { data: smsCountryCodes } = useSuspenseQuery( smsCountryCodesQuery() );

	const { mutate: setupTwoStepAuthSMS, isPending: isSetupSMSPending } = useMutation(
		setupTwoStepAuthSMSMutation()
	);
	const { mutate: resendTwoStepAuthSMSCode, isPending: isResending } = useMutation( {
		...resendTwoStepAuthSMSCodeMutation(),
		meta: {
			snackbar: {
				success: __( 'Verification code sent to your phone.' ),
				error: __( 'Failed to send verification code. Please try again.' ),
			},
		},
	} );

	const initialCountryCode = userSettings.two_step_sms_country;
	const initialPhoneNumber = userSettings.two_step_sms_phone_number || '';

	const countryCode =
		smsCountryCodes.find( ( countryCode ) => countryCode.code === initialCountryCode ) ||
		smsCountryCodes[ 0 ];

	const [ formData, setFormData ] = useState< SMSSetupFormData >( {
		phoneNumber: {
			phoneNumber: initialPhoneNumber,
			countryCode: countryCode.code,
			countryNumericCode: countryCode.numeric_code,
		},
	} );
	const [ showVerifyCode, setShowVerifyCode ] = useState( false );
	const [ isSMSResendThrottled, setIsSMSResendThrottled ] = useState( false );

	// Allow SMS requests after 60 seconds
	const handleThrottleSMSRequests = () => {
		setTimeout( () => {
			setIsSMSResendThrottled( false );
		}, 60000 );
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		const fullPhoneNumber = `${ formData.phoneNumber.countryNumericCode }${ formData.phoneNumber.phoneNumber }`;
		const validation = validatePhone( fullPhoneNumber );
		if ( validation.error ) {
			createErrorNotice( validation.message, {
				type: 'snackbar',
			} );
			return;
		}

		setIsSMSResendThrottled( true );

		setupTwoStepAuthSMS(
			{
				two_step_sms_country: formData.phoneNumber.countryCode,
				two_step_sms_phone_number: formData.phoneNumber.phoneNumber,
			},
			{
				onSuccess: () => {
					setShowVerifyCode( true );
					handleThrottleSMSRequests();
				},
				onError: ( e: Error ) => {
					const cause = e?.cause as { error?: string; message?: string };
					const error = cause?.error;
					const errorMessage =
						error === 'rate_limited'
							? __(
									'Unable to request a code via SMS right now. Please try again after one minute.'
							  )
							: cause?.message || __( 'Failed to save phone number. Please try again.' );
					createErrorNotice( errorMessage, {
						type: 'snackbar',
					} );
					setIsSMSResendThrottled( false );
				},
			}
		);
	};

	const handleResend = () => {
		setIsSMSResendThrottled( true );
		resendTwoStepAuthSMSCode( undefined, {
			onSuccess: () => {
				handleThrottleSMSRequests();
			},
			onError: () => {
				setIsSMSResendThrottled( false );
			},
		} );
	};

	const field: Field< SMSSetupFormData > = useMemo(
		() => ( {
			id: 'phoneNumber',
			type: 'text',
			label: __( 'Phone number' ),
			Edit: ( { data, onChange } ) => {
				return (
					<PhoneNumberInput
						data={ data.phoneNumber }
						onChange={ ( phoneNumber ) => onChange( { phoneNumber } ) }
						isDisabled={ isSetupSMSPending }
					/>
				);
			},
			// TODO: Add validation via isValid.custom.
			// There is currently a bug that prevents it from working.
			// For now, we're using the handleSubmit to validate the phone number.
		} ),
		[ isSetupSMSPending ]
	);

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					{ showVerifyCode ? (
						<>
							<SectionHeader
								title={ __( 'Verify code' ) }
								level={ 3 }
								description={ __(
									'A code has been sent to your device via SMS. You may request another code after one minute.'
								) }
							/>
							<VerifyCodeForm
								actionType="enable-two-step"
								primaryButtonText={ __( 'Continue' ) }
								resendButtonProps={ {
									onClick: handleResend,
									isBusy: isResending,
									disabled: isResending || isSMSResendThrottled,
								} }
								customField={ {
									hideLabelFromVision: true,
									placeholder: '12345678',
								} }
								onSuccess={ () => {
									createSuccessNotice( __( 'Two-step authentication enabled.' ), {
										type: 'snackbar',
									} );
								} }
								onError={ () => {
									createErrorNotice( __( 'Failed to enable two-step authentication.' ), {
										type: 'snackbar',
									} );
								} }
							/>
						</>
					) : (
						<>
							<SectionHeader
								title={ __( 'Enter phone number' ) }
								level={ 3 }
								description={ __(
									'We need your phone number to send you two-step authentication codes when you log in.'
								) }
							/>
							<form onSubmit={ handleSubmit }>
								<VStack spacing={ 4 }>
									<DataForm< SMSSetupFormData >
										data={ formData }
										fields={ [ field ] }
										form={ { layout: { type: 'regular' as const }, fields: [ field ] } }
										onChange={ ( edits: Partial< SMSSetupFormData > ) => {
											setFormData( ( data ) => ( { ...data, ...edits } ) );
										} }
									/>

									<ButtonStack justify="flex-start">
										<Button
											variant="primary"
											type="submit"
											isBusy={ isSetupSMSPending }
											disabled={
												! formData.phoneNumber.phoneNumber ||
												! formData.phoneNumber.countryCode ||
												isSetupSMSPending
											}
										>
											{ __( 'Continue' ) }
										</Button>

										<Button
											variant="tertiary"
											onClick={ () => router.navigate( { to: '/me/security/two-step-auth' } ) }
										>
											{ __( 'Cancel' ) }
										</Button>
									</ButtonStack>
								</VStack>
							</form>
						</>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
