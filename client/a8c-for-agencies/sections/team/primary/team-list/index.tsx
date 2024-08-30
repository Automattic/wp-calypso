import page from '@automattic/calypso-router';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { Button } from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import { A4A_TEAM_INVITE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useCancelMemberInviteMutation from 'calypso/a8c-for-agencies/data/team/use-cancel-member-invite';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { useMemberList } from '../../hooks/use-member-list';
import { TeamMember } from '../../types';
import GetStarted from '../get-started';
import { ActionColumn, DateColumn, MemberColumn, RoleStatusColumn } from './columns';

import './style.scss';

export default function TeamList() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isDesktop = useDesktopBreakpoint();

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		layout: {
			styles: {
				actions: {
					width: isDesktop ? '10%' : undefined,
				},
			},
		},
	} );

	const { members, isPending, refetch } = useMemberList();

	const { mutate: cancelMemberInvite } = useCancelMemberInviteMutation();

	const title = translate( 'Manage team members' );

	const onInviteClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_team_invite_team_member_click' ) );
		page( A4A_TEAM_INVITE_LINK );
	};

	const handleAction = useCallback(
		( action: string, item: TeamMember ) => {
			if ( action === 'cancel-user-invite' ) {
				cancelMemberInvite(
					{ id: item.id },
					{
						onSuccess: () => {
							dispatch(
								successNotice( 'The invitation has been successfully cancelled.', {
									id: 'cancel-user-invite-success',
									duration: 5000,
								} )
							);
							refetch();
						},

						onError: ( error ) => {
							dispatch( errorNotice( error.message ) );
						},
					}
				);
			}
		},
		[ cancelMemberInvite, dispatch, refetch ]
	);

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
			{
				id: 'actions',
				getValue: () => '',
				label: '',
				render: ( { item }: { item: TeamMember } ): ReactNode => {
					return (
						<ActionColumn
							member={ item }
							onMenuSelected={ ( action ) => handleAction( action, item ) }
						/>
					);
				},
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ handleAction, isDesktop, translate ]
	);

	if ( isPending ) {
		// FIXME: Add placeholder when UI is pending
	}

	const { data: items, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( members, dataViewsState, fields );
	}, [ members, dataViewsState, fields ] );

	if ( items.length === 0 ) {
		return <GetStarted />;
	}

	return (
		<Layout className="team-list full-width-layout-with-table" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<Button variant="primary" onClick={ onInviteClick }>
							{ translate( 'Invite a team member' ) }
						</Button>
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<ItemsDataViews
					data={ {
						items,
						getItemId: ( user ) => `${ user.id }`,
						pagination: paginationInfo,
						enableSearch: false,
						fields,
						actions: [],
						setDataViewsState: setDataViewsState,
						dataViewsState: dataViewsState,
						defaultLayouts: { table: {} },
					} }
				/>
			</LayoutBody>
		</Layout>
	);
}
