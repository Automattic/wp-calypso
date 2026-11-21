import { useLocale } from '@automattic/i18n-utils';
import { useNavigate } from '@tanstack/react-router';
import { FormToggle, Icon, Tooltip } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataViews, type Field, filterSortAndPaginate, Operator, View } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { info, plugins, scheduled } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState, useCallback } from 'react';
import { useAnalytics } from '../../app/analytics';
import { PerformanceTrackerStop } from '../../app/performance-tracking';
import {
	pluginsManageRoute,
	pluginsScheduledUpdatesEditRoute,
	pluginsScheduledUpdatesNewRoute,
} from '../../app/router/plugins';
import ConfirmModal from '../../components/confirm-modal';
import { DataViewsCard, DataViewsEmptyStateLayout } from '../../components/dataviews';
import EmptyState from '../../components/empty-state';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import SiteIcon from '../../components/site-icon';
import { SiteLink } from '../../sites/site-fields';
import { formatDate } from '../../utils/datetime';
import { useDeleteSchedules } from './hooks/use-delete-schedules';
import { useScheduledUpdates } from './hooks/use-scheduled-updates';
import { useToggleScheduleActive } from './hooks/use-toggle-schedule-active';
import { ScheduledUpdateRow } from './types';
import { prepareScheduleName } from './utils';

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

	const { isLoading, isSuccess, scheduledUpdates } = useScheduledUpdates();
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { mutateAsync: deleteSchedules } = useDeleteSchedules(
		scheduleToDelete ? [ scheduleToDelete.site.ID ] : [],
		scheduleToDelete?.scheduleId ?? '',
		{ optimistic: false }
	);
	const { data: filtered, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( scheduledUpdates, view, fields );
	}, [ scheduledUpdates, view, fields ] );

	const hasSchedules = scheduledUpdates.length > 0;
	const hasNoSchedules = isSuccess && ! hasSchedules;
	const hasSearch = !! view.search;
	const hasFilters = !! view.filters?.length;

	const newScheduleButton = (
		<RouterLinkButton
			variant="primary"
			to={ pluginsScheduledUpdatesNewRoute.to }
			__next40pxDefaultSize
		>
			{ __( 'New schedule' ) }
		</RouterLinkButton>
	);

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
						actions={ hasNoSchedules ? null : newScheduleButton }
					/>
				}
			>
				{ ! isLoading && <PerformanceTrackerStop /> }
				{ hasNoSchedules ? (
					<DataViewsEmptyStateLayout
						title={ __( 'Choose when your plugins update' ) }
						description={ __( 'Updates run daily or weekly, at the time you pick.' ) }
					>
						<EmptyState.ActionList>
							<EmptyState.ActionItem
								title={ __( 'New schedule' ) }
								description={ __( 'Select the sites, the plugins, and how often they update.' ) }
								decoration={ <Icon icon={ scheduled } size={ 24 } /> }
								actions={
									<RouterLinkButton
										variant="primary"
										size="compact"
										to={ pluginsScheduledUpdatesNewRoute.to }
										onClick={ () =>
											recordTracksEvent(
												'calypso_dashboard_plugins_scheduled_updates_empty_state_action_click',
												{ action: 'new-schedule' }
											)
										}
										__next40pxDefaultSize
									>
										{ __( 'New schedule' ) }
									</RouterLinkButton>
								}
							/>
							<EmptyState.ActionItem
								title={ __( 'Manage plugins' ) }
								description={ __( 'Update a plugin now, or turn on auto‑updates.' ) }
								decoration={ <Icon icon={ plugins } size={ 24 } /> }
								actions={
									<RouterLinkButton
										variant="secondary"
										size="compact"
										to={ pluginsManageRoute.to }
										onClick={ () =>
											recordTracksEvent(
												'calypso_dashboard_plugins_scheduled_updates_empty_state_action_click',
												{ action: 'manage-plugins' }
											)
										}
										__next40pxDefaultSize
									>
										{ __( 'Manage plugins' ) }
									</RouterLinkButton>
								}
							/>
						</EmptyState.ActionList>
					</DataViewsEmptyStateLayout>
				) : (
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
								hasSchedules && ( hasSearch || hasFilters ) ? (
									<DataViewsEmptyStateLayout
										isBorderless
										title={
											hasSearch
												? __( 'No schedules match your search' )
												: __( 'No schedules match your filters' )
										}
										description={
											hasSearch
												? __( 'Try a different search term.' )
												: __( 'Try different filters, or reset them.' )
										}
									/>
								) : undefined
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
				) }
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
