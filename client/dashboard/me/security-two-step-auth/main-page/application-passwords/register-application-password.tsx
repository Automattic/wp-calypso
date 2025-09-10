import { createApplicationPasswordMutation } from '@automattic/api-queries';
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
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState } from 'react';
import { ButtonStack } from '../../../../components/button-stack';
import ClipboardInputControl from '../../../../components/clipboard-input-control';
import type { Field } from '@wordpress/dataviews';

type ApplicationPasswordFormData = {
	applicationName: string;
};

export default function RegisterApplicationPassword( { onClose }: { onClose: () => void } ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const [ formData, setFormData ] = useState< ApplicationPasswordFormData >( {
		applicationName: '',
	} );
	const [ applicationPassword, setApplicationPassword ] = useState< string | null >( '' );

	const { mutate: registerApplicationPassword, isPending: isRegisteringApplicationPassword } =
		useMutation( createApplicationPasswordMutation() );

	const handleSubmit = async ( e: React.FormEvent< HTMLFormElement > ) => {
		e.preventDefault();

		registerApplicationPassword(
			{ application_name: formData.applicationName.trim() },
			{
				onSuccess: ( data ) => {
					setApplicationPassword( data.application_password );
				},
				onError: () => {
					createErrorNotice( __( 'Failed to add application password. Please try again.' ), {
						type: 'snackbar',
					} );
					onClose();
				},
			}
		);
	};

	const onDone = () => {
		createSuccessNotice(
			/* translators: %s is the application name */
			sprintf( __( 'Application password "%s" added.' ), formData.applicationName ),
			{
				type: 'snackbar',
			}
		);
		onClose();
	};

	const fields: Field< ApplicationPasswordFormData >[] = useMemo(
		() => [
			{
				id: 'applicationName',
				label: __( 'Application name' ),
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
							disabled={ isRegisteringApplicationPassword }
						/>
					);
				},
			},
		],
		[ isRegisteringApplicationPassword ]
	);

	return (
		<Modal
			onRequestClose={ onClose }
			title={ applicationPassword ? __( 'Save password' ) : __( 'Add application password' ) }
			size="medium"
		>
			{ applicationPassword ? (
				<VStack spacing={ 4 }>
					<Text as="p" style={ { maxWidth: '500px' } }>
						{ createInterpolateElement(
							/* translators: %s is the application name */
							__(
								'Use this password to log in to <applicationName />. Keep this password safe as you won‘t be able to view it again.'
							),
							{
								applicationName: <strong>{ formData.applicationName }</strong>,
							}
						) }
					</Text>
					<ClipboardInputControl
						help={ __( 'Note: Spaces are ignored.' ) }
						value={ applicationPassword }
						readOnly
					/>
					<ButtonStack justify="flex-end">
						<Button variant="primary" onClick={ onDone }>
							{ __( 'Done' ) }
						</Button>
					</ButtonStack>
				</VStack>
			) : (
				<form onSubmit={ handleSubmit }>
					<VStack spacing={ 4 }>
						<DataForm< ApplicationPasswordFormData >
							data={ formData }
							fields={ fields }
							form={ { layout: { type: 'regular' as const }, fields } }
							onChange={ ( edits: Partial< ApplicationPasswordFormData > ) => {
								setFormData( ( data ) => ( { ...data, ...edits } ) );
							} }
						/>
						<ButtonStack justify="flex-end">
							<Button
								variant="tertiary"
								onClick={ onClose }
								disabled={ isRegisteringApplicationPassword }
							>
								{ __( 'Cancel' ) }
							</Button>
							<Button
								variant="primary"
								type="submit"
								isBusy={ isRegisteringApplicationPassword }
								disabled={ isRegisteringApplicationPassword || ! formData.applicationName.trim() }
							>
								{ __( 'Generate password' ) }
							</Button>
						</ButtonStack>
					</VStack>
				</form>
			) }
		</Modal>
	);
}
