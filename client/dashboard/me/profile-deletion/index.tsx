import {
	closeAccountMutation,
	monetizeSubscriptionsQuery,
	userPurchasesQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { trash } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { redirectAfterSessionEnd, useAuth } from '../../app/auth';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { ActionList } from '../../components/action-list';
import { wpcomLink } from '../../utils/link';
import AccountDeletionConfirmModal from './account-deletion-modal';

export default function AccountDeletionSection() {
	const { user } = useAuth();
	const [ showConfirmModal, setShowConfirmModal ] = useState( false );
	const mutation = useMutation( {
		...withSnackbar( closeAccountMutation(), {
			success: __( 'Account deletion initiated.' ),
			error: __( 'Failed to delete account.' ),
		} ),
		// Closing the account ends the session, so leave for the account-closed page,
		// which works signed out; the token lets it offer a restore. Set here rather
		// than on `mutate()` so it still runs if this component unmounts first.
		onSuccess: ( { token } ) =>
			redirectAfterSessionEnd(
				addQueryArgs( wpcomLink( '/me/account/closed' ), token ? { token } : {} )
			),
	} );
	// The page is on its way out once the account is closed, so stay busy until it goes.
	const isDeleting = mutation.isPending || mutation.isSuccess;
	const { data: purchases, isLoading: isFetchingPurchases } = useQuery( {
		...userPurchasesQuery(),
		enabled: showConfirmModal,
	} );
	const { data: monetizeSubscriptions, isLoading: isFetchingMonetizeSubscriptions } = useQuery( {
		...monetizeSubscriptionsQuery(),
		enabled: showConfirmModal,
	} );
	const isFetching = isFetchingPurchases || isFetchingMonetizeSubscriptions;

	const handleConfirmDelete = () => {
		mutation.mutate();
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
							isBusy={ isFetching }
							disabled={ isDeleting || isFetching }
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

			{ showConfirmModal && purchases && monetizeSubscriptions && (
				<AccountDeletionConfirmModal
					onClose={ handleCloseModal }
					onConfirm={ handleConfirmDelete }
					username={ user.username }
					isDeleting={ isDeleting }
					siteCount={ user.site_count || 0 }
					purchases={ purchases }
					monetizeSubscriptions={ monetizeSubscriptions }
				/>
			) }
		</>
	);
}
