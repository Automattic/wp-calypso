import {
	userSettingsQuery,
	validateTwoStepAuthCodeMutation,
	resendTwoStepAuthSMSCodeMutation,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	Modal,
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { ButtonStack } from '../../../../components/button-stack';
import { Notice } from '../../../../components/notice';
import type { Field } from '@wordpress/dataviews';

type TwoStepAuthAppFormData = {
	code: string;
};

export default function DisableTwoStepDialog( { onClose }: { onClose: () => void } ) {
	const { createSuccessNotice } = useDispatch( noticesStore );

	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	const username = userSettings.user_login;
	const isTwoStepSMSEnabled = userSettings.two_step_sms_enabled;

	const [ formData, setFormData ] = useState< TwoStepAuthAppFormData >( {
		code: '',
	} );
	const [ isSMSResendThrottled, setIsSMSResendThrottled ] = useState( false );
	const [ error, setError ] = useState< {
		title: string;
		message: string;
	} | null >( null );

	const { mutate: validateTwoStepCode, isPending: isValidateTwoStepCodePending } = useMutation(
		validateTwoStepAuthCodeMutation()
	);
	const { mutate: resendSMSCode } = useMutation( resendTwoStepAuthSMSCodeMutation() );

	// Allow SMS requests after 60 seconds
	const handleThrottleSMSRequests = () => {
		setTimeout( () => {
			setIsSMSResendThrottled( false );
		}, 60000 );
	};

	const handleResendSMSCode = useCallback( () => {
		setIsSMSResendThrottled( true );
		setError( null );
		resendSMSCode( undefined, {
			onSuccess: () => {
				setError( null );
				handleThrottleSMSRequests();
			},
			onError: ( e: { error?: string; message?: string } ) => {
				const error = e?.error;
				if ( error === 'rate_limited' ) {
					setError( {
						title: __( 'Unable to request a code via SMS right now' ),
						message: __( 'Please try again after one minute.' ),
					} );
				} else {
					setError( {
						title: __( 'Failed to send verification code' ),
						message: e.message || __( 'Please try again.' ),
					} );
				}
				handleThrottleSMSRequests();
			},
		} );
	}, [ resendSMSCode ] );

	useEffect( () => {
		if ( isTwoStepSMSEnabled ) {
			handleResendSMSCode();
		}
	}, [ isTwoStepSMSEnabled, handleResendSMSCode ] );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		setError( null );
		validateTwoStepCode(
			{
				code: formData.code,
				action: 'disable-two-step',
			},
			{
				onSuccess: () => {
					createSuccessNotice( __( 'Two-step authentication disabled.' ), {
						type: 'snackbar',
					} );
					onClose();
				},
				onError: ( e: Error ) => {
					const errorMessage =
						e.cause === 'invalid_code'
							? __( 'You entered an invalid code. Please try again.' )
							: e.message;
					setError( {
						title: __( 'Unable to disable two-step authentication' ),
						message: errorMessage,
					} );
				},
			}
		);
	};

	const field: Field< TwoStepAuthAppFormData > = useMemo(
		() => ( {
			id: 'code',
			type: 'text',
			label: __( 'Verification code' ),
			placeholder: '123456',
			Edit: ( { field, data, onChange } ) => {
				const { id, getValue } = field;
				return (
					<InputControl
						__next40pxDefaultSize
						type="text"
						label={ field.label }
						placeholder={ field.placeholder }
						value={ getValue( { item: data } ) }
						onChange={ ( value ) => {
							return onChange( { [ id ]: value ?? '' } );
						} }
						disabled={ isValidateTwoStepCodePending }
					/>
				);
			},
		} ),
		[ isValidateTwoStepCodePending ]
	);

	return (
		<Modal onRequestClose={ onClose } title={ __( 'Disable two-step authentication' ) }>
			<form onSubmit={ handleSubmit }>
				<VStack spacing={ 4 } style={ { maxWidth: '450px' } }>
					<Text as="p">
						{ createInterpolateElement(
							/* translators: username is the username of the account */
							__(
								'You are about to disable two-step authentication. This means we will no longer ask for your authentication code when you sign into your <username/> account.'
							),
							{
								username: <strong>{ username }</strong>,
							}
						) }
					</Text>
					<Text as="p">
						{ __(
							'This will also disable your application passwords, though you can access them again if you ever re-enable two-step authentication. If you decide to re-enable two-step authentication, keep in mind you’ll need to generate new backup codes.'
						) }
					</Text>
					<Text as="p">
						{ __(
							'To verify that you wish to disable two-step authentication, enter the verification code from your device or a backup code.'
						) }
					</Text>

					{ error && (
						<Notice variant="error" title={ error.title }>
							{ error.message }
						</Notice>
					) }

					<DataForm< TwoStepAuthAppFormData >
						data={ formData }
						fields={ [ field ] }
						form={ { layout: { type: 'regular' as const }, fields: [ field ] } }
						onChange={ ( edits: Partial< TwoStepAuthAppFormData > ) => {
							setFormData( ( data ) => ( { ...data, ...edits } ) );
						} }
					/>

					{ isTwoStepSMSEnabled && (
						<Button
							variant="link"
							onClick={ handleResendSMSCode }
							disabled={ isSMSResendThrottled }
						>
							{ __( 'Request a new code via SMS' ) }
						</Button>
					) }

					<ButtonStack justify="flex-end">
						<Button variant="tertiary" onClick={ onClose }>
							{ __( 'Cancel' ) }
						</Button>
						<Button
							isDestructive
							variant="primary"
							onClick={ handleSubmit }
							isBusy={ isValidateTwoStepCodePending }
							disabled={ isValidateTwoStepCodePending || ! formData.code }
						>
							{ __( 'Disable' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</form>
		</Modal>
	);
}
