import {
	Modal,
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState } from 'react';
import { ButtonStack } from '../../../../components/button-stack';
import { useRegisterSecurityKey } from '../../hooks/use-register-security-key';
import type { Field } from '@wordpress/dataviews';

type SecurityKeyFormData = {
	keyName: string;
};

export default function RegisterKey( {
	onClose,
	refetch,
}: {
	onClose: () => void;
	refetch: () => void;
} ) {
	const [ formData, setFormData ] = useState< SecurityKeyFormData >( {
		keyName: '',
	} );

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { mutateAsync: registerSecurityKey, isPending: isRegisteringSecurityKey } =
		useRegisterSecurityKey();

	const handleSubmit = async ( e: React.FormEvent< HTMLFormElement > ) => {
		e.preventDefault();

		try {
			await registerSecurityKey( formData.keyName.trim() );

			createSuccessNotice( __( 'Security key added successfully!' ), {
				type: 'snackbar',
			} );
			refetch();
			onClose();
		} catch ( err ) {
			const errorMessage =
				err instanceof Error ? err.message : __( 'Failed to add security key. Please try again.' );
			createErrorNotice( errorMessage, {
				type: 'snackbar',
			} );
			onClose();
		}
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
