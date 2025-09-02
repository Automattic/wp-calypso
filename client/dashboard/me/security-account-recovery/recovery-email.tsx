import {
	profileQuery,
	accountRecoveryQuery,
	updateAccountRecoveryEmailMutation,
	removeAccountRecoveryEmailMutation,
	resendAccountRecoveryEmailValidationMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalInputControl as InputControl,
	__experimentalVStack as VStack,
	__experimentalSpacer as Spacer,
	__experimentalConfirmDialog as ConfirmDialog,
	Button,
	Card,
	CardBody,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState, useEffect } from 'react';
import Notice from '../../components/notice';
import { SectionHeader } from '../../components/section-header';
import type { Field } from '@wordpress/dataviews';

type SecurityEmailFormData = {
	email: string;
};

export default function RecoveryEmail() {
	const [ formData, setFormData ] = useState< SecurityEmailFormData >( {
		email: '',
	} );
	const [ isRemoveDialogOpen, setIsRemoveDialogOpen ] = useState( false );
	const [ showResendButton, setShowResendButton ] = useState( true );

	const { data: accountRecoveryData, isLoading: isAccountRecoveryDataLoading } = useQuery(
		accountRecoveryQuery()
	);

	const { mutate: validateEmailMutation, isPending: isValidateEmailPending } = useMutation(
		updateAccountRecoveryEmailMutation()
	);

	const { mutate: removeEmailMutation, isPending: isRemoveEmailPending } = useMutation(
		removeAccountRecoveryEmailMutation()
	);

	const { mutate: resendValidationMutation, isPending: isResendValidationPending } = useMutation(
		resendAccountRecoveryEmailValidationMutation()
	);

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const accountRecoveryEmail = accountRecoveryData?.email;

	useEffect( () => {
		setFormData( { email: accountRecoveryEmail || '' } );
	}, [ accountRecoveryEmail ] );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		validateEmailMutation( formData.email, {
			onSuccess: () => {
				createSuccessNotice( __( 'Your recovery email was saved successfully.' ), {
					type: 'snackbar',
				} );
			},
			onError: ( error: Error ) => {
				createErrorNotice( error.message || __( 'Failed to save recovery email.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	const handleRemove = () => {
		setIsRemoveDialogOpen( false );
		removeEmailMutation( undefined, {
			onSuccess: () => {
				createSuccessNotice( __( 'Your recovery email was removed successfully.' ), {
					type: 'snackbar',
				} );
				setFormData( { email: '' } );
			},
			onError: ( error: Error ) => {
				createErrorNotice( error.message || __( 'Failed to remove recovery email.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	const handleResendValidation = () => {
		setShowResendButton( false );
		resendValidationMutation( undefined, {
			onSuccess: () => {
				createSuccessNotice( __( 'Your recovery email validation was resent successfully.' ), {
					type: 'snackbar',
				} );
			},
			onError: ( error: Error ) => {
				createErrorNotice( error.message || __( 'Failed to resend recovery email validation.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	const { data: serverData } = useQuery( profileQuery() );

	const shouldShowValidationNotice = accountRecoveryEmail && ! accountRecoveryData?.email_validated;

	const fields: Field< SecurityEmailFormData >[] = useMemo(
		() => [
			{
				id: 'email',
				label: __( 'Email address' ),
				description:
					/* translators: %s: email address */
					__( 'Your primary email address is %s', serverData?.user_email ),
				type: 'text' as const,
				Edit: ( { field, data, onChange } ) => {
					const { id, getValue } = field;
					return (
						<InputControl
							__next40pxDefaultSize
							type="email"
							label={ field.label }
							placeholder={ field.placeholder }
							value={ getValue( { item: data } ) }
							onChange={ ( value ) => {
								return onChange( { [ id ]: value ?? '' } );
							} }
							disabled={ isAccountRecoveryDataLoading || isValidateEmailPending }
						/>
					);
				},
			},
		],
		[ serverData?.user_email, isAccountRecoveryDataLoading, isValidateEmailPending ]
	);

	return (
		<>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader title={ __( 'Recovery email' ) } level={ 3 } />
						{ shouldShowValidationNotice && (
							<Spacer marginBottom={ 4 }>
								<Notice
									variant="warning"
									title={ __( 'Please validate your email address' ) }
									actions={
										showResendButton && (
											<Button
												variant="link"
												onClick={ handleResendValidation }
												disabled={ isResendValidationPending }
											>
												{ __( 'Resend validation email' ) }
											</Button>
										)
									}
								>
									{ __(
										"We've sent you an email with a validation link to click. Check spam or junk folders if you're unable to find it."
									) }
								</Notice>
							</Spacer>
						) }
						<form onSubmit={ handleSubmit }>
							<VStack spacing={ 4 }>
								<DataForm< SecurityEmailFormData >
									data={ formData }
									fields={ fields }
									form={ { layout: { type: 'regular' as const }, fields } }
									onChange={ ( edits: Partial< SecurityEmailFormData > ) => {
										setFormData( ( data ) => ( { ...data, ...edits } ) );
									} }
								/>
								<HStack spacing={ 3 } justify="flex-start">
									<Button
										variant="primary"
										type="submit"
										isBusy={ isValidateEmailPending }
										disabled={
											isValidateEmailPending ||
											! formData.email ||
											accountRecoveryEmail === formData.email
										}
									>
										{ __( 'Validate' ) }
									</Button>
									{ accountRecoveryEmail && (
										<Button
											variant="tertiary"
											onClick={ () => setIsRemoveDialogOpen( true ) }
											isBusy={ isRemoveEmailPending }
											disabled={ isRemoveEmailPending }
										>
											{ __( 'Remove email' ) }
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
				confirmButtonText={ __( 'Remove email' ) }
				onCancel={ () => setIsRemoveDialogOpen( false ) }
				onConfirm={ handleRemove }
			>
				{ __( 'Are you sure you want to remove this email?' ) }
			</ConfirmDialog>
		</>
	);
}
