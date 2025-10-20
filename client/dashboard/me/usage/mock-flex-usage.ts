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
	const data = {
		storage: makePoints( periods, 12_000_000_000 ),
		bandwidth: makePoints( periods, 80_000_000 ),
		compute: makePoints( periods, 60_000 ),
	};

	const bySite: Record< string, typeof data > = {
		'1': {
			storage: makePoints( periods, 5_000_000_000 ),
			bandwidth: makePoints( periods, 30_000_000 ),
			compute: makePoints( periods, 25_000 ),
		},
		'2': {
			storage: makePoints( periods, 7_000_000_000 ),
			bandwidth: makePoints( periods, 50_000_000 ),
			compute: makePoints( periods, 35_000 ),
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
