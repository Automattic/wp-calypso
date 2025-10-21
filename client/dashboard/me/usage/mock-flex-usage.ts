import type { MeFlexUsageResponse } from '@automattic/api-core';

export function generateMockMeFlexUsage( start: number, end: number ): MeFlexUsageResponse {
	const toIso = ( ts: number ) =>
		new Date( ts * 1000 ).toISOString().replace( 'T', ' ' ).slice( 0, 19 );

	const makePoints = ( count: number, base: number ) =>
		Array.from( { length: count } ).map( ( _, i ) => ( {
			timestamp: toIso( start + Math.floor( ( ( end - start ) * i ) / Math.max( 1, count - 1 ) ) ),
			usage: String( Math.round( base * ( 0.6 + 0.8 * Math.random() ) ) ),
		} ) );

	const periods = 12;
	// Ensure non-zero across all three so the pie shows multiple slices
	// Return realistic orders of magnitude for each metric so fraction-of-cap appears balanced
	const data = {
		// Target ~1/3 of 400GB cap on average across the window:
		// storageBytesAvg ≈ 133GB → storageByteSeconds per period ≈ storageBytesAvg * periodSeconds / periods
		// With ~30-day window (≈2.592e6s) and 12 periods, base ≈ ~3e16 byte-seconds
		storage: makePoints( periods, 30_000_000_000_000_000 ),
		// Target ~1/3 of 1GB cap total across the window (~0.333GB ≈ 357MB) → ~30MB per period
		bandwidth: makePoints( periods, 30_000_000 ),
		// Target ~1/3 of 100h cap total across the window → ~33h total → ~10,000s per period
		compute: makePoints( periods, 10_000 ),
	};

	const bySite: Record< string, typeof data > = {
		'1': {
			storage: makePoints( periods, 1_500_000_000 ),
			bandwidth: makePoints( periods, 1_000_000_000 ),
			compute: makePoints( periods, 500_000_000 ),
		},
		'2': {
			storage: makePoints( periods, 1_500_000_000 ),
			bandwidth: makePoints( periods, 1_000_000_000 ),
			compute: makePoints( periods, 500_000_000 ),
		},
	};

	return {
		_meta: {
			took: 0.01,
			units: { storage: 'byte_seconds', bandwidth: 'bytes', compute: 'seconds' },
			start: toIso( start ),
			end: toIso( end ),
			resolution: 'day',
			caps: {
				storageBytes: 400 * 1024 * 1024 * 1024,
				bandwidthBytes: 1 * 1024 * 1024 * 1024,
				computeHours: 100,
			},
		},
		data,
		bySite,
	} as MeFlexUsageResponse;
}
