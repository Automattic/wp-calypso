import type { FlexUsageResponse } from '@automattic/api-core';

export function generateMockMeFlexUsage(
	start: number,
	end: number
): FlexUsageResponse & { bySite: Record< string, unknown > } {
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
		storage: makePoints( periods, 100_000_000_000 ), // byte-seconds
		bandwidth: makePoints( periods, 30_000_000 ), // bytes per period
		compute: makePoints( periods, 1_200_000 ), // seconds per period (~20 minutes)
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
			units: { storage: 'byte_seconds', bandwidth: 'bytes', compute: 'seconds', email: '#' },
			start: toIso( start ),
			end: toIso( end ),
			resolution: 'day',
		},
		data: { ...data, email: makePoints( periods, 0 ) },
		bySite,
	};
}
