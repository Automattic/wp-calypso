import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { backup } from '@wordpress/icons';
import { siteLastBackupQuery } from '../../app/queries/site-backups';
import { useTimeSince } from '../../components/time-since';
import { hasAtomicFeature } from '../../utils/site-features';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import { HostingFeatures } from '../features';
import OverviewCard from '../overview-card';
import UpsellCard from '../overview-card/upsell';
import type { Backup, Site } from '../../data/types';

const CARD_PROPS = {
	icon: backup,
	title: __( 'Last backup' ),
	trackId: 'backup',
};

function getBackupUrl( site: Site ) {
	return isSelfHostedJetpackConnected( site )
		? `https://cloud.jetpack.com/backup/${ site.slug }`
		: `https://wordpress.com/backup/${ site.slug }`;
}

function BackupCardUpsell( { site }: { site: Site } ) {
	return (
		<UpsellCard
			heading={ __( 'Real-time backups' ) }
			description={ __( 'Get back online quickly with one-click restores' ) }
			externalLink={ getBackupUrl( site ) }
			trackId={ CARD_PROPS.trackId }
		/>
	);
}

function BackupCardWithBackups( { site, lastBackup }: { site: Site; lastBackup: Backup | null } ) {
	const timeSinceLastBackup = useTimeSince(
		lastBackup?.last_updated ?? new Date( 0 ).toISOString(),
		{ isUtc: true }
	);

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
	const isEligible = hasAtomicFeature( site, HostingFeatures.BACKUPS );
	const { data: lastBackup } = useQuery( {
		...siteLastBackupQuery( site.ID ),
		enabled: isEligible,
	} );

	if ( ! isEligible ) {
		return <BackupCardUpsell site={ site } />;
	}

	if ( lastBackup === undefined ) {
		return <OverviewCard { ...CARD_PROPS } variant="loading" />;
	}

	return <BackupCardWithBackups site={ site } lastBackup={ lastBackup } />;
}
