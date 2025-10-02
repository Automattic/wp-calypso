import { registerTwoStepAuthSecurityKeyMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Modal,
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState } from 'react';
import { useAnalytics } from '../../../../app/analytics';
import { ButtonStack } from '../../../../components/button-stack';
import type { Field } from '@wordpress/dataviews';

type SecurityKeyFormData = {
	keyName: string;
};

export default function RegisterKey( { onClose }: { onClose: () => void } ) {
	const { recordTracksEvent } = useAnalytics();

	const [ formData, setFormData ] = useState< SecurityKeyFormData >( {
		keyName: '',
	} );

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const { mutateAsync: registerSecurityKey, isPending: isRegisteringSecurityKey } = useMutation(
		registerTwoStepAuthSecurityKeyMutation()
	);

	const handleSubmit = async ( e: React.FormEvent< HTMLFormElement > ) => {
		e.preventDefault();
		recordTracksEvent(
			'calypso_dashboard_security_two_step_auth_security_keys_register_key_click'
		);
		registerSecurityKey( formData.keyName.trim(), {
			onSuccess: () => {
				createSuccessNotice(
					/* translators: %s is the security key name */
					sprintf( __( 'Security key "%s" added.' ), formData.keyName ),
					{
						type: 'snackbar',
					}
				);
				onClose();
			},
			onError: ( err ) => {
				let errorMessage = __( 'Failed to add security key. Please try again.' );

				// Handle WebAuthn specific errors with user-friendly messages
				if ( err instanceof Error ) {
					switch ( err.name ) {
						case 'InvalidStateError':
							errorMessage = __( 'Security key has already been registered.' );
							break;
						case 'NotAllowedError':
							errorMessage = __( 'Security key interaction timed out or canceled.' );
							break;
						case 'AbortError':
							errorMessage = __( 'Security key interaction canceled.' );
							break;
						case 'NotSupportedError':
						case 'SecurityError':
							errorMessage = __( 'Security key registration error.' );
							break;
						default:
							errorMessage = err.message;
					}
				}

				createErrorNotice( errorMessage, {
					type: 'snackbar',
				} );
				onClose();
			},
		} );
	};

	const fields: Field< SecurityKeyFormData >[] = useMemo(
		() => [
			{
				id: 'keyName',
				label: __( 'Security key name' ),
				description: __( 'Make it up! It can be anything.' ),
				type: 'text',
				Edit: ( { field, data, onChange } ) => {
					const { id, getValue } = field;
					return (
						<InputControl
							__next40pxDefaultSize
							type="text"
							label={ field.label }
							help={ field.description }
							placeholder={ field.placeholder }
							value={ getValue( { item: data } ) }
							onChange={ ( value ) => {
								return onChange( { [ id ]: value ?? '' } );
							} }
							disabled={ isRegisteringSecurityKey }
						/>
					);
				},
			},
		],
		[ isRegisteringSecurityKey ]
	);

	return (
		<Modal
			onRequestClose={ onClose }
			title={
				isRegisteringSecurityKey ? __( 'Waiting for security key' ) : __( 'Add security key' )
			}
			size="medium"
		>
			{ isRegisteringSecurityKey ? (
				<Text as="p" style={ { maxWidth: '500px' } }>
					{ __(
						'Connect and touch your security key to register it, or follow the directions in your browser or pop-up.'
					) }
				</Text>
			) : (
				<form onSubmit={ handleSubmit }>
					<VStack spacing={ 4 }>
						<DataForm< SecurityKeyFormData >
							data={ formData }
							fields={ fields }
							form={ { layout: { type: 'regular' as const }, fields } }
							onChange={ ( edits: Partial< SecurityKeyFormData > ) => {
								setFormData( ( data ) => ( { ...data, ...edits } ) );
							} }
						/>
						<ButtonStack justify="flex-end">
							<Button variant="tertiary" onClick={ onClose } disabled={ isRegisteringSecurityKey }>
								{ __( 'Cancel' ) }
							</Button>
							<Button
								variant="primary"
								type="submit"
								isBusy={ isRegisteringSecurityKey }
								disabled={ isRegisteringSecurityKey || ! formData.keyName.trim() }
							>
								{ __( 'Add key' ) }
							</Button>
						</ButtonStack>
					</VStack>
				</form>
			) }
		</Modal>
	);
}
