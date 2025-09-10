import {
	userSettingsQuery,
	accountRecoveryQuery,
	updateAccountRecoveryEmailMutation,
	removeAccountRecoveryEmailMutation,
	resendAccountRecoveryEmailValidationMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalInputControl as InputControl,
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
import type { Field } from '@wordpress/dataviews';

type SecurityEmailFormData = {
	email: string;
};

export default function RecoveryEmail() {
	const { data: accountRecoveryData } = useSuspenseQuery( accountRecoveryQuery() );
	const { data: serverData } = useQuery( userSettingsQuery() );

	const { mutate: validateEmail, isPending: isValidateEmailPending } = useMutation(
		updateAccountRecoveryEmailMutation()
	);
	const { mutate: removeEmail, isPending: isRemoveEmailPending } = useMutation(
		removeAccountRecoveryEmailMutation()
	);
	const { mutate: resendValidation, isPending: isResendValidationPending } = useMutation(
		resendAccountRecoveryEmailValidationMutation()
	);

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const accountRecoveryEmail = accountRecoveryData.email;

	const [ isRemoveDialogOpen, setIsRemoveDialogOpen ] = useState( false );
	const [ showResendButton, setShowResendButton ] = useState( true );
	const [ formData, setFormData ] = useState< SecurityEmailFormData >( {
		email: accountRecoveryEmail || '',
	} );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		validateEmail( formData.email, {
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
		removeEmail( undefined, {
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
		resendValidation( undefined, {
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

	const shouldShowValidationNotice = accountRecoveryEmail && ! accountRecoveryData.email_validated;

	const fields: Field< SecurityEmailFormData >[] = useMemo(
		() => [
			{
				id: 'email',
				label: __( 'Email address' ),
				description:
					/* translators: %s: email address */
					sprintf( __( 'Your primary email address is %s' ), serverData?.user_email ),
				type: 'email',
				Edit: ( { field, data, onChange } ) => {
					const { id, getValue } = field;
					return (
						<InputControl
							__next40pxDefaultSize
							type="email"
							label={ field.label }
							help={ field.description }
							placeholder={ field.placeholder }
							value={ getValue( { item: data } ) }
							onChange={ ( value ) => {
								return onChange( { [ id ]: value ?? '' } );
							} }
							disabled={ isValidateEmailPending }
						/>
					);
				},
			},
		],
		[ serverData?.user_email, isValidateEmailPending ]
	);

	return (
		<>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader title={ __( 'Recovery email' ) } level={ 3 } />
						{ shouldShowValidationNotice && (
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
									'We’ve sent you an email with a validation link to click. Check spam or junk folders if you’re unable to find it.'
								) }
							</Notice>
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
								<ButtonStack justify="flex-start">
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
								</ButtonStack>
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
