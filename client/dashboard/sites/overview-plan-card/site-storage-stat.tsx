import { siteMediaStorageQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ExternalLink, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import filesize from 'filesize';
import { Stat } from '../../components/stat';
import { getStorageAlertLevel } from '../../utils/site-storage';
import type { Site } from '@automattic/api-core';

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

	const alertLevel = getStorageAlertLevel( mediaStorage );

	let storageWarningColor = undefined;
	if ( alertLevel === 'exceeded' ) {
		storageWarningColor = 'alert-red' as const;
	} else if ( alertLevel === 'warning' ) {
		storageWarningColor = 'alert-yellow' as const;
	}

	return (
		<VStack spacing={ 2 }>
			<Stat
				density="high"
				strapline={ __( 'Storage' ) }
				metric={ filesize( mediaStorage.storage_used_bytes, { round: 0 } ) }
				description={ filesize( mediaStorage.max_storage_bytes, { round: 0 } ) }
				progressValue={ progressBarValue }
				progressColor={ storageWarningColor }
				progressLabel={ `${ storageUsagePercent }%` }
			/>
			{ alertLevel !== 'none' && (
				<ExternalLink href={ `/add-ons/${ site.slug }` }>{ __( 'Add more storage' ) }</ExternalLink>
			) }
		</VStack>
	);
}
