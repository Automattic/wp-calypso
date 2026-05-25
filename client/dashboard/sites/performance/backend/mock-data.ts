// Temporary scaffold: the /request-detail screen still resolves against a
// deterministic mock generator because the WPCOM aggregate endpoint doesn't
// yet expose per-transaction details. Every other backend APM screen is now
// wired to the real /hosting/apm/aggregate endpoint via aggregate.ts. Delete
// this file once /request-detail is migrated (likely against the per-route
// /hosting/apm/detail endpoint).
import { queryOptions } from '@tanstack/react-query';
import type { ApmRequestDetail } from '@automattic/api-core';

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

export const siteApmRequestQuery = ( siteId: number, requestId: string ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'apm', 'request', requestId ],
		queryFn: () => fetchApmRequest( siteId, requestId ),
	} );
