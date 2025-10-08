import { siteFlexUsageQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from '@wordpress/element';

type UsageData = {
	storage: { usedBytes: number; capBytes: number };
	bandwidth: { usedBytes: number; capBytes: number };
	compute: { usedHours: number; capHours: number };
};

export function useFlexUsage( siteId: number ) {
	const now = new Date();
	const start = Math.floor( new Date( now.getFullYear(), now.getMonth(), 1 ).getTime() / 1000 );
	const end = Math.floor( now.getTime() / 1000 );

	const { data: usage } = useQuery(
		siteFlexUsageQuery( siteId, { start, end, resolution: 'day' } )
	);

	// Sum usage series into month-to-date totals
	const totals = useMemo( () => {
		if ( ! usage ) {
			return { storage: 0, bandwidth: 0, compute: 0 };
		}
		const sum = ( arr?: Array< { usage: string } > ) =>
			( arr ?? [] ).reduce( ( acc, p ) => acc + Number( p.usage || 0 ), 0 );
		return {
			storage: sum( usage.data.storage ),
			bandwidth: sum( usage.data.bandwidth ),
			compute: sum( usage.data.compute ) / 3600, // seconds -> hours
		};
	}, [ usage ] );

	// Temporary caps until billing entitlements are wired
	const data: UsageData = {
		storage: { usedBytes: totals.storage, capBytes: 1 * 1024 * 1024 * 1024 },
		bandwidth: { usedBytes: totals.bandwidth, capBytes: 1 * 1024 * 1024 * 1024 },
		compute: { usedHours: totals.compute, capHours: 1 },
	};

	return { data };
}
