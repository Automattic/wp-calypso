import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import filesize from 'filesize';
import { siteMediaStorageQuery } from '../../app/queries/site-media-storage';
import { Stat } from '../../components/stat';
import type { Site } from '../../data/types';

const MINIMUM_DISPLAYED_USAGE = 2.5;

const ALERT_PERCENT = 80;

export default function SiteStorageStat( { site }: { site: Site } ) {
	const { data: mediaStorage, isLoading: isLoadingMediaStorage } = useQuery(
		siteMediaStorageQuery( site.ID )
	);

	const storageUsagePercent = ! mediaStorage
		? 0
		: Math.round(
				( ( mediaStorage.storage_used_bytes / mediaStorage.max_storage_bytes ) * 1000 ) / 10
		  );

	// Ensure that the displayed usage is never fully empty to avoid a confusing UI.
	const progressBarValue = Math.max(
		MINIMUM_DISPLAYED_USAGE,
		Math.min( storageUsagePercent, 100 )
	);

	let storageWarningColor = undefined;
	if ( storageUsagePercent > 100 ) {
		storageWarningColor = 'alert-red' as const;
	} else if ( storageUsagePercent > ALERT_PERCENT ) {
		storageWarningColor = 'alert-yellow' as const;
	}

	return (
		<Stat
			density="high"
			strapline={ __( 'Storage' ) }
			metric={ mediaStorage && filesize( mediaStorage.storage_used_bytes, { round: 0 } ) }
			description={ mediaStorage && filesize( mediaStorage.max_storage_bytes, { round: 0 } ) }
			progressValue={ progressBarValue }
			progressColor={ storageWarningColor }
			progressLabel={ `${ storageUsagePercent }%` }
			isLoading={ isLoadingMediaStorage }
		/>
	);
}
