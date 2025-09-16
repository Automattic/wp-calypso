import { deleteSshKeyMutation } from '@automattic/api-queries';
import { Badge } from '@automattic/ui';
import { useMutation } from '@tanstack/react-query';
import {
	Button,
	Icon,
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { edit, trash } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useLocale } from '../../app/locale';
import { ButtonStack } from '../../components/button-stack';
import ConfirmModal from '../../components/confirm-modal';
import type { UserSshKey } from '@automattic/api-core';

export default function SshKey( {
	sshKey,
	setIsEditing,
	username,
}: {
	sshKey: UserSshKey;
	setIsEditing: ( isEditing: boolean ) => void;
	username: string;
} ) {
	const userLocale = useLocale();

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const [ isRemoveDialogOpen, setIsRemoveDialogOpen ] = useState( false );

	const { mutate: deleteSshKey, isPending: isDeletingSshKey } = useMutation(
		deleteSshKeyMutation()
	);

	const handleEdit = () => {
		setIsEditing( true );
	};

	const handleRemove = () => {
		deleteSshKey( undefined, {
			onSuccess: () => {
				createSuccessNotice( __( 'SSH key removed.' ), {
					type: 'snackbar',
				} );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to remove SSH key.' ), {
					type: 'snackbar',
				} );
			},
			onSettled: () => {
				setIsRemoveDialogOpen( false );
			},
		} );
	};

	return (
		<>
			<Card>
				<CardBody>
					<HStack spacing={ 4 } justify="space-between" alignment="flex-start">
						<VStack spacing={ 3 } alignment="flex-start">
							<Text weight={ 500 } lineHeight="20px">
								{ username }-{ sshKey.name }
							</Text>
							<Text variant="muted" lineHeight="20px" size="13px">
								{ sshKey.sha256 }
							</Text>
							<Badge intent="info">
								{ sprintf(
									/* translators: %s is when the SSH key was attached. */
									__( 'Attached on %s' ),
									new Intl.DateTimeFormat( userLocale, {
										dateStyle: 'long',
										timeStyle: 'medium',
									} ).format( new Date( sshKey.created_at ) )
								) }
							</Badge>
						</VStack>
						<ButtonStack justify="flex-end" expanded={ false }>
							<Button
								size="small"
								icon={ <Icon icon={ edit } /> }
								onClick={ handleEdit }
								label={ __( 'Edit SSH key' ) }
							/>
							<Button
								size="small"
								icon={ <Icon icon={ trash } /> }
								onClick={ () => setIsRemoveDialogOpen( true ) }
								label={ __( 'Delete SSH key' ) }
							/>
						</ButtonStack>
					</HStack>
				</CardBody>
			</Card>
			<ConfirmModal
				isOpen={ isRemoveDialogOpen }
				confirmButtonProps={ {
					label: __( 'Remove SSH key' ),
					isBusy: isDeletingSshKey,
					disabled: isDeletingSshKey,
				} }
				onCancel={ () => setIsRemoveDialogOpen( false ) }
				onConfirm={ handleRemove }
			>
				{ __(
					'Are you sure you want to remove this SSH key? It will be removed from all attached sites.'
				) }
			</ConfirmModal>
		</>
	);
}
