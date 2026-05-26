import { getCurrentUser } from '@automattic/calypso-analytics';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { useSelector } from 'calypso/state';
import { hasAgencyCapability } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { A4AStore } from 'calypso/state/a8c-for-agencies/types';
import useHandleMemberAction from '../../hooks/use-handle-member-action';
import { TeamMember } from '../../types';
import { DateColumn, MemberColumn, RoleStatusColumn } from './columns';
import TeamActionDialog, { type TeamActionRequest } from './team-action-dialog';
import useTeamActions from './use-team-actions';

type Props = {
	members: TeamMember[];
	onRefresh?: () => void;
};

export function TeamMemberTable( { members, onRefresh }: Props ) {
	const translate = useTranslate();

	const isDesktop = useDesktopBreakpoint();

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		fields: isDesktop ? [ 'user', 'role', 'added-date' ] : [ 'user' ],
		layout: {
			styles: isDesktop
				? {
						user: { width: '40%' },
						role: { width: '25%' },
						'added-date': { width: '25%' },
				  }
				: {},
		},
	} );

	const handleResendAction = useHandleMemberAction( { onRefetchList: onRefresh } );

	const canRemove = useSelector( ( state: A4AStore ) =>
		hasAgencyCapability( state, 'a4a_remove_users' )
	);

	const currentUser = useSelector( getCurrentUser );

	const [ activeRequest, setActiveRequest ] = useState< TeamActionRequest | null >( null );

	const closeRequest = useCallback( () => setActiveRequest( null ), [] );

	const onResendInvite = useCallback(
		( member: TeamMember ) => {
			handleResendAction( 'resend-user-invite', member );
		},
		[ handleResendAction ]
	);

	const actions = useTeamActions( {
		canRemove,
		currentUserEmail: currentUser?.email,
		onResendInvite,
		onConfirmAction: setActiveRequest,
	} );

	const fields = useMemo(
		() => [
			{
				id: 'user',
				label: translate( 'User' ).toUpperCase(),
				getValue: ( { item }: { item: TeamMember } ) => item.displayName ?? '',
				render: ( { item }: { item: TeamMember } ): ReactNode => {
					return <MemberColumn member={ item } withRoleStatus={ ! isDesktop } />;
				},
				enableHiding: false,
				enableSorting: false,
			},
			...( isDesktop
				? [
						{
							id: 'role',
							label: translate( 'Role' ).toUpperCase(),
							getValue: ( { item }: { item: TeamMember } ) => item.role || '',
							render: ( { item }: { item: TeamMember } ): ReactNode => {
								return <RoleStatusColumn member={ item } />;
							},
							enableHiding: false,
							enableSorting: false,
						},
						{
							id: 'added-date',
							getValue: ( { item }: { item: TeamMember } ): string => item.dateAdded || '',
							label: translate( 'Added' ).toUpperCase(),
							render: ( { item }: { item: TeamMember } ): ReactNode => {
								return <DateColumn date={ item.dateAdded } />;
							},
							enableHiding: false,
							enableSorting: false,
						},
				  ]
				: [] ),
		],
		[ isDesktop, translate ]
	);

	const { data: items, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( members, dataViewsState, fields );
	}, [ members, dataViewsState, fields ] );

	return (
		<>
			<div className="redesigned-a8c-table full-width">
				<ItemsDataViews
					data={ {
						items,
						getItemId: ( user ) => `${ user.id }`,
						pagination: paginationInfo,
						enableSearch: false,
						fields,
						actions,
						setDataViewsState: setDataViewsState,
						dataViewsState: dataViewsState,
						defaultLayouts: { table: {} },
					} }
				/>
			</div>

			{ activeRequest && (
				<TeamActionDialog
					request={ activeRequest }
					onClose={ closeRequest }
					onRefresh={ onRefresh }
				/>
			) }
		</>
	);
}
