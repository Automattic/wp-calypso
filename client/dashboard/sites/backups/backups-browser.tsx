import { siteBackupActivityLogGroupCountsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalGrid as Grid } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { useEffect, useMemo } from 'react';
import { usePersistentView } from '../../app/hooks/use-persistent-view';
import { PerformanceTrackerStop } from '../../app/performance-tracking';
import { Card, CardBody } from '../../components/card';
import { BackupDetails } from './backup-details';
import { BackupDetailsSkeleton } from './backup-details-skeleton';
import { BackupsList, defaultView } from './backups-list';
import { getFields } from './dataviews/fields';
import { useActivityLog } from './use-activity-log';
import type { ActivityLogEntry, Site } from '@automattic/api-core';
import type { Field, View } from '@wordpress/dataviews';

export function useIsBackupsSmallViewport() {
	return useViewportMatch( 'xlarge', '<' );
}

// Single owner of the resolved selection so the page header and browser body can't disagree.
// The view lives here too: the selection has to be resolved against the rows the list actually
// renders, because DataViews drops any selection that isn't in the data it was handed.
export function useBackupsBrowserState( {
	site,
	rewindId,
	dateRange,
	timezoneString,
	gmtOffset,
	searchParams,
	enabled,
}: {
	site: Site;
	rewindId?: string;
	dateRange?: { start: Date; end: Date };
	timezoneString?: string;
	gmtOffset?: number;
	searchParams?: Record< string, unknown >;
	enabled?: boolean;
} ) {
	const isSmallViewport = useIsBackupsSmallViewport();

	const { activityLog, isLoadingActivityLog, after, before } = useActivityLog( {
		siteId: site.ID,
		dateRange,
		gmtOffset,
		timezoneString,
		enabled,
	} );

	const { view, updateView, resetView } = usePersistentView( {
		slug: 'site-backups',
		defaultView,
		queryParams: searchParams,
	} );

	const { data: groupCountsData } = useQuery(
		siteBackupActivityLogGroupCountsQuery( site.ID, after, before )
	);

	const fields = getFields( groupCountsData?.groups, timezoneString, gmtOffset );
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( activityLog, view, fields );

	useEffect( () => {
		updateView( { ...view, page: 1 } );
		// eslint-disable-next-line react-hooks/exhaustive-deps -- reset page only when dateRange changes
	}, [ dateRange ] );

	const selectedBackup = useMemo< ActivityLogEntry | null >( () => {
		if ( rewindId ) {
			// Prefer a visible row so the list highlight and the details panel agree; `rewind_id`
			// isn't a unique key across the aggregated activity log, so an unfiltered lookup can
			// land on a sibling entry with a different `activity_id`.
			return (
				filteredData.find( ( item ) => item.rewind_id === rewindId ) ??
				activityLog.find( ( item ) => item.rewind_id === rewindId ) ??
				null
			);
		}
		if ( ! isSmallViewport ) {
			return filteredData[ 0 ] ?? null;
		}
		return null;
	}, [ rewindId, filteredData, activityLog, isSmallViewport ] );

	return {
		isLoadingActivityLog,
		selectedBackup,
		isSmallViewport,
		view,
		updateView,
		resetView,
		fields,
		filteredData,
		paginationInfo,
	};
}

interface BackupsBrowserProps {
	site: Site;
	isLoadingActivityLog: boolean;
	selectedBackup: ActivityLogEntry | null;
	isSmallViewport: boolean;
	timezoneString?: string;
	gmtOffset?: number;
	view: View;
	updateView: ( view: View ) => void;
	resetView?: () => void;
	fields: Field< ActivityLogEntry >[];
	filteredData: ActivityLogEntry[];
	paginationInfo: { totalItems: number; totalPages: number };
	onSelectBackup: ( backup: ActivityLogEntry | null ) => void;
	onRequestRestore?: ( backup: ActivityLogEntry ) => void;
	onRequestDownload?: ( backup: ActivityLogEntry ) => void;
	onGranularDownloadReady?: ( backup: ActivityLogEntry, downloadId: number ) => void;
}

export function BackupsBrowser( {
	site,
	isLoadingActivityLog,
	selectedBackup,
	isSmallViewport,
	timezoneString,
	gmtOffset,
	view,
	updateView,
	resetView,
	fields,
	filteredData,
	paginationInfo,
	onSelectBackup,
	onRequestRestore,
	onRequestDownload,
	onGranularDownloadReady,
}: BackupsBrowserProps ) {
	const renderDetails = ( backup: ActivityLogEntry ) => (
		<BackupDetails
			backup={ backup }
			site={ site }
			timezoneString={ timezoneString }
			gmtOffset={ gmtOffset }
			onRequestRestore={ onRequestRestore ? () => onRequestRestore( backup ) : undefined }
			onRequestDownload={ onRequestDownload ? () => onRequestDownload( backup ) : undefined }
			onGranularDownloadReady={
				onGranularDownloadReady
					? ( downloadId: number ) => onGranularDownloadReady( backup, downloadId )
					: undefined
			}
		/>
	);

	const renderList = () => (
		<BackupsList
			view={ view }
			updateView={ updateView }
			resetView={ resetView }
			fields={ fields }
			filteredData={ filteredData }
			paginationInfo={ paginationInfo }
			isLoadingActivityLog={ isLoadingActivityLog }
			selectedBackup={ selectedBackup }
			setSelectedBackup={ onSelectBackup }
		/>
	);

	if ( isSmallViewport ) {
		if ( selectedBackup ) {
			return (
				<>
					<PerformanceTrackerStop />
					{ renderDetails( selectedBackup ) }
				</>
			);
		}

		return (
			<>
				{ ! isLoadingActivityLog && <PerformanceTrackerStop /> }
				{ renderList() }
			</>
		);
	}

	const renderDetailsPanel = () => {
		if ( isLoadingActivityLog ) {
			return <BackupDetailsSkeleton />;
		}

		if ( selectedBackup ) {
			return renderDetails( selectedBackup );
		}

		return (
			<Card>
				<CardBody style={ { minHeight: '300px' } } children={ null } />
			</Card>
		);
	};

	return (
		<Grid columns={ 2 } templateColumns="40% 1fr">
			{ ! isLoadingActivityLog && <PerformanceTrackerStop /> }
			{ renderList() }
			{ renderDetailsPanel() }
		</Grid>
	);
}
