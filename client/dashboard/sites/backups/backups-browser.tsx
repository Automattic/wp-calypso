import { __experimentalGrid as Grid } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useMemo } from 'react';
import { PerformanceTrackerStop } from '../../app/performance-tracking';
import { Card, CardBody } from '../../components/card';
import { BackupDetails } from './backup-details';
import { BackupDetailsSkeleton } from './backup-details-skeleton';
import { BackupsList } from './backups-list';
import { useActivityLog } from './use-activity-log';
import type { ActivityLogEntry, Site } from '@automattic/api-core';

export function useIsBackupsSmallViewport() {
	return useViewportMatch( 'xlarge', '<' );
}

// Single owner of the resolved selection so the page header and browser body can't disagree.
export function useBackupsBrowserState( {
	site,
	rewindId,
	dateRange,
	timezoneString,
	gmtOffset,
	enabled,
}: {
	site: Site;
	rewindId?: string;
	dateRange?: { start: Date; end: Date };
	timezoneString?: string;
	gmtOffset?: number;
	enabled?: boolean;
} ) {
	const isSmallViewport = useIsBackupsSmallViewport();

	const { activityLog, isLoadingActivityLog } = useActivityLog( {
		siteId: site.ID,
		dateRange,
		gmtOffset,
		timezoneString,
		enabled,
	} );

	const selectedBackup = useMemo< ActivityLogEntry | null >( () => {
		if ( rewindId ) {
			return activityLog?.find( ( item ) => item.rewind_id === rewindId ) ?? null;
		}
		if ( ! isSmallViewport ) {
			return activityLog?.[ 0 ] ?? null;
		}
		return null;
	}, [ rewindId, activityLog, isSmallViewport ] );

	return { activityLog, isLoadingActivityLog, selectedBackup, isSmallViewport };
}

interface BackupsBrowserProps {
	site: Site;
	activityLog: ActivityLogEntry[];
	isLoadingActivityLog: boolean;
	selectedBackup: ActivityLogEntry | null;
	isSmallViewport: boolean;
	dateRange?: { start: Date; end: Date };
	timezoneString?: string;
	gmtOffset?: number;
	searchParams?: Record< string, unknown >;
	onSelectBackup: ( backup: ActivityLogEntry | null ) => void;
	onRequestRestore?: ( backup: ActivityLogEntry ) => void;
	onRequestDownload?: ( backup: ActivityLogEntry ) => void;
	onGranularDownloadReady?: ( backup: ActivityLogEntry, downloadId: number ) => void;
}

export function BackupsBrowser( {
	site,
	activityLog,
	isLoadingActivityLog,
	selectedBackup,
	isSmallViewport,
	dateRange,
	timezoneString,
	gmtOffset,
	searchParams,
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
			siteId={ site.ID }
			searchParams={ searchParams }
			activityLog={ activityLog }
			isLoadingActivityLog={ isLoadingActivityLog }
			selectedBackup={ selectedBackup }
			setSelectedBackup={ onSelectBackup }
			dateRange={ dateRange }
			timezoneString={ timezoneString }
			gmtOffset={ gmtOffset }
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
