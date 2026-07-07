import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery, siteSettingsQuery } from '@automattic/api-queries';
import { DateRangePicker } from '@automattic/date-range-picker';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet, useParams, useRouter } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { backup } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useCallback } from 'react';
import { FileBrowserProvider } from '../../../my-sites/backup/backup-contents-page/file-browser/file-browser-context';
import Breadcrumbs from '../../app/breadcrumbs';
import { useDateRange } from '../../app/hooks/use-date-range';
import { useLocale } from '../../app/locale';
import { PerformanceTrackerStop } from '../../app/performance-tracking';
import {
	siteRoute,
	siteBackupsRoute,
	siteBackupsIndexRoute,
	siteBackupDetailRoute,
	siteBackupRestoreRoute,
	siteBackupDownloadRoute,
} from '../../app/router/sites';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { hasHostingFeature } from '../../utils/site-features';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { SitesNoticeArbiter } from '../notice-arbiter';
import { BackupNotices } from './backup-notices';
import { BackupNowButton } from './backup-now-button';
import { BackupsBrowser, useBackupsBrowserState } from './backups-browser';
import illustrationUrl from './backups-callout-illustration.svg';
import { useBackupState } from './use-backup-state';
import './style.scss';
import type { ActivityLogEntry } from '@automattic/api-core';

export function BackupsListPage() {
	const locale = useLocale();
	const { siteSlug } = siteRoute.useParams();
	const router = useRouter();

	const routeParams = useParams( { strict: false, shouldThrow: false } ) as
		| { rewindId?: string }
		| undefined;
	const rewindId = routeParams?.rewindId;

	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const searchParams = siteBackupsRoute.useSearch();
	const backupState = useBackupState( site.ID );

	const { data: siteSettings } = useSuspenseQuery( siteSettingsQuery( site.ID ) );
	const gmtOffset = siteSettings.gmt_offset;
	const timezoneString = siteSettings.timezone_string;

	const { dateRange, handleDateRangeChange } = useDateRange( {
		timezoneString,
		gmtOffset,
		defaultDays: 30,
	} );

	const navigateToBackup = useCallback(
		( selected: ActivityLogEntry | null ) => {
			if ( selected ) {
				router.navigate( {
					to: siteBackupDetailRoute.fullPath,
					params: { siteSlug, rewindId: selected.rewind_id },
					search: ( query: Record< string, string > ) => query,
				} );
			} else {
				router.navigate( {
					to: siteBackupsIndexRoute.fullPath,
					params: { siteSlug },
					search: ( query: Record< string, string > ) => query,
				} );
			}
		},
		[ router, siteSlug ]
	);

	const handleRequestRestore = ( selected: ActivityLogEntry ) => {
		router.navigate( {
			to: siteBackupRestoreRoute.fullPath,
			params: { siteSlug, rewindId: selected.rewind_id },
		} );
	};

	const handleRequestDownload = ( selected: ActivityLogEntry ) => {
		router.navigate( {
			to: siteBackupDownloadRoute.fullPath,
			params: { siteSlug, rewindId: selected.rewind_id },
		} );
	};

	const handleGranularDownloadReady = ( selected: ActivityLogEntry, downloadId: number ) => {
		router.navigate( {
			to: siteBackupDownloadRoute.fullPath,
			params: { siteSlug, rewindId: selected.rewind_id },
			search: { downloadId },
		} );
	};

	const handleDateRangeChangeWrapper = ( next: { start: Date; end: Date } ) => {
		handleDateRangeChange( next );
		navigateToBackup( null );
	};

	const hasBackups = hasHostingFeature( site, HostingFeatures.BACKUPS_SELF_SERVE );
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
					<SitesNoticeArbiter />
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
					onSelectBackup={ navigateToBackup }
					onRequestRestore={ handleRequestRestore }
					onRequestDownload={ handleRequestDownload }
					onGranularDownloadReady={ handleGranularDownloadReady }
				/>
			) : (
				<PerformanceTrackerStop />
			) }
		</PageLayout>
	);
}

function SiteBackups() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { createErrorNotice, createSuccessNotice } = useDispatch( noticesStore );
	const locale = useLocale();

	const hostingNotices = {
		showError: ( message: string ) => createErrorNotice( message, { type: 'snackbar' } ),
		showSuccess: ( message: string ) => createSuccessNotice( message, { type: 'snackbar' } ),
	};

	return (
		<HostingFeatureGatedWithCallout
			site={ site }
			feature={ HostingFeatures.BACKUPS_SELF_SERVE }
			fullPage
			upsellId="site-backups"
			upsellIcon={ backup }
			upsellTitle={ __( 'Secure your content with Jetpack Backups' ) }
			upsellImage={ illustrationUrl }
			upsellDescription={ __(
				'Protect your site with scheduled and real-time backups—giving you the ultimate “undo” button and peace of mind that your content is always safe.'
			) }
		>
			<FileBrowserProvider locale={ locale } notices={ hostingNotices }>
				<Outlet />
			</FileBrowserProvider>
		</HostingFeatureGatedWithCallout>
	);
}

export default SiteBackups;
