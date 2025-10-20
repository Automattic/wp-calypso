import { meFlexUsageQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { generateMockMeFlexUsage } from './mock-flex-usage';
import type { FlexUsageResponse } from '@automattic/api-core';

export type GlobalUsageSeries = {
	storage: number[]; // bytes per period (converted from byte-seconds average over window)
	bandwidth: number[]; // bytes per period
	compute: number[]; // seconds per period
	timestamps: string[]; // ISO-like timestamps aligning to periods
};

export type GlobalUsageTotals = {
	storageBytes: number;
	bandwidthBytes: number;
	computeHours: number;
};

export function useGlobalFlexUsage( {
	start,
	end,
	resolution = 'day',
}: {
	start: number;
	end: number;
	resolution?: 'hour' | 'day' | 'month';
} ) {
	const { data } = useQuery( {
		...meFlexUsageQuery( { start, end, resolution } ),
		select: ( usage: FlexUsageResponse & { bySite?: Record< string, unknown > } ) => {
			const toEpoch = ( ts: string ) =>
				Math.floor( Date.parse( ts.replace( ' ', 'T' ) + 'Z' ) / 1000 );

			const periodSeconds = Math.max(
				1,
				toEpoch( usage._meta.end ) - toEpoch( usage._meta.start )
			);

			const toNumbers = ( arr: Array< { timestamp: string; usage: string } > ) =>
				arr.map( ( p ) => Number( p.usage || 0 ) );

			const timestamps = ( usage.data.storage || [] ).map(
				( p: { timestamp: string } ) => p.timestamp
			);

			const storageByteSeconds = toNumbers( usage.data.storage );
			const storageBytesAvg = storageByteSeconds.map( ( v ) => v / periodSeconds );

			const bandwidthBytes = toNumbers( usage.data.bandwidth );
			const computeSeconds = toNumbers( usage.data.compute );

			const totals: GlobalUsageTotals = {
				storageBytes: storageBytesAvg.reduce( ( a, b ) => a + b, 0 ),
				bandwidthBytes: bandwidthBytes.reduce( ( a, b ) => a + b, 0 ),
				computeHours: computeSeconds.reduce( ( a, b ) => a + b, 0 ) / 3600,
			};

			const series: GlobalUsageSeries = {
				storage: storageBytesAvg,
				bandwidth: bandwidthBytes,
				compute: computeSeconds,
				timestamps,
			};

			return { series, totals, raw: usage } as const;
		},
		placeholderData: () => generateMockMeFlexUsage( start, end ),
	} );

	return (
		data ?? {
			series: { storage: [], bandwidth: [], compute: [], timestamps: [] },
			totals: { storageBytes: 0, bandwidthBytes: 0, computeHours: 0 },
			raw: undefined,
		}
	);
}
