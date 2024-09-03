import { Badge, Button, Gravatar, Gridicon } from '@automattic/components';
import { Icon, moreVertical } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useCallback, useRef, useState } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
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
	return date ? new Date( date ).toLocaleDateString() : <Gridicon icon="minus" />;
};

export const ActionColumn = ( {
	member,
	onMenuSelected,
	withDelete = true,
}: {
	member: TeamMember;
	onMenuSelected?: ( action: string ) => void;
	withDelete?: boolean;
} ): ReactNode => {
	const translate = useTranslate();

	const [ showMenu, setShowMenu ] = useState( false );

	const buttonActionRef = useRef< HTMLButtonElement | null >( null );

	const onToggleMenu = useCallback( () => {
		setShowMenu( ( current ) => ! current );
	}, [] );

	const onCloseMenu = useCallback( () => {
		setShowMenu( false );
	}, [] );

	if ( member.role === OWNER_ROLE ) {
		return null;
	}

	const actions =
		member.status === 'pending'
			? [
					{
						name: 'cancel-user-invite',
						label: translate( 'Cancel invite' ),
						className: 'is-danger',
						isEnabled: true,
					},
			  ]
			: [
					{
						name: 'password-reset',
						label: translate( 'Send password reset' ),
						isEnabled: true,
					},
					{
						name: 'delete-user',
						label: translate( 'Delete user' ),
						className: 'is-danger',
						isEnabled: withDelete,
					},
			  ];

	return (
		<>
			<Button className="team-list__action-button" ref={ buttonActionRef } borderless>
				<Icon icon={ moreVertical } onClick={ onToggleMenu } />
			</Button>

			<PopoverMenu
				context={ buttonActionRef.current }
				isVisible={ showMenu }
				onClose={ onCloseMenu }
				position="bottom left"
			>
				{ actions
					.filter( ( { isEnabled } ) => isEnabled )
					.map( ( action ) => (
						<PopoverMenuItem
							key={ action.name }
							onClick={ () => onMenuSelected?.( action.name ) }
							className={ clsx( 'team-list__action-menu-item', action.className ) }
						>
							{ action.label }
						</PopoverMenuItem>
					) ) }
			</PopoverMenu>
		</>
	);
};
