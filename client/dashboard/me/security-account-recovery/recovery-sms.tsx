import {
	accountRecoveryQuery,
	updateAccountRecoverySMSMutation,
	removeAccountRecoverySMSMutation,
	resendAccountRecoverySMSValidationMutation,
	validateAccountRecoverySMSCodeMutation,
	smsCountryCodesQuery,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalConfirmDialog as ConfirmDialog,
	Button,
	Card,
	CardBody,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import Notice from '../../components/notice';
import { SectionHeader } from '../../components/section-header';
import { validatePhone } from '../../utils/phone-number';
import PhoneNumberInput from './phone-number-input';
import type { SecuritySMSFormData } from './types';
import type { Field } from '@wordpress/dataviews';

const initialFormData: SecuritySMSFormData = {
	smsNumber: {
		countryCode: '',
		phoneNumber: '',
		countryNumericCode: '',
	},
	smsCode: '',
};

export default function RecoverySMS() {
	const { data: accountRecoveryData } = useSuspenseQuery( accountRecoveryQuery() );
	const { data: smsCountryCodes } = useSuspenseQuery( smsCountryCodesQuery() );

	const { mutate: validateSMS, isPending: isValidateSMSPending } = useMutation(
		updateAccountRecoverySMSMutation()
	);
	const { mutate: removeSMS, isPending: isRemoveSMSPending } = useMutation(
		removeAccountRecoverySMSMutation()
	);
	const { mutate: resendValidation, isPending: isResendValidationPending } = useMutation(
		resendAccountRecoverySMSValidationMutation()
	);
	const { mutate: validateSMSCode, isPending: isValidateSMSCodePending } = useMutation(
		validateAccountRecoverySMSCodeMutation()
	);

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const accountRecoveryPhone = accountRecoveryData.phone;

	const [ formData, setFormData ] = useState< SecuritySMSFormData >( {
		smsNumber: {
			phoneNumber: accountRecoveryPhone?.number || '',
			countryCode: accountRecoveryPhone?.country_code || smsCountryCodes[ 0 ].code,
			countryNumericCode:
				accountRecoveryPhone?.country_numeric_code || smsCountryCodes[ 0 ].numeric_code,
		},
		smsCode: '',
	} );
	const [ isRemoveDialogOpen, setIsRemoveDialogOpen ] = useState( false );
	const [ showResendButton, setShowResendButton ] = useState( true );
	const [ showSuccessNotice, setShowSuccessNotice ] = useState( false );

	const shouldShowValidationNotice = accountRecoveryPhone && ! accountRecoveryData.phone_validated;
	const fullPhoneNumber = `${ formData.smsNumber.countryNumericCode }${ formData.smsNumber.phoneNumber }`;

	const handleValidateSMS = () => {
		const validation = validatePhone( fullPhoneNumber );
		if ( validation.error ) {
			createErrorNotice( validation.message, {
				type: 'snackbar',
			} );
			return;
		}
		validateSMS( formData.smsNumber, {
			onSuccess: () => {
				createSuccessNotice( __( 'Your recovery SMS number was saved successfully.' ), {
					type: 'snackbar',
				} );
			},
			onError: ( error: Error ) => {
				createErrorNotice( error.message || __( 'Failed to validate recovery SMS number.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	const handleValidateSMSCode = () => {
		validateSMSCode( formData.smsCode, {
			onSuccess: () => {
				setShowSuccessNotice( true );
			},
			onError: ( error: Error ) => {
				createErrorNotice( error.message || __( 'Failed to validate recovery SMS code.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		if ( shouldShowValidationNotice ) {
			handleValidateSMSCode();
		} else {
			handleValidateSMS();
		}
	};

	const handleRemove = () => {
		setIsRemoveDialogOpen( false );
		removeSMS( undefined, {
			onSuccess: () => {
				createSuccessNotice( __( 'Your recovery SMS number was removed successfully.' ), {
					type: 'snackbar',
				} );
				setFormData( initialFormData );
			},
			onError: ( error: Error ) => {
				createErrorNotice( error.message || __( 'Failed to remove recovery SMS number.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	const handleResendValidation = () => {
		setShowResendButton( false );
		resendValidation( undefined, {
			onSuccess: () => {
				createSuccessNotice( __( 'Your recovery SMS validation was resent successfully.' ), {
					type: 'snackbar',
				} );
			},
			onError: ( error: Error ) => {
				createErrorNotice( error.message || __( 'Failed to resend recovery SMS validation.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	const fields: Field< SecuritySMSFormData >[] = useMemo(
		() => [
			{
				id: 'smsNumber',
				label: __( 'Phone number' ),
				type: 'text',
				Edit: ( { data, onChange } ) => {
					return (
						<PhoneNumberInput
							data={ data.smsNumber }
							onChange={ ( edits ) => {
								onChange( { ...data, smsNumber: edits } );
							} }
							isDisabled={ isValidateSMSPending }
						/>
					);
				},
				isVisible: () => ! shouldShowValidationNotice,
				// TODO: Add validation via isValid.custom.
				// There is currently a bug that prevents it from working.
				// For now, we're using the handleSubmit to validate the phone number.
			},
			{
				id: 'smsCode',
				label: __( 'SMS code' ),
				type: 'text',
				isVisible: () => !! shouldShowValidationNotice,
			},
		],
		[ isValidateSMSPending, shouldShowValidationNotice ]
	);

	return (
		<>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader title={ __( 'Recovery SMS number' ) } level={ 3 } />
						{ shouldShowValidationNotice && (
							<Notice
								variant="warning"
								title={ __( 'Please validate your recovery SMS number' ) }
								actions={
									showResendButton && (
										<Button
											variant="link"
											onClick={ handleResendValidation }
											disabled={ isResendValidationPending }
										>
											{ __( 'Resend code' ) }
										</Button>
									)
								}
							>
								{ sprintf(
									/* translators: %s: phone number */
									__( 'A validation code was sent to %s' ),
									accountRecoveryPhone.number_full
								) }
							</Notice>
						) }
						{ showSuccessNotice && (
							<Notice variant="success">{ __( 'Recovery SMS number validated' ) }</Notice>
						) }
						<form onSubmit={ handleSubmit }>
							<VStack spacing={ 4 }>
								<DataForm< SecuritySMSFormData >
									data={ formData }
									fields={ fields }
									form={ { layout: { type: 'regular' as const }, fields } }
									onChange={ ( edits: Partial< SecuritySMSFormData > ) => {
										setFormData( ( data ) => ( { ...data, ...edits } ) );
									} }
								/>
								<ButtonStack justify="flex-start">
									<Button
										variant="primary"
										type="submit"
										isBusy={ isValidateSMSPending || isValidateSMSCodePending }
										disabled={
											isValidateSMSPending ||
											isValidateSMSCodePending ||
											( shouldShowValidationNotice
												? ! formData.smsCode
												: ! formData.smsNumber.phoneNumber ) ||
											( ! shouldShowValidationNotice &&
												accountRecoveryPhone?.number_full === fullPhoneNumber )
										}
									>
										{ __( 'Validate' ) }
									</Button>
									{ accountRecoveryPhone && (
										<Button
											variant="tertiary"
											onClick={ () => setIsRemoveDialogOpen( true ) }
											isBusy={ isRemoveSMSPending }
											disabled={ isRemoveSMSPending }
										>
											{ __( 'Remove SMS number' ) }
										</Button>
									) }
								</ButtonStack>
							</VStack>
						</form>
					</VStack>
				</CardBody>
			</Card>
			<ConfirmDialog
				isOpen={ isRemoveDialogOpen }
				confirmButtonText={ __( 'Remove SMS number' ) }
				onCancel={ () => setIsRemoveDialogOpen( false ) }
				onConfirm={ handleRemove }
			>
				{ __( 'Are you sure you want to remove this SMS number?' ) }
			</ConfirmDialog>
		</>
	);
}
