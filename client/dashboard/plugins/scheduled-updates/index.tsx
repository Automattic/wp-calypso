import { useLocale } from '@automattic/i18n-utils';
import { useNavigate } from '@tanstack/react-router';
import { FormToggle, Icon, Tooltip } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataViews, type Field, filterSortAndPaginate, Operator, View } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState, useCallback } from 'react';
import {
	pluginsScheduledUpdatesEditRoute,
	pluginsScheduledUpdatesNewRoute,
} from '../../app/router/plugins';
import ConfirmModal from '../../components/confirm-modal';
import { DataViewsCard } from '../../components/dataviews';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import SiteIcon from '../../components/site-icon';
import { SiteLink } from '../../sites/site-fields';
import { formatDate } from '../../utils/datetime';
import { prepareScheduleName } from './helpers';
import { useDeleteSchedules } from './hooks/use-delete-schedules';
import { useScheduledUpdates } from './hooks/use-scheduled-updates';
import { useToggleScheduleActive } from './hooks/use-toggle-schedule-active';
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

const getFields = (
	locale: string,
	onToggleActive: ( item: ScheduledUpdateRow, active: boolean ) => void
): Field< ScheduledUpdateRow >[] => {
	return [
		{
			id: 'site',
			label: __( 'Site' ),
			getValue: ( { item } ) => item.site.name,
			enableSorting: false,
			enableGlobalSearch: true,
		},
		{
			id: 'lastUpdate',
			type: 'datetime',
			label: __( 'Last update' ),
			render: ( { item } ) =>
				item.lastUpdate
					? formatDate( new Date( item.lastUpdate * 1000 ), locale, {
							dateStyle: 'medium',
							timeStyle: 'short',
					  } )
					: '-',
			filterBy: { operators: [] },
		},
		{
			id: 'nextUpdate',
			type: 'datetime',
			label: __( 'Next update' ),
			render: ( { item } ) =>
				formatDate( new Date( item.nextUpdate * 1000 ), locale, {
					dateStyle: 'medium',
					timeStyle: 'short',
				} ),
			filterBy: { operators: [] },
		},
		{
			id: 'schedule',
			type: 'text',
			label: __( 'Frequency' ),
			elements: [
				{ value: 'daily', label: __( 'Daily' ) },
				{ value: 'weekly', label: __( 'Weekly' ) },
			],
			filterBy: {
				operators: [ 'isAny' as Operator ],
			},
			render: ( { item } ) => ( item.schedule === 'daily' ? __( 'Daily' ) : __( 'Weekly' ) ),
		},
		{
			id: 'plugins',
			type: 'integer',
			label: __( 'Plugins' ),
			getValue: ( { item } ) => item.plugins.length,
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
			filterBy: { operators: [] },
		},
		{
			id: 'active',
			type: 'boolean',
			label: __( 'Active' ),
			elements: [
				{ value: true, label: __( 'Yes' ) },
				{ value: false, label: __( 'No' ) },
			],
			filterBy: {
				operators: [ 'is' as Operator ],
			},
			render: ( { item } ) => (
				<FormToggle
					checked={ item.active }
					onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) =>
						onToggleActive( item, e.target.checked )
					}
				/>
			),
		},
		{
			id: 'scheduleId',
			label: __( 'Schedule' ),
			getValue: ( { item } ) => getUniqueScheduleName( locale, item ),
			filterBy: { operators: [] },
		},
		{
			id: 'icon.ico',
			label: __( 'Site icon' ),
			render: ( { item } ) => <SiteIcon site={ item.site } />,
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
	groupBy: { field: 'scheduleId', direction: 'asc' },
	mediaField: 'icon.ico',
	showMedia: true,
};

export default function PluginsScheduledUpdates() {
	const [ view, setView ] = useState( defaultView );
	const [ scheduleToDelete, setScheduleToDelete ] = useState< ScheduledUpdateRow | null >( null );
	const [ isDeletingSchedule, setIsDeletingSchedule ] = useState( false );
	const locale = useLocale();
	const navigate = useNavigate();
	const { mutateAsync: toggleActive } = useToggleScheduleActive();
	const handleToggleActive = useCallback(
		( item: ScheduledUpdateRow, active: boolean ) => {
			void toggleActive( { siteId: item.site.ID, scheduleId: item.scheduleId, active } );
		},
		[ toggleActive ]
	);

	const fields = useMemo(
		() => getFields( locale, handleToggleActive ),
		[ locale, handleToggleActive ]
	);

	const { isLoading, scheduledUpdates } = useScheduledUpdates();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { mutateAsync: deleteSchedules } = useDeleteSchedules(
		scheduleToDelete ? [ scheduleToDelete.site.ID ] : [],
		scheduleToDelete?.scheduleId ?? '',
		{ optimistic: false }
	);
	const { data: filtered, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( scheduledUpdates, view, fields );
	}, [ scheduledUpdates, view, fields ] );

	const handleDeleteClick = ( schedule: ScheduledUpdateRow ) => {
		setScheduleToDelete( schedule );
	};

	const handleDeleteConfirm = async () => {
		if ( ! scheduleToDelete ) {
			return;
		}
		try {
			setIsDeletingSchedule( true );
			await deleteSchedules();
			createSuccessNotice( __( 'Schedule deleted successfully.' ), { type: 'snackbar' } );
		} catch ( e ) {
			const message = e instanceof Error ? e.message : __( 'Failed to delete schedule.' );
			createErrorNotice( message, { type: 'snackbar' } );
		} finally {
			setScheduleToDelete( null );
			setIsDeletingSchedule( false );
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
						description={ __( 'Schedule automatic plugin updates for your sites.' ) }
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
						renderItemLink={ ( { item, ...props } ) => (
							<SiteLink { ...props } site={ item.site } />
						) }
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
