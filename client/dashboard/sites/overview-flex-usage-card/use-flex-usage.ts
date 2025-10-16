import { siteFlexUsageQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';

type UsageData = {
	storage: { usedBytes: number; capBytes: number };
	bandwidth: { usedBytes: number; capBytes: number };
	compute: { usedHours: number; capHours: number };
};

const sum = ( arr?: Array< { usage: string } > ) =>
	( arr ?? [] ).reduce( ( acc, p ) => acc + Number( p.usage || 0 ), 0 );

/**
 * useFlexUsage
 *
 * Retrieves month-to-date Flex usage for a site and returns aggregated totals
 * for storage (bytes), bandwidth (bytes), and compute (hours). The hook uses
 * the siteFlexUsageQuery under the hood and transforms the time-series data via
 * React Query's select option. Temporary caps are applied until billing
 * entitlements are available.
 */
export function useFlexUsage( siteId: number ) {
	const now = new Date();
	// Use UTC month boundary to align with billing calculations
	const start = Math.floor( Date.UTC( now.getUTCFullYear(), now.getUTCMonth(), 1 ) / 1000 );
	const end = Math.floor( Date.now() / 1000 );

	const { data } = useQuery( {
		...siteFlexUsageQuery( siteId, { start, end, resolution: 'day' } ),
		select: ( usage ): UsageData => {
			const storageTotal = sum( usage?.data.storage );
			const bandwidthTotal = sum( usage?.data.bandwidth );
			const computeHours = ( sum( usage?.data.compute ) || 0 ) / 3600;

			// Storage "usage" is in byte-seconds. Convert to bytes by
			// dividing by the exact seconds in the returned period.
			let periodSeconds = 0;
			if ( usage?._meta?.start && usage?._meta?.end ) {
				const toEpochSeconds = ( ts: string ) =>
					Math.floor( Date.parse( ts.replace( ' ', 'T' ) + 'Z' ) / 1000 );
				periodSeconds = Math.max(
					1,
					toEpochSeconds( usage._meta.end ) - toEpochSeconds( usage._meta.start )
				);
			}
			const storageBytesAvg = periodSeconds > 0 ? storageTotal / periodSeconds : 0;

			// Temporary caps until billing entitlements are wired
			return {
				storage: { usedBytes: storageBytesAvg, capBytes: 400 * 1024 * 1024 * 1024 },
				bandwidth: { usedBytes: bandwidthTotal, capBytes: 1 * 1024 * 1024 * 1024 },
				compute: { usedHours: computeHours, capHours: 1 },
			};
		},
	} );

	const fallback: UsageData = {
		storage: { usedBytes: 0, capBytes: 400 * 1024 * 1024 * 1024 },
		bandwidth: { usedBytes: 0, capBytes: 1 * 1024 * 1024 * 1024 },
		compute: { usedHours: 0, capHours: 1 },
	};

	return { data: data ?? fallback };
}
