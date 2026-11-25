import {
	userSettingsQuery,
	accountRecoveryQuery,
	updateAccountRecoveryEmailMutation,
	removeAccountRecoveryEmailMutation,
	resendAccountRecoveryEmailValidationMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { DataForm, useFormValidity } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import ConfirmModal from '../../components/confirm-modal';
import Notice, { NoticeActionButton } from '../../components/notice';
import { SectionHeader } from '../../components/section-header';
import { recoveryEmailMatchesAccountEmail } from './utils';
import type { Field } from '@wordpress/dataviews';

type SecurityEmailFormData = {
	email: string;
};

export default function RecoveryEmail() {
	const { recordTracksEvent } = useAnalytics();

	const { data: accountRecoveryData } = useSuspenseQuery( accountRecoveryQuery() );
	const { data: serverData } = useQuery( userSettingsQuery() );

	const { mutate: validateEmail, isPending: isValidateEmailPending } = useMutation(
		withSnackbar( updateAccountRecoveryEmailMutation(), {
			success: __( 'Recovery email saved.' ),
			error: ( error ) => error.message || __( 'Failed to save recovery email.' ),
		} )
	);
	const { mutate: removeEmail, isPending: isRemoveEmailPending } = useMutation(
		withSnackbar( removeAccountRecoveryEmailMutation(), {
			success: __( 'Recovery email removed.' ),
			error: ( error ) => error.message || __( 'Failed to remove recovery email.' ),
		} )
	);
	const { mutate: resendValidation, isPending: isResendValidationPending } = useMutation(
		withSnackbar( resendAccountRecoveryEmailValidationMutation(), {
			success: __( 'Recovery email validation resent.' ),
			error: ( error ) => error.message || __( 'Failed to resend recovery email validation.' ),
		} )
	);

	const accountRecoveryEmail = accountRecoveryData.email;

	const [ isRemoveDialogOpen, setIsRemoveDialogOpen ] = useState( false );
	const [ showResendButton, setShowResendButton ] = useState( true );
	const [ formData, setFormData ] = useState< SecurityEmailFormData >( {
		email: accountRecoveryEmail || '',
	} );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		recordTracksEvent( 'calypso_dashboard_security_account_recovery_email_validate_email_click' );
		validateEmail( formData.email );
	};

	const handleRemove = () => {
		recordTracksEvent( 'calypso_dashboard_security_account_recovery_email_remove_email_click' );
		removeEmail( undefined, {
			onSuccess: () => {
				setFormData( { email: '' } );
			},
			onSettled: () => {
				setIsRemoveDialogOpen( false );
			},
		} );
	};

	const handleResendValidation = () => {
		setShowResendButton( false );
		recordTracksEvent(
			'calypso_dashboard_security_account_recovery_email_resend_validation_click'
		);
		resendValidation();
	};

	const emailMatchesAccountEmail = recoveryEmailMatchesAccountEmail(
		accountRecoveryEmail,
		serverData?.user_email
	);

	const shouldShowValidationNotice =
		accountRecoveryEmail && ! emailMatchesAccountEmail && ! accountRecoveryData.email_validated;

	const primaryEmail = serverData?.user_email ?? '';

	const fields: Field< SecurityEmailFormData >[] = useMemo(
		() => [
			{
				id: 'email',
				label: __( 'Email address' ),
				description:
					/* translators: %s: email address */
					sprintf( __( 'Your primary email address is %s.' ), primaryEmail ),
				type: 'email',
				isDisabled: () => isValidateEmailPending,
				isValid: {
					custom: ( item ) => {
						if ( recoveryEmailMatchesAccountEmail( item.email, primaryEmail ) ) {
							return __(
								'You have entered your primary email address. Please enter a different email address.'
							);
						}
						return null;
					},
				},
			},
		],
		[ primaryEmail, isValidateEmailPending ]
	);

	const form = {
		layout: { type: 'regular' as const },
		fields: fields.map( ( field ) => field.id ),
	};

	const { validity, isValid } = useFormValidity( formData, fields, form );

	return (
		<>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader title={ __( 'Recovery email' ) } level={ 3 } />
						{ emailMatchesAccountEmail && (
							<Notice variant="warning" title={ __( 'Use a different recovery email' ) }>
								{ __(
									'This recovery email is the same as your account email, so it can’t help you get back into your account. Enter a different email address.'
								) }
							</Notice>
						) }
						{ shouldShowValidationNotice && (
							<Notice
								variant="warning"
								title={ __( 'Please validate your email address' ) }
								actions={
									showResendButton && (
										<NoticeActionButton
											variant="minimal"
											onClick={ handleResendValidation }
											disabled={ isResendValidationPending }
										>
											{ __( 'Resend validation email' ) }
										</NoticeActionButton>
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
									form={ form }
									validity={ validity }
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
											accountRecoveryEmail === formData.email ||
											! isValid
										}
									>
										{ __( 'Validate' ) }
									</Button>
									{ accountRecoveryEmail && (
										<Button
											variant="tertiary"
											onClick={ () => {
												setIsRemoveDialogOpen( true );
												recordTracksEvent(
													'calypso_dashboard_security_account_recovery_email_remove_email_dialog_open'
												);
											} }
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
			<ConfirmModal
				isOpen={ isRemoveDialogOpen }
				confirmButtonProps={ {
					label: __( 'Remove email' ),
					isBusy: isRemoveEmailPending,
					disabled: isRemoveEmailPending,
				} }
				onCancel={ () => setIsRemoveDialogOpen( false ) }
				onConfirm={ handleRemove }
			>
				{ __( 'Are you sure you want to remove this email?' ) }
			</ConfirmModal>
		</>
	);
}
