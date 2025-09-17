import {
	Button,
	Modal,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { DataForm, Field, isItemValid } from '@wordpress/dataviews';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from '../../components/button-stack';

interface ConfirmationFormData {
	confirmText: string;
}

interface FinalConfirmationModalProps {
	onClose: () => void;
	onConfirm: () => void;
	username: string;
	isDeleting: boolean;
}

export default function FinalConfirmationModal( {
	onClose,
	onConfirm,
	username,
	isDeleting,
}: FinalConfirmationModalProps ) {
	const [ formData, setFormData ] = useState< ConfirmationFormData >( { confirmText: '' } );

	const fields: Field< ConfirmationFormData >[] = [
		{
			id: 'confirmText',
			type: 'text',
			label: __( 'Type your username to confirm' ),
			placeholder: username,
			isValid: {
				required: true,
				custom: ( data: ConfirmationFormData ) => {
					return data.confirmText === username
						? null
						: __( 'Please type your username exactly as shown' );
				},
			},
		},
	];

	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'confirmText' ],
	};

	const isConfirmDisabled = ! isItemValid( formData, fields, form ) || isDeleting;

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();
		if ( ! isConfirmDisabled ) {
			onConfirm();
		}
	};

	return (
		<Modal title={ __( 'Confirm account deletion' ) } onRequestClose={ onClose }>
			<form onSubmit={ handleSubmit }>
				<VStack spacing={ 6 }>
					<Text>
						{ __(
							'Please type your username in the field below to confirm. Your account will then be gone forever.'
						) }
					</Text>
					<DataForm< ConfirmationFormData >
						data={ formData }
						fields={ fields }
						form={ form }
						onChange={ ( edits: Partial< ConfirmationFormData > ) => {
							setFormData( ( data ) => ( { ...data, ...edits } ) );
						} }
					/>
					<ButtonStack justify="flex-end">
						<Button variant="tertiary" onClick={ onClose } disabled={ isDeleting }>
							{ __( 'Cancel' ) }
						</Button>
						<Button
							variant="primary"
							isDestructive
							type="submit"
							disabled={ isConfirmDisabled }
							isBusy={ isDeleting }
						>
							{ isDeleting ? __( 'Deleting account…' ) : __( 'Delete account' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</form>
		</Modal>
	);
}
