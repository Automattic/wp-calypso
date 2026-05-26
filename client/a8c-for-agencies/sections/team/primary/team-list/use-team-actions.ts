import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { OWNER_ROLE } from '../../constants';
import { TeamMember } from '../../types';
import type { TeamActionRequest } from './team-action-dialog';

export default function useTeamActions( {
	canRemove,
	currentUserEmail,
	onResendInvite,
	onConfirmAction,
}: {
	canRemove: boolean;
	currentUserEmail?: string;
	onResendInvite: ( member: TeamMember ) => void;
	onConfirmAction: ( request: TeamActionRequest ) => void;
} ) {
	const translate = useTranslate();

	return useMemo( () => {
		const isNotOwner = ( item: TeamMember ) => item.role !== OWNER_ROLE;
		const isSelf = ( item: TeamMember ) => item.email === currentUserEmail;
		const isInvited = ( item: TeamMember ) =>
			item.status === 'pending' || item.status === 'expired';

		return [
			{
				id: 'resend-user-invite',
				label: translate( 'Resend invite' ),
				isEligible( item: TeamMember ) {
					return isNotOwner( item ) && isInvited( item );
				},
				callback( items: TeamMember[] ) {
					onResendInvite( items[ 0 ] );
				},
			},
			{
				id: 'cancel-user-invite',
				label: translate( 'Cancel invite' ),
				isEligible( item: TeamMember ) {
					return isNotOwner( item ) && isInvited( item );
				},
				callback( items: TeamMember[] ) {
					onConfirmAction( { kind: 'cancel-invite', member: items[ 0 ] } );
				},
			},
			{
				id: 'transfer-ownership',
				label: translate( 'Transfer ownership' ),
				isEligible( item: TeamMember ) {
					return isNotOwner( item ) && item.status === 'active' && ! isSelf( item );
				},
				callback( items: TeamMember[] ) {
					onConfirmAction( { kind: 'transfer-ownership', member: items[ 0 ] } );
				},
			},
			{
				id: 'leave-agency',
				label: translate( 'Leave agency' ),
				isEligible( item: TeamMember ) {
					return isNotOwner( item ) && item.status === 'active' && isSelf( item );
				},
				callback( items: TeamMember[] ) {
					onConfirmAction( { kind: 'remove-member', member: items[ 0 ], isSelf: true } );
				},
			},
			{
				id: 'remove-team-member',
				label: translate( 'Remove team member' ),
				isEligible( item: TeamMember ) {
					return isNotOwner( item ) && item.status === 'active' && ! isSelf( item ) && canRemove;
				},
				callback( items: TeamMember[] ) {
					onConfirmAction( { kind: 'remove-member', member: items[ 0 ], isSelf: false } );
				},
			},
		];
	}, [ translate, currentUserEmail, canRemove, onResendInvite, onConfirmAction ] );
}
