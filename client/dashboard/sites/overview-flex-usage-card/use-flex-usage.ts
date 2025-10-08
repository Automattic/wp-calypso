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
	const start = Math.floor( new Date( now.getFullYear(), now.getMonth(), 1 ).getTime() / 1000 );
	const end = Math.floor( now.getTime() / 1000 );

	const { data } = useQuery( {
		...siteFlexUsageQuery( siteId, { start, end, resolution: 'day' } ),
		select: ( usage ): UsageData => {
			const storageTotal = sum( usage?.data.storage );
			const bandwidthTotal = sum( usage?.data.bandwidth );
			const computeHours = ( sum( usage?.data.compute ) || 0 ) / 3600;

			// Temporary caps until billing entitlements are wired
			return {
				storage: { usedBytes: storageTotal, capBytes: 20 * 1024 * 1024 * 1024 },
				bandwidth: { usedBytes: bandwidthTotal, capBytes: 1 * 1024 * 1024 * 1024 },
				compute: { usedHours: computeHours, capHours: 1 },
			};
		},
	} );

	const fallback: UsageData = {
		storage: { usedBytes: 0, capBytes: 20 * 1024 * 1024 * 1024 },
		bandwidth: { usedBytes: 0, capBytes: 1 * 1024 * 1024 * 1024 },
		compute: { usedHours: 0, capHours: 1 },
	};

	return { data: data ?? fallback };
}
