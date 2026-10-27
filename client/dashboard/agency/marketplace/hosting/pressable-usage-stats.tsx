import { formatNumber, formatNumberCompact } from '@automattic/number-formatters';
import { __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Stat } from '../../../components/stat';
import type { PressableCapacity } from './lib/pressable-capacity';
import type { AgencyPressableUsage } from '@automattic/api-core';

const USAGE_WARNING_THRESHOLD = 80;

const percentage = ( value: number, total: number ) =>
	total > 0 ? Math.min( 100, Math.round( ( value / total ) * 100 ) ) : 0;

/** The agency's Pressable sites, visits and storage against its plan's limits. */
export default function PressableUsageStats( {
	usage,
	capacity,
}: {
	usage?: AgencyPressableUsage;
	capacity: PressableCapacity;
} ) {
	const storageUsed = usage?.storage_gb ?? 0;
	const sitesUsed = usage?.sites_count ?? 0;
	const visitsUsed = usage?.visits_count ?? 0;
	const storagePercent = percentage( storageUsed, capacity.storage );
	const visitsPercent = percentage( visitsUsed, capacity.visits );

	return (
		<VStack spacing={ 4 } alignment="stretch">
			{ ! usage && (
				<Text variant="muted">{ __( 'View your usage data here when it’s available.' ) }</Text>
			) }
			<Stat
				density="high"
				isLoading={ ! usage }
				strapline={ __( 'Sites created' ) }
				metric={ formatNumber( sitesUsed ) }
				description={ sprintf(
					/* translators: %s is the maximum number of sites. */
					__( 'of %s' ),
					formatNumber( capacity.install )
				) }
				progressValue={ percentage( sitesUsed, capacity.install ) }
			/>
			<Stat
				density="high"
				isLoading={ ! usage }
				strapline={ __( 'Visits this month' ) }
				metric={ formatNumberCompact( visitsUsed ) }
				description={ sprintf(
					/* translators: %s is the maximum number of monthly visits. */
					__( 'of %s' ),
					formatNumberCompact( capacity.visits )
				) }
				progressValue={ visitsPercent }
				progressColor={ visitsPercent > USAGE_WARNING_THRESHOLD ? 'alert-yellow' : undefined }
			/>
			<Stat
				density="high"
				isLoading={ ! usage }
				strapline={ __( 'Storage used' ) }
				metric={ sprintf(
					/* translators: %s is the storage used in GB. */
					__( '%sGB' ),
					formatNumber( storageUsed )
				) }
				description={ sprintf(
					/* translators: %s is the storage limit in GB. */
					__( 'of %sGB' ),
					formatNumber( capacity.storage )
				) }
				progressValue={ storagePercent }
				progressColor={ storagePercent > USAGE_WARNING_THRESHOLD ? 'alert-yellow' : undefined }
			/>
		</VStack>
	);
}
