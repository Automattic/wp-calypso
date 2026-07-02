import { siteBySlugQuery, siteSettingsQuery } from '@automattic/api-queries';
import { DateRangePicker } from '@automattic/date-range-picker';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams, useRouter } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import Breadcrumbs from '../../../app/breadcrumbs';
import { useDateRange } from '../../../app/hooks/use-date-range';
import { useLocale } from '../../../app/locale';
import {
	agencySiteRoute,
	agencySiteBackupsRoute,
	agencySiteBackupsIndexRoute,
	agencySiteBackupDetailRoute,
	agencySiteBackupRestoreRoute,
	agencySiteBackupDownloadRoute,
} from '../../../app/router/agency';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { BackupNotices } from '../../../sites/backups/backup-notices';
import { BackupNowButton } from '../../../sites/backups/backup-now-button';
import { BackupsBrowser, useIsBackupsSmallViewport } from '../../../sites/backups/backups-browser';
import { useBackupState } from '../../../sites/backups/use-backup-state';
import type { ActivityLogEntry } from '@automattic/api-core';

export default function AgencySiteBackupsListPage() {
	const { siteSlug } = agencySiteRoute.useParams();
	const router = useRouter();
	const locale = useLocale();

	const routeParams = useParams( { strict: false, shouldThrow: false } ) as
		| { rewindId?: string }
		| undefined;
	const rewindId = routeParams?.rewindId;
	const searchParams = agencySiteBackupsRoute.useSearch();

	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const { data: siteSettings } = useSuspenseQuery( {
		...siteSettingsQuery( site.ID ),
		select: ( s ) => ( {
			gmtOffset: Number( s?.gmt_offset ) || 0,
			timezoneString: s?.timezone_string || undefined,
		} ),
	} );
	const { gmtOffset, timezoneString } = siteSettings;

	const backupState = useBackupState( site.ID );

	const { dateRange, handleDateRangeChange } = useDateRange( {
		timezoneString,
		gmtOffset,
		defaultDays: 30,
	} );

	const navigateToBackup = useCallback(
		( selected: ActivityLogEntry | null ) => {
			router.navigate(
				selected
					? {
							to: agencySiteBackupDetailRoute.fullPath,
							params: { siteSlug, rewindId: selected.rewind_id },
							search: ( query: Record< string, string > ) => query,
					  }
					: {
							to: agencySiteBackupsIndexRoute.fullPath,
							params: { siteSlug },
							search: ( query: Record< string, string > ) => query,
					  }
			);
		},
		[ router, siteSlug ]
	);

	const handleRequestRestore = ( selected: ActivityLogEntry ) => {
		router.navigate( {
			to: agencySiteBackupRestoreRoute.fullPath,
			params: { siteSlug, rewindId: selected.rewind_id },
		} );
	};

	const handleRequestDownload = ( selected: ActivityLogEntry ) => {
		router.navigate( {
			to: agencySiteBackupDownloadRoute.fullPath,
			params: { siteSlug, rewindId: selected.rewind_id },
		} );
	};

	const handleGranularDownloadReady = ( selected: ActivityLogEntry, downloadId: number ) => {
		router.navigate( {
			to: agencySiteBackupDownloadRoute.fullPath,
			params: { siteSlug, rewindId: selected.rewind_id },
			search: { downloadId },
		} );
	};

	const handleDateRangeChangeWrapper = ( next: { start: Date; end: Date } ) => {
		handleDateRangeChange( next );
		navigateToBackup( null );
	};

	const isMobileDetailsView = useIsBackupsSmallViewport() && !! rewindId;

	const actions = (
		<>
			{ /* This div is required to fix a layout width issue when the DateRangePicker is placed together with the BackupNowButton. */ }
			<div>
				<DateRangePicker
					start={ dateRange.start }
					end={ dateRange.end }
					gmtOffset={ gmtOffset }
					timezoneString={ timezoneString }
					locale={ locale }
					defaultFallbackPreset="last-30-days"
					onChange={ handleDateRangeChangeWrapper }
				/>
			</div>
			<BackupNowButton site={ site } backupState={ backupState } />
		</>
	);

	return (
		<PageLayout
			header={
				<PageHeader
					title={ isMobileDetailsView ? __( 'Backup details' ) : __( 'Backups' ) }
					description={ __(
						'Access and restore your site backups, powered by Jetpack VaultPress Backup.'
					) }
					prefix={ isMobileDetailsView ? <Breadcrumbs length={ 2 } /> : undefined }
					actions={ isMobileDetailsView ? undefined : actions }
				/>
			}
			notices={
				! isMobileDetailsView && backupState.status !== 'idle' ? (
					<BackupNotices
						backupState={ backupState }
						site={ site }
						timezoneString={ timezoneString }
						gmtOffset={ gmtOffset }
					/>
				) : undefined
			}
		>
			<BackupsBrowser
				site={ site }
				rewindId={ rewindId }
				dateRange={ dateRange }
				timezoneString={ timezoneString }
				gmtOffset={ gmtOffset }
				searchParams={ searchParams }
				onSelectBackup={ navigateToBackup }
				onRequestRestore={ handleRequestRestore }
				onRequestDownload={ handleRequestDownload }
				onGranularDownloadReady={ handleGranularDownloadReady }
			/>
		</PageLayout>
	);
}
