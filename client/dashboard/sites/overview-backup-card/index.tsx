import { HostingFeatures } from '@automattic/api-core';
import { siteActivityLogQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import { backup } from '@wordpress/icons';
import { useFormattedTime } from '../../components/formatted-time';
import { useTimeSince } from '../../components/time-since';
import { getBackupUrl } from '../../utils/site-backup';
import HostingFeatureGatedWithOverviewCard from '../hosting-feature-gated-with-overview-card';
import OverviewCard from '../overview-card';
import type { Site, SiteActivityLog } from '@automattic/api-core';

const CARD_PROPS = {
	icon: backup,
	title: __( 'Last backup' ),
	tracksId: 'backup',
};

const SUCCESSFUL_BACKUP_ACTIVITIES = [
	'rewind__backup_complete_full',
	'rewind__backup_complete_initial',
	'rewind__backup_only_complete_full',
	'rewind__backup_only_complete_initial',
];

const FAILED_BACKUP_ACTIVITIES = [ 'rewind__backup_error', 'rewind__backup_only_error' ];

function BackupCardFailed( { site, backup }: { site: Site; backup?: SiteActivityLog } ) {
	const timeSinceLastSuccessful = useTimeSince( backup?.published ?? new Date( 0 ).toISOString() );

	const description = backup
		? sprintf(
				/* translators: %s: time since last successful backup, e.g. '2h ago' */
				__( 'Last successful backup was %s.' ),
				timeSinceLastSuccessful
		  )
		: 'No successful backups found.';

	return (
		<OverviewCard
			{ ...CARD_PROPS }
			heading={ __( 'Backup failed' ) }
			description={ description }
			link={ getBackupUrl( site ) }
			intent="error"
		/>
	);
}

function BackupCardSuccess( { site, lastBackup }: { site: Site; lastBackup: SiteActivityLog } ) {
	const timeSinceLastBackup = useTimeSince( lastBackup.published );
	const formattedLastBackupTime = useFormattedTime( lastBackup.published, { timeStyle: 'short' } );

	return (
		<OverviewCard
			{ ...CARD_PROPS }
			heading={ timeSinceLastBackup }
			description={ formattedLastBackupTime }
			link={ getBackupUrl( site ) }
			intent="success"
		/>
	);
}

function BackupCardContent( { site }: { site: Site } ) {
	const { data: lastBackup, isLoading } = useQuery( {
		...siteActivityLogQuery( site.ID, {
			name: [ ...SUCCESSFUL_BACKUP_ACTIVITIES, ...FAILED_BACKUP_ACTIVITIES ],
			number: 1,
		} ),
		select: ( data ) => data.activityLogs[ 0 ],
	} );

	const { data: lastSuccessfulBackup } = useQuery( {
		...siteActivityLogQuery( site.ID, { name: SUCCESSFUL_BACKUP_ACTIVITIES, number: 1 } ),
		select: ( data ) => data.activityLogs[ 0 ],
		// Only fetch successful backups if there are any failed backups
		enabled: !! lastBackup && FAILED_BACKUP_ACTIVITIES.includes( lastBackup.name ),
	} );

	if ( isLoading ) {
		return <OverviewCard { ...CARD_PROPS } isLoading />;
	}

	if ( ! lastBackup ) {
		return (
			<OverviewCard
				{ ...CARD_PROPS }
				heading={ __( 'No backups yet' ) }
				description={ __( 'Your first backup will be ready soon.' ) }
				link={ getBackupUrl( site ) }
			/>
		);
	}

	if ( FAILED_BACKUP_ACTIVITIES.includes( lastBackup.name ) ) {
		return <BackupCardFailed site={ site } backup={ lastSuccessfulBackup } />;
	}

	return <BackupCardSuccess site={ site } lastBackup={ lastBackup } />;
}

export default function BackupCard( { site }: { site: Site } ) {
	return (
		<HostingFeatureGatedWithOverviewCard
			site={ site }
			feature={ HostingFeatures.BACKUPS }
			featureIcon={ CARD_PROPS.icon }
			tracksFeatureId={ CARD_PROPS.tracksId }
			upsellHeading={ __( 'Back up your site' ) }
			upsellDescription={ __( 'Get back online quickly with one-click restores.' ) }
			upsellLink={ getBackupUrl( site ) }
		>
			<BackupCardContent site={ site } />
		</HostingFeatureGatedWithOverviewCard>
	);
}
