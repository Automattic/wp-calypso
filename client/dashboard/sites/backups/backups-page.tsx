import { siteSettingsQuery } from '@automattic/api-queries';
import { DateRangePicker } from '@automattic/date-range-picker';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { useDateRange } from '../../app/hooks/use-date-range';
import { useLocale } from '../../app/locale';
import { PerformanceTrackerStop } from '../../app/performance-tracking';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { BackupNotices } from './backup-notices';
import { BackupNowButton } from './backup-now-button';
import { BackupsBrowser, useBackupsBrowserState } from './backups-browser';
import { useBackupState } from './use-backup-state';
import type { Site } from '@automattic/api-core';
import type { ReactNode } from 'react';

// The route-specific navigation each variant (dotcom, A4A) wires to its own route tree,
// so the page shell below stays route-agnostic. Passing `null` clears back to the index route.
export interface BackupsNavigation {
	selectBackup: ( rewindId: string | null ) => void;
	requestRestore: ( rewindId: string ) => void;
	requestDownload: ( rewindId: string, downloadId?: number ) => void;
}

interface BackupsPageProps {
	site: Site;
	navigation: BackupsNavigation;
	rewindId?: string;
	searchParams?: Record< string, unknown >;
	hasBackups?: boolean;
	extraNotices?: ReactNode;
}

export function BackupsPage( {
	site,
	navigation,
	rewindId,
	searchParams,
	hasBackups = true,
	extraNotices,
}: BackupsPageProps ) {
	const locale = useLocale();
	const backupState = useBackupState( site.ID );

	const { data: siteSettings } = useSuspenseQuery( siteSettingsQuery( site.ID ) );
	const gmtOffset = siteSettings.gmt_offset;
	const timezoneString = siteSettings.timezone_string;

	const { dateRange, handleDateRangeChange } = useDateRange( {
		timezoneString,
		gmtOffset,
		defaultDays: 30,
	} );

	const { activityLog, isLoadingActivityLog, selectedBackup, isSmallViewport } =
		useBackupsBrowserState( {
			site,
			rewindId,
			dateRange,
			timezoneString,
			gmtOffset,
			enabled: hasBackups,
		} );
	const isMobileDetailsView = isSmallViewport && !! selectedBackup;
	const shouldShowActions = hasBackups && ! isMobileDetailsView;

	const handleDateRangeChangeWrapper = ( next: { start: Date; end: Date } ) => {
		handleDateRangeChange( next );
		navigation.selectBackup( null );
	};

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
					actions={ shouldShowActions ? actions : undefined }
				/>
			}
			notices={
				<>
					{ /* Action feedback, not an on-load banner: rendered outside the arbiter. */ }
					{ ! isMobileDetailsView && backupState.status !== 'idle' && (
						<BackupNotices
							backupState={ backupState }
							site={ site }
							timezoneString={ timezoneString }
							gmtOffset={ gmtOffset }
						/>
					) }
					{ extraNotices }
				</>
			}
		>
			{ hasBackups ? (
				<BackupsBrowser
					site={ site }
					activityLog={ activityLog }
					isLoadingActivityLog={ isLoadingActivityLog }
					selectedBackup={ selectedBackup }
					isSmallViewport={ isSmallViewport }
					dateRange={ dateRange }
					timezoneString={ timezoneString }
					gmtOffset={ gmtOffset }
					searchParams={ searchParams }
					onSelectBackup={ ( selected ) => navigation.selectBackup( selected?.rewind_id ?? null ) }
					onRequestRestore={ ( selected ) => navigation.requestRestore( selected.rewind_id ) }
					onRequestDownload={ ( selected ) => navigation.requestDownload( selected.rewind_id ) }
					onGranularDownloadReady={ ( selected, downloadId ) =>
						navigation.requestDownload( selected.rewind_id, downloadId )
					}
				/>
			) : (
				<PerformanceTrackerStop />
			) }
		</PageLayout>
	);
}
