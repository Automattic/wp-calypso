/**
 * Answers the site-redesign routes in the browser until wpcom deploys them. The shapes follow the
 * shared API contract; progress is derived from the time each step started, so polling moves it on.
 * Sessions live in sessionStorage so they survive the trip through checkout.
 *
 * One shortcut: there is no plan to check, so the first apply of a candidate answers 402 and the
 * apply that follows the checkout return succeeds.
 */
import type { ApiRequest, Candidate, Redesign } from './api';

const STORAGE_KEY = 'site-redesign-fixture';
const CANDIDATE_MS = [ 3000, 5000, 7000, 9000 ];
const APPLY_STEPS = [ 'queued', 'delivering', 'installed' ];
const STEP_MS = 2500;
const PALETTES = [
	[ '#1d3557', '#f1faee', 'Georgia, serif' ],
	[ '#2a9d8f', '#fefae0', 'Helvetica, sans-serif' ],
	[ '#6d597a', '#fff1e6', '"Times New Roman", serif' ],
	[ '#e76f51', '#faf3e0', 'Verdana, sans-serif' ],
];

type StoredSession = {
	redesign: Redesign;
	generatedAt: number | null;
	applyStartedAt: number | null;
	activateStartedAt: number | null;
};

const hex = () =>
	Array.from( { length: 32 }, () => Math.floor( Math.random() * 16 ).toString( 16 ) ).join( '' );

function load(): Record< string, StoredSession > {
	try {
		return JSON.parse( window.sessionStorage.getItem( STORAGE_KEY ) ?? '{}' );
	} catch {
		return {};
	}
}

function save( sessions: Record< string, StoredSession > ) {
	try {
		window.sessionStorage.setItem( STORAGE_KEY, JSON.stringify( sessions ) );
	} catch {
		// Private windows can refuse storage; the fixture then lives only until a reload.
	}
}

function fail( status: number, code: string, message: string, data: object = {} ) {
	return Promise.reject( {
		code,
		message,
		data: { status, ...data },
	} );
}

function checkoutUrl( siteId: number, redesignId: string ) {
	const back = `/site-redesign/${ siteId }?redesign=${ redesignId }&resume=apply`;
	return `/checkout/${ siteId }/personal?redirect_to=${ encodeURIComponent( back ) }`;
}

function advance( stored: StoredSession, now: number ): Redesign {
	const redesign = stored.redesign;
	if ( stored.generatedAt !== null && redesign.status === 'generating' ) {
		const elapsed = now - stored.generatedAt;
		redesign.candidates = redesign.candidates.map( ( candidate, index ): Candidate => {
			const total = CANDIDATE_MS[ index ];
			if ( elapsed >= total ) {
				return {
					...candidate,
					status: 'succeeded',
					progress: { step: 'dsl-export', completed: 9, total: 9 },
					routes: [ { path: '/', title: 'Home', type: 'page', id: 1, complete: true } ],
				};
			}
			const completed = Math.floor( ( elapsed / total ) * 9 );
			return {
				...candidate,
				status: completed > 0 ? 'running' : 'queued',
				progress: { step: 'compose', completed, total: 9 },
			};
		} );
		if ( redesign.candidates.every( ( c ) => c.status === 'succeeded' ) ) {
			redesign.status = 'preview_ready';
		}
	}
	if ( stored.applyStartedAt !== null && redesign.status === 'applying' ) {
		const step = Math.min(
			APPLY_STEPS.length - 1,
			Math.floor( ( now - stored.applyStartedAt ) / STEP_MS )
		);
		redesign.apply = { status: APPLY_STEPS[ step ], error: null };
		if ( APPLY_STEPS[ step ] === 'installed' ) {
			redesign.status = 'installed';
			redesign.pending_apply = null;
			redesign.applied = {
				mode: 'installed',
				can_rollback: true,
				preview_url: `https://example.wordpress.com/wp-admin/site-editor.php?wp_theme_preview=pub/redesign-fixture&wpcom_dashboard_link=${ encodeURIComponent(
					`/site-redesign/${ redesign.site_id }?redesign=${ redesign.id }`
				) }`,
			};
		}
	}
	if ( stored.activateStartedAt !== null && redesign.status === 'applying' ) {
		if ( now - stored.activateStartedAt >= STEP_MS * 2 ) {
			redesign.status = 'applied';
			redesign.apply = { status: 'succeeded', error: null };
			redesign.applied = {
				mode: 'activated',
				can_rollback: true,
				preview_url: 'https://example.wordpress.com/',
			};
		}
	}
	return redesign;
}

function previewHtml( index: number ) {
	const [ ink, paper, font ] = PALETTES[ index % PALETTES.length ];
	return `<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><style>
body{margin:0;font-family:${ font };background:${ paper };color:${ ink }}
header{padding:24px 48px;border-bottom:4px solid ${ ink };font-size:22px}
section{padding:96px 48px}h1{font-size:64px;margin:0 0 16px}p{font-size:22px;max-width:640px}
a{display:inline-block;margin-top:24px;padding:16px 32px;background:${ ink };color:${ paper };text-decoration:none}
</style></head><body><header>My Site</header><section><h1>Design ${
		index + 1
	}</h1><p>Fixture preview. The real one is the engine's front page with this site's content.</p><a href="/">Read more</a></section></body></html>`;
}

export function fixtureRequest< T >(
	siteId: number,
	{ method, path, query, body }: ApiRequest
): Promise< T > {
	const sessions = load();
	const now = Date.now();
	const respond = ( stored: StoredSession ) => {
		sessions[ stored.redesign.id ] = stored;
		save( sessions );
		return Promise.resolve( structuredClone( stored.redesign ) as T );
	};

	if ( method === 'POST' && path === '' ) {
		const open = Object.values( sessions ).find(
			( s ) => s.redesign.site_id === siteId && s.redesign.status !== 'applied'
		);
		if ( open ) {
			return respond( { ...open, redesign: advance( open, now ) } );
		}
		return respond( {
			redesign: {
				id: `rd_${ hex() }`,
				site_id: siteId,
				status: 'interview',
				candidates: [],
				selected: null,
				pending_apply: null,
				eligibility: {
					can_preview: true,
					can_apply: false,
					reason: 'upgrade_required',
					required_plan: 'personal',
				},
				apply: null,
				applied: null,
			},
			generatedAt: null,
			applyStartedAt: null,
			activateStartedAt: null,
		} );
	}

	const [ , rawId, action = '' ] = path.split( '/' );
	const stored = sessions[ decodeURIComponent( rawId ?? '' ) ];
	if ( ! stored || stored.redesign.site_id !== siteId ) {
		return fail( 404, 'site_redesign_not_found', 'This redesign does not exist.' );
	}
	const redesign = advance( stored, now );

	if ( method === 'GET' && action === '' ) {
		return respond( stored );
	}
	if ( method === 'GET' && action === 'preview' ) {
		const index = redesign.candidates.findIndex( ( c ) => c.id === query?.generation_id );
		if ( index < 0 ) {
			return fail( 409, 'site_redesign_stale_generation', 'This design is no longer available.' );
		}
		if ( redesign.candidates[ index ].status !== 'succeeded' ) {
			return fail( 409, 'site_redesign_preview_not_ready', 'This design is not ready yet.' );
		}
		return Promise.resolve( {
			generation_id: query?.generation_id,
			path: '/',
			html: previewHtml( index ),
		} as T );
	}
	if ( method === 'POST' && action === 'generate' ) {
		if ( [ 'generating', 'applying' ].includes( redesign.status ) ) {
			return fail( 409, 'site_redesign_busy', 'A design is already being made.' );
		}
		const batch = Math.max( 0, ...redesign.candidates.map( ( c ) => c.batch ) ) + 1;
		redesign.status = 'generating';
		redesign.candidates = CANDIDATE_MS.map( () => ( {
			id: `gen_${ hex() }`,
			batch,
			status: 'queued',
			progress: { step: 'queued', completed: 0, total: 9 },
			error: null,
			routes: null,
		} ) );
		return respond( { ...stored, redesign, generatedAt: now } );
	}
	if ( method === 'POST' && action === 'apply' ) {
		const generationId = body?.generation_id as string;
		if ( redesign.status !== 'preview_ready' ) {
			return fail( 409, 'site_redesign_busy', 'This redesign is busy.' );
		}
		if ( redesign.pending_apply !== generationId ) {
			redesign.pending_apply = generationId;
			redesign.selected = generationId;
			// As if the purchase lands while the user is in checkout.
			redesign.eligibility = { ...redesign.eligibility, can_apply: true, reason: null };
			sessions[ redesign.id ] = { ...stored, redesign };
			save( sessions );
			return fail(
				402,
				'site_redesign_upgrade_required',
				'Upgrade to the Personal plan or higher to use this design.',
				{ required_plan: 'personal', checkout_url: checkoutUrl( siteId, redesign.id ) }
			);
		}
		redesign.status = 'applying';
		redesign.apply = { status: 'queued', error: null };
		return respond( { ...stored, redesign, applyStartedAt: now } );
	}
	if ( method === 'POST' && action === 'activate' ) {
		if ( redesign.status !== 'installed' ) {
			return fail( 409, 'site_redesign_not_installed', 'There is no installed design.' );
		}
		redesign.status = 'applying';
		redesign.apply = { status: 'activating', error: null };
		return respond( { ...stored, redesign, applyStartedAt: null, activateStartedAt: now } );
	}
	return fail( 404, 'rest_no_route', 'No route was found.' );
}
