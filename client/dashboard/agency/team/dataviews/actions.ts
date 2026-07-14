import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { OWNER_ROLE } from '../constants';
import type { TeamMember } from '@automattic/api-core';
import type { Action } from '@wordpress/dataviews';

export type TeamActionRequest =
	| { kind: 'cancel-invite'; member: TeamMember }
	| { kind: 'transfer-ownership'; member: TeamMember }
	| { kind: 'remove-member'; member: TeamMember; isSelf: boolean };

export function useTeamActions( {
	canRemove,
	currentUserEmail,
	onResendInvite,
	onConfirmAction,
}: {
	canRemove: boolean;
	currentUserEmail?: string;
	onResendInvite: ( member: TeamMember ) => void;
	onConfirmAction: ( request: TeamActionRequest ) => void;
} ): Action< TeamMember >[] {
	return useMemo( () => {
		const isNotOwner = ( item: TeamMember ) => item.role !== OWNER_ROLE;
		const isSelf = ( item: TeamMember ) => item.email === currentUserEmail;
		const isInvited = ( item: TeamMember ) =>
			item.status === 'pending' || item.status === 'expired';

		return [
			{
				id: 'resend-user-invite',
				label: __( 'Resend invite' ),
				isEligible: ( item: TeamMember ) => isNotOwner( item ) && isInvited( item ),
				callback: ( items: TeamMember[] ) => onResendInvite( items[ 0 ] ),
			},
			{
				id: 'cancel-user-invite',
				label: __( 'Cancel invite' ),
				isEligible: ( item: TeamMember ) => isNotOwner( item ) && isInvited( item ),
				callback: ( items: TeamMember[] ) =>
					onConfirmAction( { kind: 'cancel-invite', member: items[ 0 ] } ),
			},
			{
				id: 'transfer-ownership',
				label: __( 'Transfer ownership' ),
				isEligible: ( item: TeamMember ) =>
					isNotOwner( item ) && item.status === 'active' && ! isSelf( item ),
				callback: ( items: TeamMember[] ) =>
					onConfirmAction( { kind: 'transfer-ownership', member: items[ 0 ] } ),
			},
			{
				id: 'leave-agency',
				label: __( 'Leave agency' ),
				isEligible: ( item: TeamMember ) =>
					isNotOwner( item ) && item.status === 'active' && isSelf( item ),
				callback: ( items: TeamMember[] ) =>
					onConfirmAction( { kind: 'remove-member', member: items[ 0 ], isSelf: true } ),
			},
			{
				id: 'remove-team-member',
				label: __( 'Remove team member' ),
				isEligible: ( item: TeamMember ) =>
					isNotOwner( item ) && item.status === 'active' && ! isSelf( item ) && canRemove,
				callback: ( items: TeamMember[] ) =>
					onConfirmAction( { kind: 'remove-member', member: items[ 0 ], isSelf: false } ),
			},
		];
	}, [ canRemove, currentUserEmail, onResendInvite, onConfirmAction ] );
}
