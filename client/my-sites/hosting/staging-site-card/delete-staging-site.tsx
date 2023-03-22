import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { Modal } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { useDeleteStagingSite } from './use-delete-staging-site';

interface DeleteStagingSiteProps {
	siteId: number;
	stagingSiteId: number;
	disabled: boolean;
	children: React.ReactNode;
}

const ActionButtons = styled.div( {
	display: 'flex',
	gap: '1em',
} );

export function DeleteStagingSite( {
	siteId,
	stagingSiteId,
	disabled = false,
	children,
}: DeleteStagingSiteProps ) {
	const { __ } = useI18n();
	const [ isOpen, setOpen ] = useState( false );
	const openModal = () => setOpen( true );
	const closeModal = () => setOpen( false );
	const { deleteStagingSite, isLoading } = useDeleteStagingSite( {
		siteId,
		stagingSiteId,
		onSuccess: closeModal,
	} );

	return (
		<>
			<Button scary onClick={ openModal } disabled={ disabled } busy={ isLoading }>
				{ children }
			</Button>
			{ isOpen && (
				<Modal title={ __( 'Confirm Staging Site Deletion' ) } onRequestClose={ closeModal }>
					<p>
						{ __(
							'Are you sure you want to delete the staging site? This action cannot be undone.'
						) }
					</p>
					<ActionButtons>
						<Button primary onClick={ () => deleteStagingSite() } busy={ isLoading }>
							{ __( 'Delete satging site' ) }
						</Button>
						<Button onClick={ closeModal }>{ __( 'Cancel' ) }</Button>
					</ActionButtons>
				</Modal>
			) }
		</>
	);
}
