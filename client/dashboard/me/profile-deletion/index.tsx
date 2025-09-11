import { closeAccountMutation, userPurchasesQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button, Card, CardBody, Icon } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { trash } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useAuth } from '../../app/auth';
import ActionItem from '../../components/action-list/action-item';
import AccountDeletionConfirmModal from './account-deletion-modal';

export default function AccountDeletionSection() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ showConfirmModal, setShowConfirmModal ] = useState( false );
	const mutation = useMutation( closeAccountMutation() );
	const { data: purchases, isLoading: isFetchingPurchases } = useQuery( userPurchasesQuery() );

	const handleConfirmDelete = () => {
		mutation.mutate( void 0, {
			onSuccess: () => {
				createSuccessNotice( __( 'Account deletion initiated.' ), { type: 'snackbar' } );
				navigate( {
					to: '/me/account/closed',
				} );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to delete account.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	const handleDeleteClick = async () => {
		setShowConfirmModal( true );
	};

	const handleCloseModal = () => {
		setShowConfirmModal( false );
	};

	return (
		<>
			<Card>
				<CardBody>
					<ActionItem
						actions={
							<Button
								isBusy={ isFetchingPurchases }
								disabled={ mutation.isPending || isFetchingPurchases }
								onClick={ handleDeleteClick }
								isDestructive
								variant="secondary"
								size="compact"
							>
								{ __( 'Delete account' ) }
							</Button>
						}
						decoration={ <Icon icon={ trash } size={ 24 } /> }
						description={ __( 'Delete all of your sites and close your account completely.' ) }
						title={ __( 'Delete your account permanently' ) }
					/>
				</CardBody>
			</Card>

			{ showConfirmModal && (
				<AccountDeletionConfirmModal
					onClose={ handleCloseModal }
					onConfirm={ handleConfirmDelete }
					username={ user.username }
					isDeleting={ mutation.isPending }
					siteCount={ user.site_count || 0 }
					purchases={ purchases || [] }
				/>
			) }
		</>
	);
}
