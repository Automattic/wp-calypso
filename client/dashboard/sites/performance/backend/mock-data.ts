// Temporary scaffold: real APM endpoints don't exist yet, so the queries below
// resolve against deterministic mock generators. When the WPCOM endpoints land,
// move the fetchers to `@automattic/api-core` and the queries to
// `@automattic/api-queries`, then delete this file.
import { queryOptions } from '@tanstack/react-query';
import type {
	ApmOverview,
	ApmRequestDetail,
	ApmSlowRequest,
	ApmSummary,
	ApmTimePoint,
} from '@automattic/api-core';

function rng( seed: number ) {
	let state = seed | 0;
	return () => {
		state = ( state + 0x6d2b79f5 ) | 0;
		let t = state;
		t = Math.imul( t ^ ( t >>> 15 ), t | 1 );
		t ^= t + Math.imul( t ^ ( t >>> 7 ), t | 61 );
		return ( ( t ^ ( t >>> 14 ) ) >>> 0 ) / 4294967296;
	};
}

function hashString( s: string ): number {
	let h = 0;
	for ( let i = 0; i < s.length; i++ ) {
		h = ( Math.imul( 31, h ) + s.charCodeAt( i ) ) | 0;
	}
	return h;
}

const SAMPLE_PATHS = [
	'/wp-admin/admin-ajax.php',
	'/wp-json/wp/v2/posts',
	'/wp-json/woocommerce/v3/orders',
	'/?p=1234',
	'/shop/cart/',
	'/checkout/',
	'/wp-cron.php',
	'/wp-login.php',
	'/wp-json/jetpack/v4/sync',
	'/feed/',
];

function pickWeighted< T >( random: () => number, choices: Array< [ T, number ] > ): T {
	const r = random();
	let acc = 0;
	for ( const [ value, weight ] of choices ) {
		acc += weight;
		if ( r < acc ) {
			return value;
		}
	}
	return choices[ choices.length - 1 ][ 0 ];
}

function generateSlowRequests( seed: number, count: number ): ApmSlowRequest[] {
	const random = rng( seed );
	const now = Date.now();
	const requests: ApmSlowRequest[] = [];
	for ( let i = 0; i < count; i++ ) {
		const url = SAMPLE_PATHS[ Math.floor( random() * SAMPLE_PATHS.length ) ];
		const method = pickWeighted( random, [
			[ 'GET', 0.7 ],
			[ 'POST', 0.15 ],
			[ 'PUT', 0.15 ],
		] );
		const duration_ms = Math.round( 1500 + random() * 8500 );
		const avg_duration_ms = Math.round( duration_ms * ( 0.25 + random() * 0.4 ) );
		const status = pickWeighted( random, [
			[ 200, 0.8 ],
			[ 302, 0.15 ],
			[ 500, 0.05 ],
		] );
		requests.push( {
			id: `req-${ seed.toString( 36 ) }-${ i }`,
			url,
			method,
			avg_duration_ms,
			duration_ms,
			status,
			timestamp: now - Math.round( random() * 24 * 60 * 60 * 1000 ),
		} );
	}
	return requests.sort( ( a, b ) => b.duration_ms - a.duration_ms );
}

function generateSummary( timeseries: ApmTimePoint[], slowRequests: ApmSlowRequest[] ): ApmSummary {
	const totals = timeseries.reduce(
		( acc, point ) => {
			acc.total += point.db + point.wp_core + point.plugins + point.external + point.cache;
			acc.db += point.db;
			acc.external += point.external;
			return acc;
		},
		{ total: 0, db: 0, external: 0 }
	);
	const points = Math.max( timeseries.length, 1 );
	return {
		avg_response_ms: Math.round( totals.total / points ),
		slow_request_count: slowRequests.length,
		transaction_count: 1000 + slowRequests.length * 47,
		db_avg_ms: Math.round( totals.db / points ),
		external_avg_ms: Math.round( totals.external / points ),
	};
}

function fetchApmOverview( siteId: number ): Promise< ApmOverview > {
	const random = rng( siteId );
	const now = Date.now();
	const timeseries = Array.from( { length: 24 }, ( _, i ) => ( {
		timestamp: now - ( 23 - i ) * 60 * 60 * 1000,
		db: Math.round( 80 + random() * 220 ),
		wp_core: Math.round( 50 + random() * 120 ),
		plugins: Math.round( 60 + random() * 260 ),
		external: Math.round( 20 + random() * 180 ),
		cache: Math.round( 10 + random() * 80 ),
	} ) );
	const slowRequests = generateSlowRequests( siteId, 8 );

	return Promise.resolve( {
		summary: generateSummary( timeseries, slowRequests ),
		timeseries,
		slow_requests: slowRequests,
	} );
}

function fetchApmSlowRequests( siteId: number ): Promise< ApmSlowRequest[] > {
	return Promise.resolve( generateSlowRequests( siteId * 7, 25 ) );
}

function fetchApmRequest( siteId: number, requestId: string ): Promise< ApmRequestDetail > {
	const seed = siteId ^ hashString( requestId );
	const random = rng( seed );
	const duration_ms = Math.round( 1500 + random() * 8500 );

	return Promise.resolve( {
		id: requestId,
		url: SAMPLE_PATHS[ Math.floor( random() * SAMPLE_PATHS.length ) ],
		method: random() < 0.7 ? 'GET' : 'POST',
		avg_duration_ms: Math.round( duration_ms * ( 0.25 + random() * 0.4 ) ),
		duration_ms,
		status: 200,
		timestamp: Date.now() - Math.round( random() * 60 * 60 * 1000 ),
	} );
}

export const siteApmOverviewQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'apm', 'overview' ],
		queryFn: () => fetchApmOverview( siteId ),
	} );

export const siteApmSlowRequestsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'apm', 'slow-requests' ],
		queryFn: () => fetchApmSlowRequests( siteId ),
	} );

export const siteApmRequestQuery = ( siteId: number, requestId: string ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'apm', 'request', requestId ],
		queryFn: () => fetchApmRequest( siteId, requestId ),
	} );
