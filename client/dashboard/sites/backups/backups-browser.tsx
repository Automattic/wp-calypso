import { __experimentalGrid as Grid } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useState, useEffect } from 'react';
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

interface BackupsBrowserProps {
	site: Site;
	rewindId?: string;
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
	rewindId,
	dateRange,
	timezoneString,
	gmtOffset,
	searchParams,
	onSelectBackup,
	onRequestRestore,
	onRequestDownload,
	onGranularDownloadReady,
}: BackupsBrowserProps ) {
	const isSmallViewport = useIsBackupsSmallViewport();
	const [ selectedBackup, setSelectedBackupInState ] = useState< ActivityLogEntry | null >( null );

	const { activityLog, isLoadingActivityLog } = useActivityLog( {
		siteId: site.ID,
		dateRange,
		gmtOffset,
		timezoneString,
	} );

	// Auto-select backup based on rewindId parameter.
	useEffect( () => {
		if ( rewindId && activityLog ) {
			const targetBackup = activityLog.find( ( item ) => item.rewind_id === rewindId );
			if ( targetBackup ) {
				setSelectedBackupInState( targetBackup );
			}
			return;
		}

		// Select the first backup on the index route (desktop only) to keep the panel populated.
		const backup = activityLog?.[ 0 ];
		if ( ! rewindId && backup && ! isSmallViewport ) {
			setSelectedBackupInState( backup );
		}

		if ( ! rewindId && ! backup ) {
			setSelectedBackupInState( null );
		}
	}, [ rewindId, activityLog, isSmallViewport ] );

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
