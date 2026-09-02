import { DateRangePicker } from '@automattic/date-range-picker';
import { useQuery } from '@tanstack/react-query';
import { Button, Notice } from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import VisibleDaysLimitUpsell from 'calypso/components/activity-card-list/visible-days-limit-upsell';
import { DataViews } from 'calypso/components/dataviews';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import useActivityLogActorsQuery from 'calypso/data/activity-log/use-activity-log-actors-query';
import useActivityLogQuery from 'calypso/data/activity-log/use-activity-log-query';
import { getActionableRewindId } from 'calypso/lib/jetpack/actionable-rewind-id';
import {
	isSuccessfulRealtimeBackup,
	SUCCESSFUL_BACKUP_ACTIVITIES,
} from 'calypso/lib/jetpack/backup-utils';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import { navigate } from 'calypso/lib/navigate';
import wpcom from 'calypso/lib/wp';
import {
	backupContentsPath,
	backupDownloadPath,
	backupRestorePath,
} from 'calypso/my-sites/backup/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { rewindRequestBackup, updateFilter } from 'calypso/state/activity-log/actions';
import { filterStateToApiQuery } from 'calypso/state/activity-log/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import fromActivityTypeApi from 'calypso/state/data-layer/wpcom/sites/activity-types/from-api';
import canRestoreSite from 'calypso/state/rewind/selectors/can-restore-site';
import getActivityLogVisibleDays from 'calypso/state/rewind/selectors/get-activity-log-visible-days';
import getActivityLogFilter from 'calypso/state/selectors/get-activity-log-filter';
import getActivityLogHiddenGroups from 'calypso/state/selectors/get-activity-log-hidden-groups';
import getDoesRewindNeedCredentials from 'calypso/state/selectors/get-does-rewind-need-credentials';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import isJetpackSiteMultiSite from 'calypso/state/sites/selectors/is-jetpack-site-multi-site';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getFields } from './fields';
import type { ActivityActorOption, ActivityLogEntry } from './types';
import type { Action, Filter, View } from '@wordpress/dataviews';

import './style.scss';

const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const DEFAULT_VIEW: View = {
	type: 'table',
	fields: [ 'date', 'event', 'user' ],
	perPage: 20,
	page: 1,
	sort: {
		field: 'date',
		direction: 'desc',
	},
	layout: {
		styles: {
			date: { width: '220px' },
			event: { width: '100%' },
			user: { width: '200px' },
		},
	},
};

const buildViewFilters = ( filter: { group?: string[] | null; actor?: string[] | null } ) => {
	const filters: Filter[] = [];
	if ( filter.group?.length ) {
		filters.push( { field: 'group', operator: 'isAny', value: filter.group } );
	}
	if ( filter.actor?.length ) {
		filters.push( { field: 'actor', operator: 'isAny', value: filter.actor } );
	}
	return filters;
};

const getFilterValues = ( filters: Filter[] | undefined, field: string ): string[] =>
	filters?.find( ( f ) => f.field === field )?.value ?? [];

const arraysDiffer = ( a: string[], b: string[] ) =>
	a.length !== b.length || a.some( ( value ) => ! b.includes( value ) );

export default function ActivityLogDataViews( { showFilters = true }: { showFilters?: boolean } ) {
	const dispatch = useDispatch();
	const moment = useLocalizedMoment();

	const siteId = useSelector( getSelectedSiteId ) as number;
	const siteSlug = useSelector( getSelectedSiteSlug ) as string;
	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );
	const locale = useSelector( getCurrentUserLocale ) || 'en';
	const filter = useSelector( ( state ) => getActivityLogFilter( state, siteId ) );
	const notGroup = useSelector( ( state ) => getActivityLogHiddenGroups( state, siteId ) );
	const visibleDays = useSelector( ( state ) => getActivityLogVisibleDays( state, siteId ) );
	const isMultiSite = useSelector( ( state ) => isJetpackSiteMultiSite( state, siteId ) );
	const isRestoreEnabled = useSelector( ( state ) => canRestoreSite( state, siteId ) );
	const needsCredentials = useSelector( ( state ) =>
		getDoesRewindNeedCredentials( state, siteId )
	);

	const queryFilter = useMemo(
		() => ( notGroup ? { ...filter, notGroup } : filter ),
		[ filter, notGroup ]
	);

	const { data, isLoading, isError, refetch } = useActivityLogQuery( siteId, queryFilter, {
		enabled: !! siteId,
		refetchOnWindowFocus: false,
	} );

	const { data: groupTypes = [] } = useQuery( {
		queryKey: [
			'activity-log-counts',
			siteId,
			filter.before ?? '',
			filter.after ?? '',
			filter.on ?? '',
		],
		queryFn: () =>
			wpcom.req
				.get(
					{ path: `/sites/${ siteId }/activity/count/group`, apiNamespace: 'wpcom/v2' },
					filterStateToApiQuery(
						{ before: filter.before, after: filter.after, on: filter.on },
						false
					)
				)
				.then( fromActivityTypeApi ),
		enabled: !! siteId && showFilters,
		staleTime: 10 * 1000,
	} );

	const { data: actorsData } = useActivityLogActorsQuery( siteId, filter, {
		enabled: !! siteId && showFilters,
	} );
	const actorOptions = useMemo(
		() => ( actorsData ?? [] ) as ActivityActorOption[],
		[ actorsData ]
	);

	const [ view, setView ] = useState< View >( () => ( {
		...DEFAULT_VIEW,
		page: filter.page ?? 1,
		search: filter.textSearch ?? '',
		filters: buildViewFilters( filter ),
	} ) );

	// Reflect external filter changes (deep links, back/forward navigation)
	// into the view; values already in sync are left untouched to avoid loops.
	useEffect( () => {
		setView( ( previousView ) => {
			const next = { ...previousView };
			let changed = false;

			if ( ( filter.page ?? 1 ) !== ( previousView.page ?? 1 ) ) {
				next.page = filter.page ?? 1;
				changed = true;
			}
			if ( ( filter.textSearch ?? '' ) !== ( previousView.search ?? '' ) ) {
				next.search = filter.textSearch ?? '';
				changed = true;
			}
			const viewGroup = getFilterValues( previousView.filters, 'group' );
			const viewActor = getFilterValues( previousView.filters, 'actor' );
			if (
				arraysDiffer( filter.group ?? [], viewGroup ) ||
				arraysDiffer( filter.actor ?? [], viewActor )
			) {
				next.filters = buildViewFilters( filter );
				changed = true;
			}

			return changed ? next : previousView;
		} );
	}, [ filter ] );

	// Debounce text search dispatches so we don't refetch on every keystroke.
	const searchTimeoutRef = useRef< number | undefined >( undefined );
	useEffect( () => () => window.clearTimeout( searchTimeoutRef.current ), [] );

	const onChangeView = useCallback(
		( nextView: View ) => {
			setView( nextView );

			const nextGroup = getFilterValues( nextView.filters, 'group' );
			const nextActor = getFilterValues( nextView.filters, 'actor' );
			const filterUpdates: Record< string, unknown > = {};

			if ( arraysDiffer( nextGroup, filter.group ?? [] ) ) {
				filterUpdates.group = nextGroup.length ? nextGroup : null;
				filterUpdates.page = 1;
				dispatch(
					recordTracksEvent( 'calypso_activitylog_filterbar_select_type', {
						num_groups_selected: nextGroup.length,
					} )
				);
			}
			if ( arraysDiffer( nextActor, filter.actor ?? [] ) ) {
				filterUpdates.actor = nextActor.length ? nextActor : null;
				filterUpdates.page = 1;
				dispatch(
					recordTracksEvent( 'calypso_activitylog_filterbar_select_actor', {
						actor_count: nextActor.length,
					} )
				);
			}
			if ( ( nextView.page ?? 1 ) !== ( filter.page ?? 1 ) && ! filterUpdates.page ) {
				filterUpdates.page = nextView.page ?? 1;
			}
			if ( Object.keys( filterUpdates ).length ) {
				dispatch( updateFilter( siteId, filterUpdates ) );
			}

			const nextSearch = nextView.search ?? '';
			if ( nextSearch !== ( filter.textSearch ?? '' ) ) {
				window.clearTimeout( searchTimeoutRef.current );
				searchTimeoutRef.current = window.setTimeout( () => {
					dispatch( updateFilter( siteId, { textSearch: nextSearch || null, page: 1 } ) );
					dispatch( recordTracksEvent( 'calypso_activitylog_filterbar_text_search' ) );
				}, 500 );
			}
		},
		[ dispatch, siteId, filter.group, filter.actor, filter.page, filter.textSearch ]
	);

	const onDateRangeChange = useCallback(
		( next: { start: Date; end: Date } ) => {
			dispatch(
				updateFilter( siteId, {
					after: moment( next.start ).startOf( 'day' ).utc().format( DATE_FORMAT ),
					before: moment( next.end ).endOf( 'day' ).utc().format( DATE_FORMAT ),
					on: null,
					page: 1,
				} )
			);
		},
		[ dispatch, siteId, moment ]
	);

	const dateRange = useMemo( () => {
		const start = filter.after ? moment.utc( filter.after ).local().toDate() : null;
		const end = filter.before ? moment.utc( filter.before ).local().toDate() : null;
		return {
			start: start ?? moment().subtract( 29, 'days' ).toDate(),
			end: end ?? moment().toDate(),
		};
	}, [ filter.after, filter.before, moment ] );

	const logs = useMemo( () => ( data ?? [] ) as ActivityLogEntry[], [ data ] );

	// Rewind policies can cap how far back the log is visible; trim anything
	// older and offer the retention upsell when entries got cut off.
	const visibleLimitCutoffDate = useMemo(
		() =>
			Number.isFinite( visibleDays )
				? moment().subtract( visibleDays as number, 'days' )
				: undefined,
		[ visibleDays, moment ]
	);
	const visibleLogs = useMemo(
		() =>
			visibleLimitCutoffDate
				? logs.filter( ( log ) =>
						moment( log.activityTs ).isSameOrAfter( visibleLimitCutoffDate, 'day' )
				  )
				: logs,
		[ logs, visibleLimitCutoffDate, moment ]
	);
	const hasHiddenOlderLogs = visibleLogs.length < logs.length;

	const fields = useMemo(
		() =>
			getFields( {
				moment,
				timezone,
				gmtOffset,
				groupTypes,
				actorOptions,
				showFilters,
			} ),
		[ moment, timezone, gmtOffset, groupTypes, actorOptions, showFilters ]
	);

	// Group, actor, and text search are applied server-side through the
	// activity endpoint, so strip them before the client-side pass.
	const { data: visibleItems, paginationInfo } = useMemo( () => {
		const clientView = { ...view, filters: [], search: '' };
		return filterSortAndPaginate( visibleLogs, clientView, fields );
	}, [ visibleLogs, view, fields ] );

	const actions = useMemo( (): Action< ActivityLogEntry >[] => {
		const actionableId = ( item: ActivityLogEntry ) => getActionableRewindId( item );
		const isRewindableEvent = ( item: ActivityLogEntry ) =>
			!! actionableId( item ) &&
			( isSuccessfulRealtimeBackup( item ) ||
				!! item.streams?.some( ( stream ) => isSuccessfulRealtimeBackup( stream ) ) );

		return [
			{
				id: 'restore',
				label: __( 'Restore to this point' ),
				isEligible: ( item ) => ! isMultiSite && isRestoreEnabled && isRewindableEvent( item ),
				callback: ( [ item ] ) => {
					dispatch( recordTracksEvent( 'calypso_jetpack_backup_actions_restore_click' ) );
					navigate( backupRestorePath( siteSlug, String( actionableId( item ) ) ) );
				},
			},
			{
				id: 'activate-restores',
				label: __( 'Activate restores' ),
				isEligible: ( item ) => ! isMultiSite && needsCredentials && isRewindableEvent( item ),
				callback: () => {
					dispatch( recordTracksEvent( 'calypso_jetpack_backup_actions_credentials_click' ) );
					navigate( settingsPath( siteSlug ) );
				},
			},
			{
				id: 'view-files',
				label: __( 'View files' ),
				isEligible: ( item ) =>
					! isMultiSite &&
					isRewindableEvent( item ) &&
					SUCCESSFUL_BACKUP_ACTIVITIES.includes( item.activityName ),
				callback: ( [ item ] ) => {
					dispatch( recordTracksEvent( 'calypso_jetpack_backup_actions_view_files_click' ) );
					navigate( backupContentsPath( siteSlug, String( actionableId( item ) ) ) );
				},
			},
			{
				id: 'download',
				label: __( 'Download backup' ),
				isEligible: isRewindableEvent,
				callback: ( [ item ] ) => {
					const rewindId = actionableId( item );
					if ( ! rewindId ) {
						return;
					}
					dispatch(
						recordTracksEvent( 'calypso_jetpack_backup_actions_download_click', {
							rewind_id: rewindId,
						} )
					);
					dispatch( rewindRequestBackup( siteId, rewindId ) );
					navigate( backupDownloadPath( siteSlug, rewindId ) );
				},
			},
		];
	}, [ dispatch, siteId, siteSlug, isMultiSite, isRestoreEnabled, needsCredentials ] );

	const onResetFilters = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_activitylog_filterbar_reset' ) );
		dispatch(
			updateFilter( siteId, {
				group: null,
				after: null,
				before: null,
				on: null,
				actor: null,
				textSearch: null,
				page: 1,
			} )
		);
	}, [ dispatch, siteId ] );

	if ( isError ) {
		return (
			<Notice status="error" isDismissible={ false }>
				{ __( 'We couldn’t load your activity log. Please try again.' ) }
				<Button variant="link" onClick={ () => refetch() }>
					{ __( 'Retry' ) }
				</Button>
			</Notice>
		);
	}

	const isFiltered = !! (
		filter.group?.length ||
		filter.actor?.length ||
		filter.textSearch ||
		filter.after ||
		filter.before
	);

	return (
		<div className="activity-log-dataviews">
			{ showFilters && (
				<div className="activity-log-dataviews__controls">
					<DateRangePicker
						start={ dateRange.start }
						end={ dateRange.end }
						gmtOffset={ gmtOffset ?? undefined }
						timezoneString={ timezone ?? undefined }
						locale={ locale }
						defaultFallbackPreset="last-30-days"
						onChange={ onDateRangeChange }
					/>
				</div>
			) }
			<div className="activity-log-dataviews__list">
				<DataViews< ActivityLogEntry >
					data={ visibleItems }
					fields={ fields }
					view={ view }
					onChangeView={ onChangeView }
					actions={ actions }
					getItemId={ ( item ) => String( item.activityId ) }
					isLoading={ isLoading }
					defaultLayouts={ { table: {} } }
					paginationInfo={ paginationInfo }
					search={ showFilters }
					searchLabel={ __( 'Search posts by ID, title or author' ) }
					empty={
						<div className="activity-log-dataviews__empty">
							<p>{ __( 'No matching events found.' ) }</p>
							{ isFiltered && (
								<Button variant="link" onClick={ onResetFilters }>
									{ __( 'Remove all filters' ) }
								</Button>
							) }
						</div>
					}
				/>
			</div>
			{ hasHiddenOlderLogs && ( view.page ?? 1 ) >= paginationInfo.totalPages && (
				<VisibleDaysLimitUpsell />
			) }
		</div>
	);
}
