import {
	registerTwoStepAuthSecurityKeyMutation,
	userPreferenceMutation,
	userPreferenceQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	Modal,
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { useAnalytics } from '../../../../app/analytics';
import { withSnackbar } from '../../../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../../../components/button-stack';
import { getSecurityKeyHostname } from '../../utils';
import type { Field } from '@wordpress/dataviews';

type SecurityKeyFormData = {
	keyName: string;
};

export default function RegisterKey( { onClose }: { onClose: () => void } ) {
	const { recordTracksEvent } = useAnalytics();

	const [ formData, setFormData ] = useState< SecurityKeyFormData >( {
		keyName: '',
	} );

	const { mutateAsync: registerSecurityKey, isPending: isRegisteringSecurityKey } = useMutation(
		withSnackbar( registerTwoStepAuthSecurityKeyMutation( getSecurityKeyHostname() ), {
			success: ( _data, keyName ) =>
				/* translators: %s is the security key name */
				sprintf( __( 'Security key "%s" added.' ), keyName ),
			error: ( error ) => {
				// WebAuthn errors carry no text fit for users.
				switch ( error.name ) {
					case 'InvalidStateError':
						return __( 'Security key has already been registered.' );
					case 'NotAllowedError':
						return __( 'Security key interaction timed out or canceled.' );
					case 'AbortError':
						return __( 'Security key interaction canceled.' );
					case 'NotSupportedError':
					case 'SecurityError':
						return __( 'Security key registration error.' );
					default:
						return error.message || __( 'Failed to add security key. Please try again.' );
				}
			},
		} )
	);

	const { data: isReregisterRequired } = useQuery(
		userPreferenceQuery( 'two_step_security_key_reregister_required' )
	);
	const { mutate: setReregisterRequired } = useMutation(
		userPreferenceMutation( 'two_step_security_key_reregister_required' )
	);

	const handleSubmit = async ( e: React.FormEvent< HTMLFormElement > ) => {
		e.preventDefault();
		recordTracksEvent(
			'calypso_dashboard_security_two_step_auth_security_keys_register_key_click'
		);
		registerSecurityKey( formData.keyName.trim(), {
			onSuccess: () => {
				if ( isReregisterRequired ) {
					setReregisterRequired( false );
				}
				onClose();
			},
			onError: () => {
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
							form={ {
								layout: { type: 'regular' as const },
								fields: fields.map( ( field ) => field.id ),
							} }
							onChange={ ( edits: Partial< SecurityKeyFormData > ) => {
								setFormData( ( data ) => ( { ...data, ...edits } ) );
							} }
						/>
						<ButtonStack justify="flex-end">
							<Button
								__next40pxDefaultSize
								variant="tertiary"
								onClick={ onClose }
								disabled={ isRegisteringSecurityKey }
							>
								{ __( 'Cancel' ) }
							</Button>
							<Button
								__next40pxDefaultSize
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
