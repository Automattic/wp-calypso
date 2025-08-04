import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { siteMediaStorageQuery } from '../../app/queries/site-media-storage';
import { Stat } from '../../components/stat';
import type { Site } from '../../data/types';

const MINIMUM_DISPLAYED_USAGE = 2.5;

export default function SiteStorageStat( { site }: { site: Site } ) {
	const { data: mediaStorage } = useSuspenseQuery( siteMediaStorageQuery( site.ID ) );

	const storageUsagePercent = Math.round(
		( ( mediaStorage.storage_used_bytes / mediaStorage.max_storage_bytes ) * 1000 ) / 10
	);

	// Ensure that the displayed usage is never fully empty to avoid a confusing UI.
	const progressBarValue = Math.max(
		MINIMUM_DISPLAYED_USAGE,
		Math.min( storageUsagePercent, 100 )
	);

	let storageWarningColor = undefined;
	if ( mediaStorage.extra.alertLevel === 'exceeded' ) {
		storageWarningColor = 'alert-red' as const;
	} else if ( mediaStorage.extra.alertLevel === 'low' ) {
		storageWarningColor = 'alert-yellow' as const;
	}

	return (
		<Stat
			density="high"
			strapline={ __( 'Storage' ) }
			metric={ mediaStorage.extra.storageUsedDisplay }
			description={ mediaStorage.extra.maxStorageDisplay }
			progressValue={ progressBarValue }
			progressColor={ storageWarningColor }
			progressLabel={ `${ storageUsagePercent }%` }
		/>
	);
}
