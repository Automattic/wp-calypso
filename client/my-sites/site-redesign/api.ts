import { isEnabled } from '@automattic/calypso-config';
import wpcom from 'calypso/lib/wp';

export type RedesignError = { code: string; message: string; retryable?: boolean };

export type PreviewRoute = {
	path: string;
	title: string;
	type: string;
	id: number | null;
	complete: boolean;
};

export type Candidate = {
	id: string;
	batch: number;
	status: 'queued' | 'running' | 'succeeded' | 'failed';
	progress: { step: string; completed: number; total: number } | null;
	error: RedesignError | null;
	/** Only the home page; `GET /preview` lists every page. */
	routes: PreviewRoute[] | null;
	route_count: number | null;
};

export type Eligibility = {
	can_preview: boolean;
	can_apply: boolean;
	reason: string | null;
	required_plan: string;
	checkout_url?: string | null;
};

export type RedesignStatus =
	| 'interview'
	| 'generating'
	| 'preview_ready'
	| 'failed'
	| 'applying'
	| 'installed'
	| 'applied'
	| 'rolled_back'
	| 'superseded';

export type Redesign = {
	id: string;
	site_id: number;
	status: RedesignStatus;
	candidates: Candidate[];
	selected: string | null;
	pending_apply: string | null;
	eligibility: Eligibility;
	apply: null | {
		status: string;
		error: RedesignError | null;
	};
	applied: null | {
		mode: 'installed' | 'activated';
		preview_url: string;
		can_rollback: boolean;
	};
};

export type RedesignPreview = {
	generation_id: string;
	path: string;
	html: string;
	routes: PreviewRoute[];
};

export type ApiRequest = {
	method: 'GET' | 'POST';
	path: string;
	query?: Record< string, string >;
	body?: Record< string, unknown >;
};

// Until the wpcom routes are deployed, the `themes/site-redesign-fixtures` flag answers from
// fixture.ts, which follows the shape in the shared API contract.
async function request< T >( siteId: number, req: ApiRequest ): Promise< T > {
	if ( isEnabled( 'themes/site-redesign-fixtures' ) ) {
		const { fixtureRequest } = await import( './fixture' );
		return fixtureRequest< T >( siteId, req );
	}
	const { method, path, query, body } = req;
	const fullPath = `/sites/${ siteId }/site-redesign${ path }`;
	if ( method === 'GET' ) {
		return wpcom.req.get( { apiNamespace: 'wpcom/v2', path: fullPath }, query ?? {} );
	}
	return wpcom.req.post( { apiNamespace: 'wpcom/v2', path: fullPath }, {}, body ?? {} );
}

const run = ( id: string, action = '' ) => `/${ encodeURIComponent( id ) }${ action }`;

export const openRedesign = ( siteId: number ) =>
	request< Redesign >( siteId, { method: 'POST', path: '' } );

export const fetchRedesign = ( siteId: number, id: string ) =>
	request< Redesign >( siteId, { method: 'GET', path: run( id ) } );

export const generateRedesign = ( siteId: number, id: string ) =>
	request< Redesign >( siteId, {
		method: 'POST',
		path: run( id, '/generate' ),
		body: { brief_confirmed: true },
	} );

export const fetchPreview = ( siteId: number, id: string, generationId: string ) =>
	request< RedesignPreview >( siteId, {
		method: 'GET',
		path: run( id, '/preview' ),
		query: { generation_id: generationId, path: '/' },
	} );

export const applyRedesign = ( siteId: number, id: string, generationId: string ) =>
	request< Redesign >( siteId, {
		method: 'POST',
		path: run( id, '/apply' ),
		body: { generation_id: generationId },
	} );

export const activateRedesign = ( siteId: number, id: string ) =>
	request< Redesign >( siteId, { method: 'POST', path: run( id, '/activate' ) } );

export function errorCode( error: unknown ): string | null {
	if ( ! error || typeof error !== 'object' ) {
		return null;
	}
	const { code } = error as { code?: unknown };
	return typeof code === 'string' ? code : null;
}

/**
 * The checkout URL from a 402 on apply, only when it stays on this origin and goes to checkout.
 */
export function getCheckoutUrl( error: unknown ): string | null {
	if ( errorCode( error ) !== 'site_redesign_upgrade_required' ) {
		return null;
	}
	const url = ( error as { data?: { checkout_url?: unknown } } ).data?.checkout_url;
	if ( typeof url !== 'string' ) {
		return null;
	}
	try {
		const parsed = new URL( url, window.location.origin );
		return parsed.origin === window.location.origin && parsed.pathname.startsWith( '/checkout/' )
			? parsed.pathname + parsed.search
			: null;
	} catch {
		return null;
	}
}

/** The candidates of the newest batch, the ones to show. */
export function currentBatch( redesign: Redesign ): Candidate[] {
	const batch = Math.max( 0, ...redesign.candidates.map( ( c ) => c.batch ) );
	return redesign.candidates.filter( ( c ) => c.batch === batch );
}
