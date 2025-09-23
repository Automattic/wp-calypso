import { HostingFeatures } from '@automattic/api-core';
import {
	siteBySlugQuery,
	siteSettingsQuery,
	siteBackupActivityLogEntriesQuery,
} from '@automattic/api-queries';
import { useSuspenseQuery, useQuery } from '@tanstack/react-query';
import { Outlet } from '@tanstack/react-router';
import {
	__experimentalGrid as Grid,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, isRTL } from '@wordpress/i18n';
import { backup, chevronLeft, chevronRight } from '@wordpress/icons';
import { useState, useEffect } from 'react';
import { useDateRange } from '../../app/hooks/use-date-range';
import { useLocale } from '../../app/locale';
import { siteRoute, siteBackupDetailRoute } from '../../app/router/sites';
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
import './style.scss';
import type { ActivityLogEntry } from '@automattic/api-core';

export function BackupsListPage() {
	const locale = useLocale();
	const { siteSlug } = siteRoute.useParams();

	// Try to get rewindId parameter if we're on the detail route
	let rewindId: string | undefined;
	try {
		const params = siteBackupDetailRoute.useParams();
		rewindId = params.rewindId;
	} catch {
		// Not on detail route, rewindId remains undefined
	}

	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const { data: siteSettings } = useSuspenseQuery( {
		...siteSettingsQuery( site.ID ),
		select: ( s ) => ( {
			gmtOffset: typeof s?.gmt_offset === 'number' ? s.gmt_offset : 0,
			timezoneString: s?.timezone_string || undefined,
		} ),
	} );

	const { gmtOffset, timezoneString } = siteSettings;

	const { dateRange, handleDateRangeChange } = useDateRange( {
		timezoneString,
		gmtOffset,
	} );
	const [ selectedBackup, setSelectedBackup ] = useState< ActivityLogEntry | null >( null );

	// Fetch activity log if we have a rewindId to auto-select
	const { data: activityLog } = useQuery( {
		...siteBackupActivityLogEntriesQuery( site.ID ),
		enabled: !! rewindId,
	} );

	// Auto-select backup based on rewindId parameter
	useEffect( () => {
		if ( rewindId && activityLog ) {
			const targetBackup = activityLog.find( ( item ) => item.rewind_id === rewindId );
			if ( targetBackup ) {
				setSelectedBackup( targetBackup );
			}
		}
	}, [ rewindId, activityLog ] );

	const handleDateRangeChangeWrapper = ( next: { start: Date; end: Date } ) => {
		handleDateRangeChange( next );
		setSelectedBackup( null );
	};
	const [ showDetails, setShowDetails ] = useState( false );
	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const columns = isSmallViewport ? 1 : 2;

	const hasBackups = hasHostingFeature( site, HostingFeatures.BACKUPS );

	const handleBackupSelection = ( backup: ActivityLogEntry | null ) => {
		setSelectedBackup( backup );
		if ( isSmallViewport && backup ) {
			setShowDetails( true );
		}
	};

	const backButton = (
		<Button
			className="dashboard-page-header__back-button"
			icon={ isRTL() ? chevronRight : chevronLeft }
			onClick={ () => {
				setShowDetails( false );
			} }
		>
			{ __( 'Backups' ) }
		</Button>
	);

	const renderMobileView = () => {
		if ( showDetails && selectedBackup ) {
			return <BackupDetails backup={ selectedBackup } site={ site } />;
		}

		return (
			<BackupsList
				site={ site }
				selectedBackup={ selectedBackup }
				setSelectedBackup={ handleBackupSelection }
				autoSelect={ false }
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
					onChange={ handleDateRangeChangeWrapper }
				/>
			</div>
			<BackupNowButton site={ site } />
		</>
	);

	return (
		<PageLayout
			header={
				<PageHeader
					title={ isMobileDetailsView ? __( 'Backup details' ) : __( 'Backups' ) }
					prefix={ isMobileDetailsView ? backButton : undefined }
					actions={ shouldShowActions ? actions : undefined }
				/>
			}
			notices={ shouldShowNotices ? <BackupNotices site={ site } /> : undefined }
		>
			{ hasBackups && (
				<>
					{ isSmallViewport ? (
						renderMobileView()
					) : (
						<Grid columns={ columns } templateColumns="40% 1fr">
							<BackupsList
								site={ site }
								selectedBackup={ selectedBackup }
								setSelectedBackup={ handleBackupSelection }
								dateRange={ dateRange }
								timezoneString={ timezoneString }
								gmtOffset={ gmtOffset }
							/>

							{ selectedBackup && <BackupDetails backup={ selectedBackup } site={ site } /> }
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

	if ( hasHostingFeature( site, HostingFeatures.BACKUPS ) ) {
		return <Outlet />;
	}

	return (
		<PageLayout header={ <PageHeader title={ __( 'Backups' ) } /> }>
			<HostingFeatureGatedWithCallout
				site={ site }
				feature={ HostingFeatures.BACKUPS }
				tracksFeatureId="backups"
				asOverlay
				upsellIcon={ backup }
				upsellTitle={ __( 'Secure your content with Jetpack Backups' ) }
				upsellImage={ illustrationUrl }
				upsellDescription={
					<Text as="p" variant="muted">
						{ __(
							'Protect your site with scheduled and real—time backups—giving you the ultimate “undo” button and peace of mind that your content is always safe.'
						) }
					</Text>
				}
			>
				<></>
			</HostingFeatureGatedWithCallout>
		</PageLayout>
	);
}

export default SiteBackups;
