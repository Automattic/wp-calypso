import { getCurrentUser } from '@automattic/calypso-analytics';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import useCancelMemberInviteMutation from 'calypso/a8c-for-agencies/data/team/use-cancel-member-invite';
import useRemoveMemberMutation from 'calypso/a8c-for-agencies/data/team/use-remove-member';
import useResendMemberInviteMutation from 'calypso/a8c-for-agencies/data/team/use-resend-member-invite';
import useTransferOwnershipMutation from 'calypso/a8c-for-agencies/data/team/use-transfer-ownership';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { TeamMember } from '../types';

type Props = {
	onRefetchList?: () => void;
};

export default function useHandleMemberAction( { onRefetchList }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { mutate: resendMemberInvite } = useResendMemberInviteMutation();

	const { mutate: cancelMemberInvite } = useCancelMemberInviteMutation();

	const { mutate: removeMember } = useRemoveMemberMutation();

	const { mutate: transferOwnership } = useTransferOwnershipMutation();

	const currentUser = useSelector( getCurrentUser );

	return useCallback(
		( action: string, item: TeamMember, callback?: () => void ) => {
			if ( action === 'resend-user-invite' ) {
				resendMemberInvite(
					{ id: item.id },
					{
						onSuccess: () => {
							dispatch(
								successNotice( translate( 'The invitation has been resent.' ), {
									id: 'resend-user-invite-success',
									duration: 5000,
								} )
							);
							onRefetchList?.();
							callback?.();
						},

						onError: ( error ) => {
							dispatch(
								errorNotice( error.message, {
									id: 'resend-user-invite-error',
									duration: 5000,
								} )
							);
							callback?.();
						},
					}
				);
			}

			if ( action === 'cancel-user-invite' ) {
				cancelMemberInvite(
					{ id: item.id },
					{
						onSuccess: () => {
							dispatch(
								successNotice( translate( 'The invitation has been successfully cancelled.' ), {
									id: 'cancel-user-invite-success',
									duration: 5000,
								} )
							);
							onRefetchList?.();
							callback?.();
						},

						onError: ( error ) => {
							dispatch(
								errorNotice( error.message, {
									id: 'cancel-user-invite-error',
									duration: 5000,
								} )
							);
							callback?.();
						},
					}
				);
			}

			if ( action === 'delete-user' ) {
				removeMember(
					{ id: item.id },
					{
						onSuccess: () => {
							if ( item.email === currentUser?.email ) {
								window.location.href = 'https://automattic.com/for/agencies';
								return;
							}

							dispatch(
								successNotice( translate( 'The member has been successfully removed.' ), {
									id: 'remove-user-success',
									duration: 5000,
								} )
							);
							onRefetchList?.();
							callback?.();
						},

						onError: ( error ) => {
							dispatch(
								errorNotice( error.message, {
									id: 'remove-user-error',
									duration: 5000,
								} )
							);
							callback?.();
						},
					}
				);
			}

			if ( action === 'transfer-ownership' ) {
				transferOwnership(
					{ id: item.id },
					{
						onSuccess: () => {
							dispatch(
								successNotice( translate( 'Ownership has been successfully transferred.' ), {
									id: 'transfer-ownership-success',
									duration: 5000,
								} )
							);
							onRefetchList?.();
							callback?.();
						},

						onError: ( error ) => {
							dispatch(
								errorNotice( error.message, {
									id: 'transfer-ownership-error',
									duration: 5000,
								} )
							);
							callback?.();
						},
					}
				);
			}
		},
		[
			cancelMemberInvite,
			currentUser?.email,
			dispatch,
			onRefetchList,
			removeMember,
			resendMemberInvite,
			translate,
			transferOwnership,
		]
	);
}
