import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { backup } from '@wordpress/icons';
import { siteLastBackupQuery } from '../../app/queries/site-backups';
import { useTimeSince } from '../../components/time-since';
import { HostingFeatures } from '../../data/constants';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import HostingFeatureGatedWithOverviewCard from '../hosting-feature-gated-with-overview-card';
import OverviewCard from '../overview-card';
import type { Site } from '../../data/types';

const CARD_PROPS = {
	icon: backup,
	title: __( 'Last backup' ),
	tracksId: 'backup',
};

function getBackupUrl( site: Site ) {
	return isSelfHostedJetpackConnected( site )
		? `https://cloud.jetpack.com/backup/${ site.slug }`
		: `https://wordpress.com/backup/${ site.slug }`;
}

function BackupCardContent( { site }: { site: Site } ) {
	const { data: lastBackup } = useQuery( siteLastBackupQuery( site.ID ) );
	const timeSinceLastBackup = useTimeSince(
		lastBackup?.last_updated ?? new Date( 0 ).toISOString(),
		{ isUtc: true }
	);

	if ( lastBackup === undefined ) {
		return <OverviewCard { ...CARD_PROPS } variant="loading" />;
	}

	return (
		<OverviewCard
			{ ...CARD_PROPS }
			heading={ lastBackup ? timeSinceLastBackup : __( 'No backups yet' ) }
			description="Next scheduled backup in TBA"
			externalLink={ getBackupUrl( site ) }
			variant={ lastBackup ? 'success' : undefined }
		/>
	);
}

export default function BackupCard( { site }: { site: Site } ) {
	return (
		<HostingFeatureGatedWithOverviewCard
			site={ site }
			feature={ HostingFeatures.BACKUPS }
			featureIcon={ CARD_PROPS.icon }
			tracksFeatureId={ CARD_PROPS.tracksId }
			upsellHeading={ __( 'Back up your site' ) }
			upsellDescription={ __( 'Get back online quickly with one-click restores' ) }
			upsellExternalLink={ getBackupUrl( site ) }
		>
			<BackupCardContent site={ site } />
		</HostingFeatureGatedWithOverviewCard>
	);
}
