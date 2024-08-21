import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useMemo, useState } from 'react';
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
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { TeamMember } from '../../types';
import GetStarted from '../get-started';
import { ActionColumn, DateColumn, MemberColumn, RoleStatusColumn } from './columns';

import './style.scss';

export default function TeamList() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( initialDataViewsState );

	const title = translate( 'Manage team members' );

	const onInviteClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_team_invite_team_member_click' ) );
		page( A4A_TEAM_INVITE_LINK );
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleAction = ( action: string, item: TeamMember ) => {
		// FIXME: Implement action handling
	};

	const fields = useMemo(
		() => [
			{
				id: 'user',
				header: translate( 'User' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: TeamMember } ): ReactNode => {
					return <MemberColumn member={ item } />;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'role',
				header: translate( 'Role' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: TeamMember } ): ReactNode => {
					return <RoleStatusColumn member={ item } />;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'added-date',
				header: translate( 'Added' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: TeamMember } ): ReactNode => {
					return <DateColumn date={ item.dateAdded } />;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'actions',
				header: '',
				getValue: () => '-',
				render: ( { item }: { item: TeamMember } ): ReactNode => {
					return (
						<ActionColumn
							member={ item }
							onMenuSelected={ ( action ) => handleAction( action, item ) }
						/>
					);
				},
				width: '40%',
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ translate ]
	);

	// FIXME: Fetch team members
	const members: TeamMember[] = [
		{
			displayName: 'Owner',
			email: 'owner@automattic.com',
			role: 'owner',
			status: 'active',
		},
		{
			displayName: 'User 1',
			email: 'user1@automattic.com',
			role: 'member',
			status: 'active',
			dateAdded: new Date().toDateString(),
		},
		{
			displayName: 'User 2',
			email: 'user2@automattic.com',
			role: 'member',
			status: 'pending',
			dateAdded: new Date().toDateString(),
		},
		{
			email: 'user3@automattic.com',
			role: 'member',
			status: 'expired',
		},
	];

	const isEmpty = members.length <= 1; // We always have one member (owner) so we exclude it from count.

	if ( isEmpty ) {
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
						items: members,
						getItemId: ( user ) => `${ user.id }`,
						pagination: {
							totalItems: 1,
							totalPages: 1,
						},
						enableSearch: false,
						fields: fields,
						actions: [],
						setDataViewsState: setDataViewsState,
						dataViewsState: dataViewsState,
					} }
				/>
			</LayoutBody>
		</Layout>
	);
}
