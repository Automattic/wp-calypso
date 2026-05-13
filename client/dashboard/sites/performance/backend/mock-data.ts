// Temporary scaffold: real APM endpoints don't exist yet, so the queries below
// resolve against deterministic mock generators. When the WPCOM endpoints land,
// move the fetchers to `@automattic/api-core` and the queries to
// `@automattic/api-queries`, then delete this file.
import { queryOptions } from '@tanstack/react-query';
import type {
	ApmExternalRequest,
	ApmHookUsage,
	ApmOverview,
	ApmPluginUsage,
	ApmRequestDetail,
	ApmSlowQuery,
	ApmSlowRequest,
	ApmSummary,
	ApmTemplateUsage,
	ApmTimePoint,
	ApmTransaction,
	ApmWordPress,
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
			acc.plugins += point.plugins;
			return acc;
		},
		{ total: 0, db: 0, external: 0, plugins: 0 }
	);
	const points = Math.max( timeseries.length, 1 );
	return {
		avg_response_ms: Math.round( totals.total / points ),
		transaction_count: 1000 + slowRequests.length * 47,
		db_avg_ms: Math.round( totals.db / points ),
		external_avg_ms: Math.round( totals.external / points ),
		plugins_avg_ms: Math.round( totals.plugins / points ),
	};
}

const SAMPLE_PLUGINS: Array< { slug: string; name: string } > = [
	{ slug: 'jetpack', name: 'Jetpack' },
	{ slug: 'woocommerce', name: 'WooCommerce' },
	{ slug: 'akismet', name: 'Akismet Anti-spam' },
	{ slug: 'yoast-seo', name: 'Yoast SEO' },
	{ slug: 'wpforms-lite', name: 'WPForms Lite' },
	{ slug: 'elementor', name: 'Elementor' },
	{ slug: 'wordfence', name: 'Wordfence Security' },
	{ slug: 'classic-editor', name: 'Classic Editor' },
];

const SAMPLE_HOOKS = [
	'init',
	'wp_loaded',
	'template_redirect',
	'wp_enqueue_scripts',
	'plugins_loaded',
	'admin_init',
	'pre_get_posts',
	'shutdown',
	'rest_api_init',
	'save_post',
];

const SAMPLE_TEMPLATES = [
	'single.php',
	'page.php',
	'archive.php',
	'index.php',
	'header.php',
	'footer.php',
	'sidebar.php',
	'searchform.php',
	'404.php',
	'category.php',
];

function generateWordPress( seed: number ): ApmWordPress {
	const random = rng( seed ^ 0x57504d50 );

	const plugins: ApmPluginUsage[] = SAMPLE_PLUGINS.map( ( plugin ) => {
		const call_count = Math.round( 200 + random() * 4800 );
		const avg_ms = Math.round( 5 + random() * 95 );
		return {
			slug: plugin.slug,
			name: plugin.name,
			call_count,
			avg_ms,
			total_ms: call_count * avg_ms,
		};
	} ).sort( ( a, b ) => b.total_ms - a.total_ms );

	const hooks: ApmHookUsage[] = SAMPLE_HOOKS.map( ( name ) => {
		const call_count = Math.round( 500 + random() * 9500 );
		const avg_ms = Math.round( 1 + random() * 40 );
		return {
			name,
			call_count,
			avg_ms,
			total_ms: call_count * avg_ms,
		};
	} ).sort( ( a, b ) => b.total_ms - a.total_ms );

	const templates: ApmTemplateUsage[] = SAMPLE_TEMPLATES.map( ( template ) => {
		const hit_count = Math.round( 50 + random() * 2950 );
		const avg_ms = Math.round( 20 + random() * 380 );
		return {
			template,
			hit_count,
			avg_ms,
			total_ms: hit_count * avg_ms,
		};
	} ).sort( ( a, b ) => b.total_ms - a.total_ms );

	return { plugins, hooks, templates };
}

function fetchApmWordPress( siteId: number ): Promise< ApmWordPress > {
	return Promise.resolve( generateWordPress( siteId ) );
}

const TRANSACTION_ROUTES: Array< { method: string; url: string } > = [
	{ method: 'GET', url: '/wp-json/wp/v2/posts' },
	{ method: 'POST', url: '/wp-admin/admin-ajax.php' },
	{ method: 'GET', url: '/wp-json/woocommerce/v3/orders' },
	{ method: 'GET', url: '/?p=1234' },
	{ method: 'POST', url: '/wp-login.php' },
	{ method: 'GET', url: '/feed/' },
	{ method: 'GET', url: '/shop/cart/' },
	{ method: 'POST', url: '/checkout/' },
	{ method: 'GET', url: '/wp-cron.php' },
	{ method: 'GET', url: '/wp-json/jetpack/v4/sync' },
];

function generateTransactions( seed: number ): ApmTransaction[] {
	const random = rng( seed ^ 0x54584e53 );
	return TRANSACTION_ROUTES.map( ( { method, url } ) => {
		const call_count = Math.round( 50 + random() * 4950 );
		const avg_ms = Math.round( 80 + random() * 920 );
		const max_ms = Math.round( avg_ms * ( 1.5 + random() * 6 ) );
		return {
			method,
			url,
			call_count,
			avg_ms,
			max_ms,
			total_ms: call_count * avg_ms,
		};
	} ).sort( ( a, b ) => b.max_ms - a.max_ms );
}

const SAMPLE_QUERIES = [
	"SELECT * FROM wp_posts WHERE post_type = 'product' AND post_status = 'publish' ORDER BY post_date DESC LIMIT 12",
	'SELECT option_value FROM wp_options WHERE option_name = ? LIMIT 1',
	'SELECT meta_key, meta_value FROM wp_postmeta WHERE post_id IN (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
	'SELECT * FROM wp_woocommerce_order_items WHERE order_id = ?',
	"SELECT user_id, meta_value FROM wp_usermeta WHERE meta_key = 'session_tokens'",
	'SELECT COUNT(*) FROM wp_comments WHERE comment_approved = ?',
	'SELECT * FROM wp_terms INNER JOIN wp_term_taxonomy ON wp_terms.term_id = wp_term_taxonomy.term_id',
	"SELECT * FROM wp_actionscheduler_actions WHERE status = 'pending' AND scheduled_date_gmt <= NOW()",
	'UPDATE wp_options SET option_value = ? WHERE option_name = ?',
	'SELECT * FROM wp_posts WHERE ID = ?',
];

function generateSlowQueries( seed: number ): ApmSlowQuery[] {
	const random = rng( seed ^ 0x44424153 );
	return SAMPLE_QUERIES.map( ( query, i ) => {
		const call_count = Math.round( 20 + random() * 4980 );
		const avg_ms = Math.round( 20 + random() * 480 );
		const max_ms = Math.round( avg_ms * ( 1.4 + random() * 5 ) );
		return {
			id: `q-${ seed.toString( 36 ) }-${ i }`,
			query,
			call_count,
			avg_ms,
			max_ms,
			total_ms: call_count * avg_ms,
		};
	} ).sort( ( a, b ) => b.max_ms - a.max_ms );
}

const SAMPLE_EXTERNAL_REQUESTS: Array< { host: string; endpoint: string; method: string } > = [
	{ host: 'api.stripe.com', endpoint: '/v1/charges', method: 'POST' },
	{ host: 'connect.akismet.com', endpoint: '/1.1/comment-check', method: 'POST' },
	{ host: 'public-api.wordpress.com', endpoint: '/rest/v1.1/sites', method: 'GET' },
	{ host: 'jetpack.wordpress.com', endpoint: '/jetpack-api/v1/sync', method: 'POST' },
	{ host: 'api.mailchimp.com', endpoint: '/3.0/lists/{id}/members', method: 'POST' },
	{ host: 'graph.facebook.com', endpoint: '/v18.0/me/feed', method: 'POST' },
	{ host: 'api.cloudflare.com', endpoint: '/client/v4/zones/{id}/purge_cache', method: 'POST' },
	{ host: 'fonts.googleapis.com', endpoint: '/css2', method: 'GET' },
];

function generateExternalRequests( seed: number ): ApmExternalRequest[] {
	const random = rng( seed ^ 0x45585452 );
	return SAMPLE_EXTERNAL_REQUESTS.map( ( { host, endpoint, method } ) => {
		const call_count = Math.round( 10 + random() * 1990 );
		const avg_ms = Math.round( 100 + random() * 1400 );
		const max_ms = Math.round( avg_ms * ( 1.5 + random() * 5 ) );
		return {
			host,
			endpoint,
			method,
			call_count,
			avg_ms,
			max_ms,
			total_ms: call_count * avg_ms,
		};
	} ).sort( ( a, b ) => b.max_ms - a.max_ms );
}

function fetchApmTransactions( siteId: number ): Promise< ApmTransaction[] > {
	return Promise.resolve( generateTransactions( siteId ) );
}

function fetchApmSlowQueries( siteId: number ): Promise< ApmSlowQuery[] > {
	return Promise.resolve( generateSlowQueries( siteId ) );
}

function fetchApmExternalRequests( siteId: number ): Promise< ApmExternalRequest[] > {
	return Promise.resolve( generateExternalRequests( siteId ) );
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

export const siteApmWordPressQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'apm', 'wordpress' ],
		queryFn: () => fetchApmWordPress( siteId ),
	} );

export const siteApmTransactionsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'apm', 'transactions' ],
		queryFn: () => fetchApmTransactions( siteId ),
	} );

export const siteApmSlowQueriesQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'apm', 'slow-queries' ],
		queryFn: () => fetchApmSlowQueries( siteId ),
	} );

export const siteApmExternalRequestsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'apm', 'external-requests' ],
		queryFn: () => fetchApmExternalRequests( siteId ),
	} );
