import { useQuery } from '@tanstack/react-query';
import { __experimentalText as Text, __experimentalGrid as Grid } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import { useState } from 'react';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteRoute } from '../../app/router';
import { Callout } from '../../components/callout';
import { CalloutOverlay } from '../../components/callout-overlay';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { HostingFeatures } from '../../data/constants';
import { hasHostingFeature } from '../../utils/site-features';
import { BackupDetails } from './backup-details';
import { BackupNowButton } from './backup-now-button';
import illustrationUrl from './backups-callout-illustration.svg';
import { BackupsList } from './backups-list';
import './style.scss';
import type { ActivityLogEntry, Site } from '../../data/types';

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

function BackupsLayout( { site }: { site: Site } ) {
	const [ selectedBackup, setSelectedBackup ] = useState< ActivityLogEntry | null >( null );

	return (
		<Grid columns={ 2 }>
			<BackupsList
				site={ site }
				selectedBackup={ selectedBackup }
				setSelectedBackup={ setSelectedBackup }
			/>
			{ selectedBackup && <BackupDetails backup={ selectedBackup } /> }
		</Grid>
	);
}

function SiteBackups() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useQuery( siteBySlugQuery( siteSlug ) );

	if ( ! site ) {
		return;
	}

	const hasBackups = hasHostingFeature( site, HostingFeatures.BACKUPS );

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Backups' ) }
					actions={ hasBackups && <BackupNowButton site={ site } /> }
				/>
			}
		>
			<CalloutOverlay
				showCallout={ ! hasBackups }
				callout={ <SiteBackupsCallout siteSlug={ site.slug } /> }
				main={ <BackupsLayout site={ site } /> }
			/>
		</PageLayout>
	);
}

export default SiteBackups;
