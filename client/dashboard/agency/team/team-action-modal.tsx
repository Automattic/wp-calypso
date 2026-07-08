import {
	agencyTeamCancelInviteMutation,
	agencyTeamRemoveMemberMutation,
	agencyTeamTransferOwnershipMutation,
} from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import ConfirmModal from '../../components/confirm-modal';
import type { TeamActionRequest } from './dataviews/actions';

const AGENCIES_MARKETING_URL = 'https://automattic.com/for/agencies';

interface TeamActionModalProps {
	agencyId: number;
	agencyName: string;
	request: TeamActionRequest;
	onClose: () => void;
}

export default function TeamActionModal( {
	agencyId,
	agencyName,
	request,
	onClose,
}: TeamActionModalProps ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const cancelInvite = useMutation( agencyTeamCancelInviteMutation( agencyId ) );
	const removeMember = useMutation( agencyTeamRemoveMemberMutation( agencyId ) );
	const transferOwnership = useMutation( agencyTeamTransferOwnershipMutation( agencyId ) );

	const member = request.member;
	const memberName = member.displayName ?? member.email;

	const notifyError = ( message: string ) => createErrorNotice( message, { type: 'snackbar' } );
	const notifySuccess = ( message: string ) => createSuccessNotice( message, { type: 'snackbar' } );

	if ( request.kind === 'cancel-invite' ) {
		return (
			<ConfirmModal
				title={ __( 'Cancel invitation' ) }
				confirmButtonProps={ {
					label: __( 'Cancel invitation' ),
					isDestructive: true,
					isBusy: cancelInvite.isPending,
					disabled: cancelInvite.isPending,
				} }
				isOpen
				onCancel={ onClose }
				onConfirm={ () =>
					cancelInvite.mutate( member.id, {
						onSuccess: () => {
							notifySuccess( __( 'The invitation has been successfully cancelled.' ) );
							onClose();
						},
						onError: () => notifyError( __( 'Failed to cancel the invitation.' ) ),
					} )
				}
			>
				{ createInterpolateElement(
					__( 'Are you sure you want to cancel the invitation for <memberName />?' ),
					{ memberName: <strong>{ memberName }</strong> }
				) }
			</ConfirmModal>
		);
	}

	if ( request.kind === 'transfer-ownership' ) {
		return (
			<ConfirmModal
				title={ __( 'Transfer agency ownership' ) }
				confirmButtonProps={ {
					label: __( 'Transfer ownership' ),
					isBusy: transferOwnership.isPending,
					disabled: transferOwnership.isPending,
				} }
				isOpen
				onCancel={ onClose }
				onConfirm={ () =>
					transferOwnership.mutate( member.id, {
						onSuccess: () => {
							notifySuccess( __( 'Ownership has been successfully transferred.' ) );
							onClose();
						},
						onError: () => notifyError( __( 'Failed to transfer ownership.' ) ),
					} )
				}
			>
				{ createInterpolateElement(
					__(
						'Are you sure you want to transfer ownership of <agencyName /> to <memberName />? This action cannot be undone and you will become a regular team member.'
					),
					{
						agencyName: <>{ agencyName }</>,
						memberName: <strong>{ memberName }</strong>,
					}
				) }
			</ConfirmModal>
		);
	}

	const isSelf = request.isSelf;

	return (
		<ConfirmModal
			title={
				isSelf
					? sprintf(
							/* translators: %s is the agency name. */
							__( 'Are you sure you want to leave %s?' ),
							agencyName
					  )
					: __( 'Remove team member' )
			}
			confirmButtonProps={ {
				label: isSelf ? __( 'Leave agency' ) : __( 'Remove team member' ),
				isDestructive: true,
				isBusy: removeMember.isPending,
				disabled: removeMember.isPending,
			} }
			isOpen
			onCancel={ onClose }
			onConfirm={ () =>
				removeMember.mutate( member.id, {
					onSuccess: () => {
						if ( isSelf ) {
							window.location.href = AGENCIES_MARKETING_URL;
							return;
						}
						notifySuccess( __( 'The member has been successfully removed.' ) );
						onClose();
					},
					onError: () => notifyError( __( 'Failed to remove the member.' ) ),
				} )
			}
		>
			{ isSelf
				? __(
						'By proceeding, you’ll lose management access of all sites that belong to this agency and you will be removed from this dashboard. The agency owner will need to re-invite you if you wish to gain access again.'
				  )
				: createInterpolateElement( __( 'Are you sure you want to remove <memberName />?' ), {
						memberName: <strong>{ memberName }</strong>,
				  } ) }
		</ConfirmModal>
	);
}
