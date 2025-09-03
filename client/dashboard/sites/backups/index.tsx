import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet } from '@tanstack/react-router';
import { __experimentalGrid as Grid, __experimentalText as Text } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import { useState } from 'react';
import { siteRoute } from '../../app/router/sites';
import { Callout } from '../../components/callout';
import { CalloutOverlay } from '../../components/callout-overlay';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { hasHostingFeature } from '../../utils/site-features';
import { BackupDetails } from './backup-details';
import { BackupNotices } from './backup-notices';
import { BackupNowButton } from './backup-now-button';
import illustrationUrl from './backups-callout-illustration.svg';
import { BackupsList } from './backups-list';
import './style.scss';
import type { ActivityLogEntry } from '@automattic/api-core';

export function SiteBackupsCallout( {
	siteSlug,
	titleAs = 'h1',
}: {
	siteSlug: string;
	titleAs?: React.ElementType | keyof JSX.IntrinsicElements;
} ) {
	return (
		<Callout
			icon={ chartBar }
			title={ __( 'Secure your content with Jetpack Backups' ) }
			titleAs={ titleAs }
			image={ illustrationUrl }
			description={
				<>
					<Text as="p" variant="muted">
						{ __(
							'Protect your site with scheduled and real-time backups—giving you the ultimate “undo” button and peace of mind that your content is always safe.'
						) }
					</Text>
					<Text as="p" variant="muted">
						{ __( 'Available on the WordPress.com Business and Commerce plans.' ) }
					</Text>
				</>
			}
			actions={
				<UpsellCTAButton
					text={ __( 'Upgrade plan' ) }
					tracksId="backups"
					variant="primary"
					href={ `/checkout/${ siteSlug }/business` }
				/>
			}
		/>
	);
}

export function BackupsListPage() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const [ selectedBackup, setSelectedBackup ] = useState< ActivityLogEntry | null >( null );
	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const columns = isSmallViewport ? 1 : 2;

	const hasBackups = hasHostingFeature( site, HostingFeatures.BACKUPS );

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Backups' ) }
					actions={ hasBackups && <BackupNowButton site={ site } /> }
				/>
			}
			notices={ <BackupNotices site={ site } /> }
		>
			{ hasBackups && (
				<Grid className="dashboard-backups__list-grid" columns={ columns }>
					<BackupsList
						site={ site }
						selectedBackup={ selectedBackup }
						setSelectedBackup={ setSelectedBackup }
					/>
					{ selectedBackup && <BackupDetails backup={ selectedBackup } site={ site } /> }
				</Grid>
			) }
		</PageLayout>
	);
}

function SiteBackups() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const hasBackups = hasHostingFeature( site, HostingFeatures.BACKUPS );

	return (
		<CalloutOverlay
			showCallout={ ! hasBackups }
			callout={ <SiteBackupsCallout siteSlug={ site.slug } /> }
			main={ <Outlet /> }
		/>
	);
}

export default SiteBackups;
