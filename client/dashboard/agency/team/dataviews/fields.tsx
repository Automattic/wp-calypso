import { Badge } from '@automattic/ui';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { dateI18n } from '@wordpress/date';
import { __ } from '@wordpress/i18n';
import { OWNER_ROLE } from '../constants';
import type { TeamMember, TeamMemberStatus } from '@automattic/api-core';
import type { Field, Operator } from '@wordpress/dataviews';

function getRoleLabel( role?: string ): string {
	// Currently there are only two roles: owner and member. More may come later.
	return role === OWNER_ROLE ? __( 'Agency owner' ) : __( 'Team member' );
}

function getStatusLabel( status: TeamMemberStatus ): string {
	switch ( status ) {
		case 'active':
			return __( 'Active' );
		case 'expired':
			return __( 'Invite expired' );
		case 'pending':
		default:
			return __( 'Invite pending' );
	}
}

function getStatusIntent( status: TeamMemberStatus ): 'success' | 'warning' | 'error' {
	switch ( status ) {
		case 'active':
			return 'success';
		case 'expired':
			return 'error';
		case 'pending':
		default:
			return 'warning';
	}
}

function StatusBadge( { status }: { status: TeamMemberStatus } ) {
	return <Badge intent={ getStatusIntent( status ) }>{ getStatusLabel( status ) }</Badge>;
}

function MemberCell( { member }: { member: TeamMember } ) {
	const name = member.displayName ?? __( 'Team member' );
	return (
		<HStack spacing={ 3 } justify="flex-start" className="agency-team-member">
			{ member.avatar ? (
				<img className="agency-team-member__avatar" src={ member.avatar } alt="" />
			) : (
				<span className="agency-team-member__avatar agency-team-member__avatar-placeholder" />
			) }
			<VStack spacing={ 0 } className="agency-team-member__details">
				<span className="agency-team-member__name">{ name }</span>
				<Text variant="muted">{ member.email }</Text>
			</VStack>
		</HStack>
	);
}

const STATUS_ELEMENTS: { value: TeamMemberStatus; label: string }[] = [
	{ value: 'active', label: __( 'Active' ) },
	{ value: 'pending', label: __( 'Invite pending' ) },
	{ value: 'expired', label: __( 'Invite expired' ) },
];

export function useTeamFields(): Field< TeamMember >[] {
	return [
		{
			id: 'name',
			label: __( 'Name' ),
			enableHiding: false,
			enableSorting: false,
			enableGlobalSearch: true,
			getValue: ( { item } ) => [ item.displayName, item.email ].filter( Boolean ).join( ' ' ),
			render: ( { item } ) => <MemberCell member={ item } />,
		},
		{
			id: 'role',
			label: __( 'Role' ),
			enableSorting: false,
			getValue: ( { item } ) => ( item.status === 'active' ? getRoleLabel( item.role ) : '' ),
		},
		{
			id: 'status',
			label: __( 'Status' ),
			enableSorting: false,
			getValue: ( { item } ) => item.status,
			elements: STATUS_ELEMENTS,
			filterBy: { operators: [ 'isAny' as Operator ] },
			render: ( { item } ) => <StatusBadge status={ item.status } />,
		},
		{
			id: 'added',
			label: __( 'Added' ),
			enableSorting: false,
			getValue: ( { item } ) => item.dateAdded ?? '',
			render: ( { item } ) => {
				const timestamp = Number( item.dateAdded );
				return timestamp ? <>{ dateI18n( 'F j, Y', new Date( timestamp * 1000 ) ) }</> : <>—</>;
			},
		},
	];
}
