import { meFlexUsageQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { TEMP_CAPS } from '../../constants';
import { generateMockMeFlexUsage } from '../../mock-flex-usage';
import type { MeFlexUsageResponse } from '@automattic/api-core';

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
const clamp = ( n: number ) => Math.max( 0, Math.min( 1, n ) );

/**
 * usePlanUsage
 *
 * Input series (from `/me/flex-usage`):
 *  - storage: byte-seconds per period
 *  - bandwidth: bytes per period
 *  - compute: seconds per period
 *  - _meta.start/_meta.end: UTC window bounds
 *  - _meta.caps (optional): { storageBytes, bandwidthBytes, computeHours }
 *
 * Transform totals over the window:
 *  - storageBytes = sum(byteSeconds) / periodSeconds  // average bytes across window
 *  - bandwidthBytes = sum(bytes)
 *  - computeHours = sum(seconds) / 3600
 *
 * Fractions (unitless 0..1 for pie composition - each metric divided by its cap to get a percentage):
 *  - storage = clamp( storageBytes / storageBytesCap )
 *  - bandwidth = clamp( bandwidthBytes / bandwidthBytesCap )
 *  - compute = clamp( computeHours / computeHoursCap )
 *    Caps are taken from _meta.caps when present, otherwise TEMP_CAPS.
 */
export function usePlanUsage(
	start: number,
	end: number,
	resolution: 'hour' | 'day' | 'month' = 'day'
) {
	const { data, isPending } = useQuery( {
		...meFlexUsageQuery( { start, end, resolution } ),
		select: (
			resp: MeFlexUsageResponse
		): { stats: PlanUsageStats; fractions: PlanUsageFractions } => {
			const periodSeconds = Math.max( 1, toEpoch( resp._meta.end ) - toEpoch( resp._meta.start ) );
			const storageBytes =
				toNumbers( resp.data.storage ).reduce( ( a, b ) => a + b, 0 ) / periodSeconds;
			const bandwidthBytes = toNumbers( resp.data.bandwidth ).reduce( ( a, b ) => a + b, 0 );
			const computeHours = toNumbers( resp.data.compute ).reduce( ( a, b ) => a + b, 0 ) / 3600;
			const caps = resp._meta.caps ?? TEMP_CAPS;
			const fractions = {
				storage: clamp( storageBytes / caps.storageBytes ),
				bandwidth: clamp( bandwidthBytes / caps.bandwidthBytes ),
				compute: clamp( computeHours / caps.computeHours ),
			};

			return { stats: { storageBytes, bandwidthBytes, computeHours, caps }, fractions };
		},
		initialData: generateMockMeFlexUsage( start, end ),
	} );

	return {
		stats: data?.stats ?? { storageBytes: 0, bandwidthBytes: 0, computeHours: 0 },
		fractions: data?.fractions ?? { storage: 0, bandwidth: 0, compute: 0 },
		isLoading: isPending,
	};
}
