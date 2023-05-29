import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { Modal } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';

interface DeleteStagingSiteProps {
	disabled: boolean;
	children: React.ReactNode;
	onClickDelete: () => void;
	isBusy?: boolean;
}

const ActionButtons = styled.div( {
	display: 'flex',
	gap: '1em',
} );

export function DeleteStagingSite( {
	onClickDelete,
	isBusy,
	disabled = false,
	children,
}: DeleteStagingSiteProps ) {
	const { __ } = useI18n();
	const [ isOpen, setOpen ] = useState( false );
	const openModal = () => setOpen( true );
	const closeModal = () => setOpen( false );

	return (
		<>
			<Button scary onClick={ openModal } disabled={ disabled } busy={ isBusy }>
				{ children }
			</Button>
			{ isOpen && (
				<Modal title={ __( 'Confirm staging site deletion' ) } onRequestClose={ closeModal }>
					<p>
						{ __(
							'Are you sure you want to delete the staging site? This action cannot be undone.'
						) }
					</p>
					<ActionButtons>
						<Button
							primary
							onClick={ () => {
								onClickDelete();
								closeModal();
							} }
							busy={ isBusy }
						>
							{ __( 'Delete staging site' ) }
						</Button>
						<Button onClick={ closeModal }>{ __( 'Cancel' ) }</Button>
					</ActionButtons>
				</Modal>
			) }
		</>
	);
}
