import { meFlexUsageQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { generateMockMeFlexUsage } from '../../mock-flex-usage';
import type { FlexUsageResponse } from '@automattic/api-core';

export type PlanUsageStats = {
	storageBytes: number;
	bandwidthBytes: number;
	computeHours: number;
	caps?: { storageBytes?: number; bandwidthBytes?: number; computeHours?: number };
};

export type PlanUsageFractions = {
	storage: number; // 0..1 of cap
	bandwidth: number; // 0..1 of cap
	compute: number; // 0..1 of cap
};

const toEpoch = ( ts: string ) => Math.floor( Date.parse( ts.replace( ' ', 'T' ) + 'Z' ) / 1000 );
const toNumbers = ( arr: Array< { timestamp: string; usage: string } > ) =>
	arr.map( ( p ) => Number( p.usage || 0 ) );

export function usePlanUsage(
	start: number,
	end: number,
	resolution: 'hour' | 'day' | 'month' = 'day'
) {
	const base = meFlexUsageQuery( { start, end, resolution } );
	const mockEnabled = config.isEnabled( 'mock-me-flex-usage' );

	const { data, isPending } = useQuery( {
		...base,
		queryFn: mockEnabled
			? () => Promise.resolve( generateMockMeFlexUsage( start, end ) )
			: base.queryFn,
		select: (
			resp: FlexUsageResponse & { bySite?: Record< string, unknown >; _meta: unknown }
		): { stats: PlanUsageStats; fractions: PlanUsageFractions } => {
			const periodSeconds = Math.max( 1, toEpoch( resp._meta.end ) - toEpoch( resp._meta.start ) );
			const storageBytes =
				toNumbers( resp.data.storage ).reduce( ( a, b ) => a + b, 0 ) / periodSeconds;
			const bandwidthBytes = toNumbers( resp.data.bandwidth ).reduce( ( a, b ) => a + b, 0 );
			const computeHours = toNumbers( resp.data.compute ).reduce( ( a, b ) => a + b, 0 ) / 3600;
			const TEMP_CAPS = {
				storageBytes: 400 * 1024 * 1024 * 1024, // 400GB
				bandwidthBytes: 1 * 1024 * 1024 * 1024, // 1GB
				computeHours: 1, // 1 hour
			};
			const clamp01 = ( n: number ) => Math.max( 0, Math.min( 1, n ) );
			const fractions = {
				storage: clamp01( storageBytes / TEMP_CAPS.storageBytes ),
				bandwidth: clamp01( bandwidthBytes / TEMP_CAPS.bandwidthBytes ),
				compute: clamp01( computeHours / TEMP_CAPS.computeHours ),
			};
			return { stats: { storageBytes, bandwidthBytes, computeHours, caps: TEMP_CAPS }, fractions };
		},
		placeholderData: () => ( mockEnabled ? generateMockMeFlexUsage( start, end ) : undefined ),
	} );

	return {
		stats: data?.stats ?? { storageBytes: 0, bandwidthBytes: 0, computeHours: 0 },
		fractions: data?.fractions ?? { storage: 0, bandwidth: 0, compute: 0 },
		isLoading: isPending,
	};
}
