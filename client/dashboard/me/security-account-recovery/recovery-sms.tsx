import {
	accountRecoveryQuery,
	updateAccountRecoverySMSMutation,
	removeAccountRecoverySMSMutation,
	resendAccountRecoverySMSValidationMutation,
	validateAccountRecoverySMSCodeMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalSpacer as Spacer,
	__experimentalConfirmDialog as ConfirmDialog,
	__experimentalInputControl as InputControl,
	Button,
	Card,
	CardBody,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState, useEffect } from 'react';
import Notice from '../../components/notice';
import { SectionHeader } from '../../components/section-header';
import validatePhone from '../../utils/validate-phone';
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
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const [ formData, setFormData ] = useState< SecuritySMSFormData >( initialFormData );
	const [ isRemoveDialogOpen, setIsRemoveDialogOpen ] = useState( false );
	const [ showResendButton, setShowResendButton ] = useState( true );
	const [ showSuccessNotice, setShowSuccessNotice ] = useState( false );

	const { data: accountRecoveryData, isLoading: isAccountRecoveryDataLoading } = useQuery(
		accountRecoveryQuery()
	);

	const { mutate: validateSMSMutation, isPending: isValidateSMSPending } = useMutation(
		updateAccountRecoverySMSMutation()
	);

	const { mutate: removeSMSMutation, isPending: isRemoveSMSPending } = useMutation(
		removeAccountRecoverySMSMutation()
	);

	const { mutate: resendValidationMutation, isPending: isResendValidationPending } = useMutation(
		resendAccountRecoverySMSValidationMutation()
	);

	const { mutate: validateSMSCodeMutation, isPending: isValidateSMSCodePending } = useMutation(
		validateAccountRecoverySMSCodeMutation()
	);

	const accountRecoveryPhone = accountRecoveryData?.phone;
	const shouldShowValidationNotice = accountRecoveryPhone && ! accountRecoveryData?.phone_validated;

	const fullPhoneNumber = `${ formData.smsNumber.countryNumericCode }${ formData.smsNumber.phoneNumber }`;

	useEffect( () => {
		setFormData( {
			smsNumber: {
				phoneNumber: accountRecoveryPhone?.number || '',
				countryCode: accountRecoveryPhone?.country_code || '',
				countryNumericCode: accountRecoveryPhone?.country_numeric_code || '',
			},
			smsCode: '',
		} );
	}, [ accountRecoveryPhone ] );

	const handleValidateSMS = () => {
		const validation = validatePhone( fullPhoneNumber );
		if ( validation.error ) {
			createErrorNotice( validation.message, {
				type: 'snackbar',
			} );
			return;
		}
		validateSMSMutation( formData.smsNumber, {
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
		validateSMSCodeMutation( formData.smsCode, {
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
		removeSMSMutation( undefined, {
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
		resendValidationMutation( undefined, {
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
							isDisabled={ isAccountRecoveryDataLoading || isValidateSMSPending }
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
				Edit: ( { field, data, onChange } ) => {
					return (
						<InputControl
							__next40pxDefaultSize
							label={ field.label }
							value={ data.smsCode }
							onChange={ ( value ) => {
								onChange( { ...data, smsCode: value } );
							} }
						/>
					);
				},
				isVisible: () => !! shouldShowValidationNotice,
			},
		],
		[ isAccountRecoveryDataLoading, isValidateSMSPending, shouldShowValidationNotice ]
	);

	return (
		<>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader title={ __( 'Recovery SMS number' ) } level={ 3 } />
						{ shouldShowValidationNotice && (
							<Spacer marginBottom={ 4 }>
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
							</Spacer>
						) }
						{ showSuccessNotice && (
							<Spacer marginBottom={ 4 }>
								<Notice variant="success">{ __( 'Recovery SMS number validated' ) }</Notice>
							</Spacer>
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
								<HStack spacing={ 3 } justify="flex-start">
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
								</HStack>
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
