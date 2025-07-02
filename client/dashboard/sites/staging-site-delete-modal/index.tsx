import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Modal,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import {
	stagingSiteDeleteMutation,
	automatedTransferStatusQuery,
} from '../../app/queries/site-staging-sites';
import type { Site } from '../../data/types';

export default function StagingSiteDeleteModal( {
	site,
	onClose,
}: {
	site: Site;
	onClose: () => void;
} ) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const productionSiteId = site.options?.wpcom_production_blog_id;

	// Main deletion mutation
	const deleteMutation = useMutation( {
		...stagingSiteDeleteMutation( site.ID, productionSiteId ?? 0 ),
		onSuccess: () => {
			// Start polling for automated transfer status after 3 seconds
			setTimeout( () => {
				queryClient.invalidateQueries( {
					queryKey: [ 'automated-transfer-status', site.ID ],
				} );
			}, 3000 );
		},
		onError: ( error: Error ) => {
			createErrorNotice( error.message || __( 'Failed to delete staging site' ), {
				type: 'snackbar',
			} );
		},
	} );

	// Automated transfer status query with polling
	const transferQuery = useQuery( {
		...automatedTransferStatusQuery( site.ID ),
		enabled: deleteMutation.isSuccess,
		refetchInterval: ( query ) => {
			const status = query.state.data?.status;
			// Stop polling when deletion is complete
			if ( status === 'reverted' || status === 'complete' || status === 'error' ) {
				// Call success handler when deletion is actually complete
				if ( status === 'reverted' ) {
					router.navigate( { to: '/sites' } );
					createSuccessNotice( __( 'Staging site deleted.' ), { type: 'snackbar' } );
					onClose();
				}
				return false;
			}
			return 3000; // Poll every 3 seconds
		},
	} );

	if ( ! productionSiteId ) {
		return null;
	}

	const handleDelete = () => {
		deleteMutation.mutate();
	};

	const isDeleting =
		deleteMutation.isPending ||
		( deleteMutation.isSuccess && transferQuery.data?.status !== 'reverted' );

	return (
		<Modal title={ __( 'Delete staging site' ) } size="medium" onRequestClose={ onClose }>
			<VStack spacing={ 4 }>
				<Text as="p">
					{ __(
						'Are you sure you want to delete this staging site? This action cannot be undone and will permanently remove all staging site content.'
					) }
				</Text>
				<HStack justify="flex-end">
					<Button variant="tertiary" disabled={ isDeleting } onClick={ onClose }>
						{ __( 'Cancel' ) }
					</Button>
					<Button
						variant="primary"
						isDestructive
						isBusy={ isDeleting }
						disabled={ isDeleting }
						onClick={ handleDelete }
					>
						{ isDeleting ? __( 'Deleting staging site' ) : __( 'Delete staging site' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
