import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery, siteSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet, useParams, useRouter } from '@tanstack/react-router';
import { __experimentalGrid as Grid } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { backup } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useEffect, useCallback } from 'react';
import { FileBrowserProvider } from '../../../my-sites/backup/backup-contents-page/file-browser/file-browser-context';
import Breadcrumbs from '../../app/breadcrumbs';
import { useDateRange } from '../../app/hooks/use-date-range';
import { useLocale } from '../../app/locale';
import { siteRoute, siteBackupsIndexRoute, siteBackupDetailRoute } from '../../app/router/sites';
import { DateRangePicker } from '../../components/date-range-picker';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { hasHostingFeature } from '../../utils/site-features';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { BackupDetails } from './backup-details';
import { BackupNotices } from './backup-notices';
import { BackupNowButton } from './backup-now-button';
import illustrationUrl from './backups-callout-illustration.svg';
import { BackupsList } from './backups-list';
import { useActivityLog } from './use-activity-log';
import { useBackupState } from './use-backup-state';
import './style.scss';
import type { ActivityLogEntry } from '@automattic/api-core';

export function BackupsListPage() {
	const locale = useLocale();
	const { siteSlug } = siteRoute.useParams();
	const router = useRouter();

	const routeParams = useParams( {
		strict: false,
		shouldThrow: false,
	} ) as { rewindId?: string } | undefined;

	const rewindId = routeParams?.rewindId;

	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const backupState = useBackupState( site.ID );

	const { data: siteSettings } = useSuspenseQuery( {
		...siteSettingsQuery( site.ID ),
		select: ( s ) => ( {
			gmtOffset: Number( s?.gmt_offset ) || 0,
			timezoneString: s?.timezone_string || undefined,
		} ),
	} );

	const { gmtOffset, timezoneString } = siteSettings;

	const { dateRange, handleDateRangeChange } = useDateRange( {
		timezoneString,
		gmtOffset,
		defaultDays: 30,
	} );
	const [ selectedBackup, setSelectedBackupInState ] = useState< ActivityLogEntry | null >( null );

	const { activityLog, isLoadingActivityLog } = useActivityLog( {
		siteId: site.ID,
		dateRange,
		gmtOffset,
		timezoneString,
	} );

	const setSelectedBackup = useCallback(
		( backup?: ActivityLogEntry | null, replace = false ) => {
			if ( backup ) {
				router.navigate( {
					to: siteBackupDetailRoute.fullPath,
					params: {
						siteSlug,
						rewindId: backup.rewind_id,
					},
					// The following preserves the existing query string.
					search: ( query: Record< string, string > ) => query,
					replace,
				} );
			} else {
				router.navigate( {
					to: siteBackupsIndexRoute.fullPath,
					params: {
						siteSlug,
					},
					// The following preserves the existing query string.
					search: ( query: Record< string, string > ) => query,
					replace,
				} );
			}
		},
		[ router, siteSlug ]
	);

	const isSmallViewport = useViewportMatch( 'medium', '<' );

	// Auto-select backup based on rewindId parameter
	useEffect( () => {
		if ( rewindId && activityLog ) {
			const targetBackup = activityLog.find( ( item ) => item.rewind_id === rewindId );
			if ( targetBackup ) {
				setSelectedBackupInState( targetBackup );
			}
			return;
		}

		// if no rewindId, then it's hitting the index route
		// we select the first found backup without changing the route in that case to make things look nice.
		// no selection if it's mobile!
		const backup = activityLog?.[ 0 ];
		if ( ! rewindId && backup && ! isSmallViewport ) {
			setSelectedBackupInState( backup );
		}

		// no rewind id in param, and no backup? We have an empty query
		// don't set any backup
		if ( ! rewindId && ! backup ) {
			setSelectedBackupInState( null );
		}
	}, [ rewindId, activityLog, setSelectedBackup, isSmallViewport ] );

	const handleDateRangeChangeWrapper = ( next: { start: Date; end: Date } ) => {
		handleDateRangeChange( next );
		setSelectedBackup( null, false );
	};
	const [ showDetails, setShowDetails ] = useState( Boolean( rewindId ) );
	const columns = isSmallViewport ? 1 : 2;

	const hasBackups = hasHostingFeature( site, HostingFeatures.BACKUPS );

	const handleBackupSelection = ( backup: ActivityLogEntry | null ) => {
		setSelectedBackup( backup );
		if ( isSmallViewport && backup ) {
			setShowDetails( true );
		}
	};

	const renderMobileView = () => {
		if ( showDetails && selectedBackup ) {
			return (
				<BackupDetails
					backup={ selectedBackup }
					site={ site }
					timezoneString={ timezoneString }
					gmtOffset={ gmtOffset }
				/>
			);
		}

		return (
			<BackupsList
				activityLog={ activityLog }
				isLoadingActivityLog={ isLoadingActivityLog }
				selectedBackup={ selectedBackup }
				setSelectedBackup={ handleBackupSelection }
				dateRange={ dateRange }
				timezoneString={ timezoneString }
				gmtOffset={ gmtOffset }
			/>
		);
	};

	const isMobileDetailsView = isSmallViewport && showDetails;
	const shouldShowActions = hasBackups && ! isMobileDetailsView;
	const shouldShowNotices = ! isMobileDetailsView;

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
					prefix={ isMobileDetailsView && rewindId ? <Breadcrumbs length={ 2 } /> : undefined }
					actions={ shouldShowActions ? actions : undefined }
				/>
			}
			notices={
				shouldShowNotices ? (
					<BackupNotices
						backupState={ backupState }
						site={ site }
						timezoneString={ timezoneString }
						gmtOffset={ gmtOffset }
					/>
				) : undefined
			}
		>
			{ hasBackups && (
				<>
					{ isSmallViewport ? (
						renderMobileView()
					) : (
						<Grid columns={ columns } templateColumns="40% 1fr">
							<BackupsList
								activityLog={ activityLog }
								isLoadingActivityLog={ isLoadingActivityLog }
								selectedBackup={ selectedBackup }
								setSelectedBackup={ handleBackupSelection }
								dateRange={ dateRange }
								timezoneString={ timezoneString }
								gmtOffset={ gmtOffset }
							/>

							{ selectedBackup && (
								<BackupDetails
									backup={ selectedBackup }
									site={ site }
									timezoneString={ timezoneString }
									gmtOffset={ gmtOffset }
								/>
							) }
						</Grid>
					) }
				</>
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
			feature={ HostingFeatures.BACKUPS }
			overlay={ <PageLayout header={ <PageHeader title={ __( 'Backups' ) } /> } /> }
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
