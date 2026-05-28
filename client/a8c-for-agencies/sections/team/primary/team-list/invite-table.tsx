import { getCurrentUser } from '@automattic/calypso-analytics';
import { useBreakpoint, useDesktopBreakpoint } from '@automattic/viewport-react';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { DataViews } from 'calypso/components/dataviews';
import { useSelector } from 'calypso/state';
import useHandleMemberAction from '../../hooks/use-handle-member-action';
import { TeamMember } from '../../types';
import { MemberColumn, RoleStatusColumn } from './columns';
import TeamActionDialog, { type TeamActionRequest } from './team-action-dialog';
import useTeamActions from './use-team-actions';

type Props = {
	members: TeamMember[];
	onRefresh?: () => void;
};

export function TeamInviteTable( { members, onRefresh }: Props ) {
	const translate = useTranslate();

	const isDesktop = useDesktopBreakpoint();
	const isNarrowView = useBreakpoint( '<660px' );

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		fields: isDesktop ? [ 'user', 'status' ] : [ 'user' ],
		layout: {
			styles: isDesktop
				? {
						user: { width: '60%' },
						status: { width: '30%' },
				  }
				: {},
		},
	} );

	const handleResendAction = useHandleMemberAction( { onRefetchList: onRefresh } );

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
		// Invited members can be cancelled regardless of remove capability —
		// transfer-ownership / delete-user only apply to active members.
		canRemove: false,
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
				>
					<HStack
						className="dataviews__view-actions"
						justify="end"
						style={ { paddingInline: isNarrowView ? '16px' : '64px' } }
					>
						<DataViews.ViewConfig />
					</HStack>
					<DataViews.Layout />
					<DataViews.Footer />
				</ItemsDataViews>
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
