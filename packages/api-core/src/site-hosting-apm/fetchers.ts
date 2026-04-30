import type {
	ApmOverview,
	ApmRequestDetail,
	ApmSlowRequest,
	ApmTransaction,
	ApmTransactionType,
} from './types';

// Mulberry32: tiny deterministic PRNG so mock data is stable per seed.
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

const SAMPLE_DB_QUERIES = [
	'SELECT * FROM wp_posts WHERE post_status = "publish"',
	'SELECT * FROM wp_options WHERE autoload = "yes"',
	'SELECT meta_value FROM wp_postmeta WHERE post_id = ?',
	'UPDATE wp_users SET user_activation_key = ?',
	'SELECT * FROM wp_woocommerce_order_items',
];

const SAMPLE_PLUGINS = [
	'WooCommerce: woocommerce_init',
	'Yoast SEO: wpseo_head',
	'Jetpack: jetpack_sync_action',
	'Akismet: akismet_init',
	'Elementor: render_widget',
];

const SAMPLE_EXTERNAL = [
	'GET https://api.stripe.com/v1/charges',
	'POST https://api.mailchimp.com/3.0/lists',
	'GET https://maps.googleapis.com/maps/api/place/details/json',
	'POST https://hooks.slack.com/services/…',
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
		const status = pickWeighted( random, [
			[ 200, 0.8 ],
			[ 302, 0.15 ],
			[ 500, 0.05 ],
		] );
		requests.push( {
			id: `req-${ seed.toString( 36 ) }-${ i }`,
			url,
			method,
			duration_ms,
			status,
			timestamp: now - Math.round( random() * 24 * 60 * 60 * 1000 ),
		} );
	}
	return requests.sort( ( a, b ) => b.duration_ms - a.duration_ms );
}

export async function fetchApmOverview( siteId: number ): Promise< ApmOverview > {
	const random = rng( siteId );
	const now = Date.now();
	const timeseries = Array.from( { length: 24 }, ( _, i ) => ( {
		timestamp: now - ( 23 - i ) * 60 * 60 * 1000,
		db: Math.round( 80 + random() * 220 ),
		wp_core: Math.round( 50 + random() * 120 ),
		plugins: Math.round( 60 + random() * 260 ),
		external: Math.round( 20 + random() * 180 ),
	} ) );

	return Promise.resolve( {
		timeseries,
		slow_requests: generateSlowRequests( siteId, 8 ),
	} );
}

export async function fetchApmSlowRequests( siteId: number ): Promise< ApmSlowRequest[] > {
	return Promise.resolve( generateSlowRequests( siteId * 7, 25 ) );
}

export async function fetchApmRequest(
	siteId: number,
	requestId: string
): Promise< ApmRequestDetail > {
	const seed = siteId ^ hashString( requestId );
	const random = rng( seed );

	const url = SAMPLE_PATHS[ Math.floor( random() * SAMPLE_PATHS.length ) ];
	const duration_ms = Math.round( 1500 + random() * 8500 );
	const transactions: ApmTransaction[] = [];

	let cursor = 0;
	while ( cursor < duration_ms - 50 ) {
		const types: ApmTransactionType[] = [ 'db', 'wp_core', 'plugin', 'external' ];
		const type = types[ Math.floor( random() * types.length ) ];
		const span = Math.min(
			duration_ms - cursor,
			Math.round( 30 + random() * ( type === 'external' ? 600 : 250 ) )
		);
		let name = '';
		switch ( type ) {
			case 'db':
				name = SAMPLE_DB_QUERIES[ Math.floor( random() * SAMPLE_DB_QUERIES.length ) ];
				break;
			case 'plugin':
				name = SAMPLE_PLUGINS[ Math.floor( random() * SAMPLE_PLUGINS.length ) ];
				break;
			case 'external':
				name = SAMPLE_EXTERNAL[ Math.floor( random() * SAMPLE_EXTERNAL.length ) ];
				break;
			case 'wp_core':
				name = random() < 0.5 ? 'Action: init' : 'Filter: the_content';
				break;
		}
		transactions.push( {
			type,
			name,
			duration_ms: span,
			start_offset_ms: cursor,
		} );
		cursor += span;
	}

	return Promise.resolve( {
		id: requestId,
		url,
		method: random() < 0.7 ? 'GET' : 'POST',
		duration_ms,
		status: 200,
		timestamp: Date.now() - Math.round( random() * 60 * 60 * 1000 ),
		transactions,
	} );
}
