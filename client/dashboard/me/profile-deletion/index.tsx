import { closeAccountMutation, userPurchasesQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button, Icon } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { trash } from '@wordpress/icons';
import { useAuth } from '../../app/auth';
import { ActionList } from '../../components/action-list';
import AccountDeletionConfirmModal from './account-deletion-modal';

export default function AccountDeletionSection() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [ showConfirmModal, setShowConfirmModal ] = useState( false );
	const mutation = useMutation( {
		...closeAccountMutation(),
		meta: {
			snackbar: {
				success: __( 'Account deletion initiated.' ),
				error: __( 'Failed to delete account.' ),
			},
		},
	} );
	const { data: purchases, isLoading: isFetchingPurchases } = useQuery( userPurchasesQuery() );

	const handleConfirmDelete = () => {
		mutation.mutate( void 0, {
			onSuccess: () => {
				navigate( {
					to: '/me/account/closed',
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
			<ActionList>
				<ActionList.ActionItem
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
			</ActionList>

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
