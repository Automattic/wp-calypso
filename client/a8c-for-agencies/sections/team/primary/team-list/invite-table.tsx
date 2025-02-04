import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useMemo, useState } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import useHandleMemberAction from '../../hooks/use-handle-member-action';
import { TeamMember } from '../../types';
import { ActionColumn, MemberColumn, RoleStatusColumn } from './columns';

type Props = {
	members: TeamMember[];
	onRefresh?: () => void;
};

export function TeamInviteTable( { members, onRefresh }: Props ) {
	const translate = useTranslate();

	const isDesktop = useDesktopBreakpoint();

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		fields: [ 'user', 'status', 'actions' ],
		layout: {
			styles: {
				actions: {
					width: isDesktop ? '10%' : undefined,
				},
			},
		},
	} );

	const handleAction = useHandleMemberAction( { onRefetchList: onRefresh } );

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
							id: 'status',
							label: translate( 'Status' ).toUpperCase(),
							getValue: ( { item }: { item: TeamMember } ) => item.role || '',
							render: ( { item }: { item: TeamMember } ): ReactNode => {
								return <RoleStatusColumn member={ item } />;
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
							onMenuSelected={ ( action, callback ) => handleAction( action, item, callback ) }
						/>
					);
				},
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ handleAction, isDesktop, translate ]
	);

	const { data: items, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( members, dataViewsState, fields );
	}, [ members, dataViewsState, fields ] );

	return (
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
	);
}
