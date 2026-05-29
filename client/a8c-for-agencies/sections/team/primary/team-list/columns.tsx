import { Badge, Gravatar } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import EmptyValueIndicator from 'calypso/a8c-for-agencies/components/empty-value-indicator';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { OWNER_ROLE } from '../../constants';
import { TeamMember } from '../../types';

export const RoleStatusColumn = ( { member }: { member: TeamMember } ): ReactNode => {
	const translate = useTranslate();

	const getRoleLabel = ( role?: string ): string => {
		// Currently, we only have two roles: 'owner' and 'member'. Later, we will have more roles.
		return role === OWNER_ROLE ? translate( 'Agency owner' ) : translate( 'Team member' );
	};

	const getStatusLabel = ( status: string ): string => {
		if ( status === 'expired' ) {
			return translate( 'Invite expired' );
		}

		return translate( 'Invite pending' );
	};

	if ( member.status !== 'active' ) {
		return (
			<Badge
				className="team-list__status-badge"
				type={ member.status === 'pending' ? 'warning' : 'error' }
			>
				{ getStatusLabel( member.status ) }
			</Badge>
		);
	}

	return <div className="team-list__role">{ getRoleLabel( member.role ) }</div>;
};

export const MemberColumn = ( {
	member,
	withRoleStatus,
}: {
	member: TeamMember;
	withRoleStatus: boolean;
} ): ReactNode => {
	const translate = useTranslate();

	return (
		<div className="team-list__member-column">
			<Gravatar
				className="team-list__member-column-gravatar"
				user={ {
					display_name: member.displayName,
					avatar_URL: member.avatar,
				} }
				size={ 40 }
			/>

			<div className="team-list__member-column-details">
				<div className="team-list__member-column-details-name">
					{ member.displayName ?? translate( 'Team member' ) }
				</div>
				<div className="team-list__member-column-details-email">{ member.email }</div>

				{ withRoleStatus && <RoleStatusColumn member={ member } /> }
			</div>
		</div>
	);
};

export const DateColumn = ( { date }: { date?: string } ): ReactNode => {
	const moment = useLocalizedMoment();
	const formattedDate = Number( date );
	return formattedDate ? (
		moment.unix( formattedDate ).format( 'MMMM D, YYYY' )
	) : (
		<EmptyValueIndicator />
	);
};
