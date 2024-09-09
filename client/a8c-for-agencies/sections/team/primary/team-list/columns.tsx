import { Badge, Button, Gravatar, Gridicon } from '@automattic/components';
import { Icon, moreVertical } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import {
	A4AConfirmationDialog,
	Props as ConfirmationDialog,
} from 'calypso/a8c-for-agencies/components/a4a-confirmation-dialog';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
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
	const moment = useLocalizedMoment();
	const formattedDate = Number( date );
	return formattedDate ? (
		moment.unix( formattedDate ).format( 'MMMM D, YYYY' )
	) : (
		<Gridicon icon="minus" />
	);
};

export const ActionColumn = ( {
	member,
	onMenuSelected,
	canRemove = true,
}: {
	member: TeamMember;
	onMenuSelected?: ( action: string, callback?: () => void ) => void;
	canRemove?: boolean;
} ): ReactNode => {
	const translate = useTranslate();

	const [ showMenu, setShowMenu ] = useState( false );

	const buttonActionRef = useRef< HTMLButtonElement | null >( null );

	const [ confirmationDialog, setConfirmationDialog ] = useState< ConfirmationDialog | null >(
		null
	);

	const onToggleMenu = useCallback( () => {
		setShowMenu( ( current ) => ! current );
	}, [] );

	const onCloseMenu = useCallback( () => {
		setShowMenu( false );
	}, [] );

	const onSelect = useCallback(
		( {
			name,
			confirmation,
		}: {
			name: string;
			confirmation?: { title: string; children: ReactNode; ctaLabel: string };
		} ) => {
			if ( confirmation ) {
				setConfirmationDialog( {
					...confirmation,
					onConfirm: () => {
						setConfirmationDialog( ( prev ) => ( prev ? { ...prev, isLoading: true } : null ) );
						onMenuSelected?.( name, () => setConfirmationDialog( null ) );
					},
					onClose: () => {
						setConfirmationDialog( null );
					},
				} );
			} else {
				onMenuSelected?.( name );
			}
		},
		[ onMenuSelected ]
	);

	const actions = useMemo( () => {
		return member.status === 'pending'
			? [
					{
						name: 'resend-user-invite',
						label: translate( 'Resend invite' ),
						className: 'is-danger',
						isEnabled: true,
					},
					{
						name: 'cancel-user-invite',
						label: translate( 'Cancel invite' ),
						className: 'is-danger',
						isEnabled: true,
						confirmationDialog: {
							title: translate( 'Cancel invitation' ),
							children: translate(
								'Are you sure you want to cancel the invitation for {{b}}%(memberName)s{{/b}}?',
								{
									args: { memberName: member.displayName ?? member.email },
									components: {
										b: <b />,
									},
									comment: '%(memberName)s is the member name',
								}
							),
							ctaLabel: translate( 'Cancel invitation' ),
							isDestructive: true,
						},
					},
			  ]
			: [
					{
						name: 'password-reset',
						label: translate( 'Send password reset' ),
						isEnabled: false, // FIXME: Implement this action
					},
					{
						name: 'delete-user',
						label: translate( 'Delete user' ),
						className: 'is-danger',
						isEnabled: canRemove,
						confirmationDialog: {
							title: translate( 'Delete user' ),
							children: translate( 'Are you sure you want to delete {{b}}%(memberName)s{{/b}}?', {
								args: { memberName: member.displayName ?? member.email },
								components: {
									b: <b />,
								},
								comment: '%(memberName)s is the member name',
							} ),
							ctaLabel: translate( 'Delete user' ),
							isDestructive: true,
						},
					},
			  ];
	}, [ member, canRemove, translate ] );

	// We don't show the action menu when the member is the owner of the team.
	if ( member.role === OWNER_ROLE ) {
		return null;
	}

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
							onClick={ () =>
								onSelect( { name: action.name, confirmation: action.confirmationDialog } )
							}
							className={ clsx( 'team-list__action-menu-item', action.className ) }
						>
							{ action.label }
						</PopoverMenuItem>
					) ) }
			</PopoverMenu>

			{ confirmationDialog && <A4AConfirmationDialog { ...confirmationDialog } /> }
		</>
	);
};
