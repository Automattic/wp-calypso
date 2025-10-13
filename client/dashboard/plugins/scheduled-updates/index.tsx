import { hostingUpdateScheduleDeleteMutation } from '@automattic/api-queries';
import { useLocale } from '@automattic/i18n-utils';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { FormToggle, Icon, Tooltip } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataViews, type Field, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState } from 'react';
import {
	pluginsScheduledUpdatesEditRoute,
	pluginsScheduledUpdatesNewRoute,
} from '../../app/router/plugins';
import ConfirmModal from '../../components/confirm-modal';
import { DataViewsCard } from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { SiteIconLink } from '../../sites/site-fields';
import { formatDate } from '../../utils/datetime';
import { prepareScheduleName } from './helpers';
import { useScheduledUpdates } from './hooks/use-scheduled-updates';
import { ScheduledUpdateRow } from './types';

// Create stable mapping for unique schedule names with invisible suffixes
const getUniqueScheduleName = ( () => {
	const scheduleIdMap = new Map< string, number >();
	let counter = 0;

	return ( locale: string, item: ScheduledUpdateRow ) => {
		if ( ! scheduleIdMap.has( item.scheduleId ) ) {
			scheduleIdMap.set( item.scheduleId, ++counter );
		}
		const uniqueNumber = scheduleIdMap.get( item.scheduleId )!;
		const invisibleId = '\u200B'.repeat( uniqueNumber );
		return prepareScheduleName( locale, item ) + invisibleId;
	};
} )();

const getFields = ( locale: string ): Field< ScheduledUpdateRow >[] => {
	return [
		{
			id: 'site',
			type: 'text',
			label: __( 'Site' ),
			getValue: ( { item } ) => item.site.name,
		},
		{
			id: 'lastUpdate',
			type: 'integer',
			label: __( 'Last Update' ),
			render: ( { item } ) =>
				item.lastUpdate
					? formatDate( new Date( item.lastUpdate * 1000 ), locale, {
							dateStyle: 'medium',
							timeStyle: 'short',
					  } )
					: '-',
		},
		{
			id: 'nextUpdate',
			type: 'integer',
			label: __( 'Next Update' ),
			render: ( { item } ) =>
				formatDate( new Date( item.nextUpdate * 1000 ), locale, {
					dateStyle: 'medium',
					timeStyle: 'short',
				} ),
		},
		{
			id: 'schedule',
			type: 'text',
			label: __( 'Frequency' ),
			render: ( { item } ) => ( item.schedule === 'daily' ? __( 'Daily' ) : __( 'Weekly' ) ),
		},
		{
			id: 'plugins',
			type: 'text',
			label: __( 'Plugins' ),
			render: ( { item } ) => (
				<span
					style={ {
						alignItems: 'center',
						display: 'flex',
					} }
				>
					{ item.plugins.length }&nbsp;
					<Tooltip text={ item.plugins.join( ', ' ) }>
						<span
							style={ {
								alignItems: 'center',
								display: 'flex',
							} }
						>
							<Icon icon={ info } size={ 16 } />
						</span>
					</Tooltip>
				</span>
			),
		},
		{
			id: 'active',
			type: 'text',
			label: __( 'Active' ),
			render: ( { item } ) => <FormToggle checked={ item.active } onChange={ () => {} } />,
		},
		{
			id: 'actions',
			type: 'text',
			label: __( 'Actions' ),
		},
		{
			id: 'scheduleId',
			type: 'text',
			label: __( 'Schedule' ),
			getValue: ( { item } ) => getUniqueScheduleName( locale, item ),
		},
		{
			id: 'icon.ico',
			label: __( 'Site icon' ),
			render: ( { item } ) => <SiteIconLink site={ item.site } />,
			enableSorting: false,
			enableGlobalSearch: false,
		},
	];
};

export const defaultView: View = {
	type: 'table',
	perPage: 14,
	page: 1,
	search: '',
	filters: [],
	titleField: 'site',
	fields: [ 'lastUpdate', 'nextUpdate', 'schedule', 'plugins', 'active' ],
	sort: { field: 'site', direction: 'asc' },
	groupByField: 'scheduleId',
	mediaField: 'icon.ico',
	showMedia: true,
};

export default function PluginsScheduledUpdates() {
	const [ view, setView ] = useState( defaultView );
	const [ scheduleToDelete, setScheduleToDelete ] = useState< ScheduledUpdateRow | null >( null );
	const locale = useLocale();
	const navigate = useNavigate();
	const fields = useMemo( () => getFields( locale ), [ locale ] );

	const { isLoading, scheduledUpdates } = useScheduledUpdates();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { mutate: deleteSchedule, isPending: isDeletingSchedule } = useMutation(
		hostingUpdateScheduleDeleteMutation()
	);
	const { data: filtered, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( scheduledUpdates, view, fields );
	}, [ scheduledUpdates, view, fields ] );

	const handleDeleteClick = ( schedule: ScheduledUpdateRow ) => {
		setScheduleToDelete( schedule );
	};

	const handleDeleteConfirm = () => {
		if ( scheduleToDelete ) {
			deleteSchedule(
				{
					siteId: scheduleToDelete.site.ID,
					scheduleId: scheduleToDelete.scheduleId,
				},
				{
					onSuccess: () => {
						createSuccessNotice( __( 'Schedule deleted successfully.' ), { type: 'snackbar' } );
					},
					onError: ( error: Error ) => {
						createErrorNotice( error.message || __( 'Failed to delete schedule.' ), {
							type: 'snackbar',
						} );
					},
					onSettled: () => {
						setScheduleToDelete( null );
					},
				}
			);
		}
	};

	const handleDeleteCancel = () => {
		setScheduleToDelete( null );
	};

	return (
		<>
			<PageLayout
				size="large"
				header={
					<PageHeader
						title={ __( 'Scheduled updates' ) }
						actions={
							<RouterLinkButton
								variant="primary"
								to={ pluginsScheduledUpdatesNewRoute.to }
								__next40pxDefaultSize
							>
								{ __( 'New schedule' ) }
							</RouterLinkButton>
						}
					/>
				}
			>
				<DataViewsCard>
					<DataViews
						paginationInfo={ paginationInfo }
						fields={ fields }
						data={ filtered }
						defaultLayouts={ { table: {} } }
						view={ view }
						onChangeView={ setView }
						isLoading={ isLoading }
						empty={
							<p>
								{ scheduledUpdates.length === 0
									? __( 'No scheduled updates yet.' )
									: __(
											"We couldn't find any schedules based on your search criteria. You might want to check your search terms and try again."
									  ) }
							</p>
						}
						actions={ [
							{
								id: 'edit',
								label: __( 'Edit' ),
								isPrimary: true,
								callback: ( items ) => {
									const item = items[ 0 ];
									navigate( {
										to: pluginsScheduledUpdatesEditRoute.fullPath,
										params: { scheduleId: item?.scheduleId },
									} );
								},
							},
							{
								id: 'remove',
								label: __( 'Remove' ),
								isEligible: () => ! isDeletingSchedule,
								callback: ( items ) => {
									const item = items[ 0 ];
									if ( item ) {
										handleDeleteClick( item );
									}
								},
							},
						] }
					/>
				</DataViewsCard>
			</PageLayout>

			<ConfirmModal
				isOpen={ !! scheduleToDelete }
				confirmButtonProps={ {
					label: __( 'Delete schedule' ),
					isBusy: isDeletingSchedule,
					disabled: isDeletingSchedule,
				} }
				onCancel={ handleDeleteCancel }
				onConfirm={ handleDeleteConfirm }
			>
				{ __( 'Are you sure you want to delete this schedule?' ) }
			</ConfirmModal>
		</>
	);
}
