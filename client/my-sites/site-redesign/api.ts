import wpcom from 'calypso/lib/wp';

export type DesignBrief = {
	goal: string;
	style: string;
	audience?: string;
	mood_keywords?: string[];
	palette?: { description?: string; colors?: string[] };
	typography?: { headings?: string; body?: string };
	references?: string[];
};
export type PreviewRoute = { path: string; title: string; type: string; id: number | null };
export type RedesignEligibility = {
	can_preview: boolean;
	can_apply: boolean;
	reason: string | null;
	required_plan: string;
};
export type Redesign = {
	id: string;
	site_id: number;
	status: string;
	brief: DesignBrief | null;
	brief_draft: DesignBrief | null;
	brief_revision: number;
	brief_confirmed: boolean;
	content: null | {
		pages: number;
		posts: number;
		media: number;
		navigation: number;
		truncated: boolean;
		unsupported: { code: string; message: string }[];
		warnings?: { code: string; message: string }[];
	};
	apply?: null | {
		status: string;
		error: null | { code: string; message: string; retryable: boolean; requires?: string };
	};
	applied: null | { can_rollback: boolean };
	eligibility: RedesignEligibility;
	generation: null | {
		id: string;
		status: string;
		progress: { step: string; completed: number; total: number };
		error: null | { code: string; message: string; retryable: boolean };
		/** The brief revision this generation was started from; null for runs from before revisions. */
		brief_revision?: number | null;
		started_by?: 'agent' | 'ui';
	};
	preview: null | { routes: PreviewRoute[] };
	/** The fresh run that replaced this one when the user started over. */
	successor_id?: string | null;
	/** Whether starting over is allowed now: not while generating or applying, nor once replaced. */
	can_restart?: boolean;
};
export type RedesignPreview = {
	html: string;
	generation_id: string;
	path: string;
	routes: PreviewRoute[];
};

export function fetchRedesignEligibility( siteId: number ): Promise< RedesignEligibility > {
	return wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ siteId }/site-redesign/eligibility`,
	} );
}
export function fetchRedesign( siteId: number, id: string ): Promise< Redesign > {
	return wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ siteId }/site-redesign/${ encodeURIComponent( id ) }`,
	} );
}
export function startRedesign( siteId: number ): Promise< Redesign > {
	return wpcom.req.post(
		{ apiNamespace: 'wpcom/v2', path: `/sites/${ siteId }/site-redesign` },
		{},
		{}
	);
}
export function generateRedesign( run: Redesign ): Promise< Redesign > {
	return wpcom.req.post(
		{
			apiNamespace: 'wpcom/v2',
			path: `/sites/${ run.site_id }/site-redesign/${ encodeURIComponent( run.id ) }/generate`,
		},
		{},
		{ brief_revision: run.brief_revision, brief_confirmed: true }
	);
}
/** Starts over on a fresh run; the old run is kept server-side as superseded. */
export function restartRedesign( run: Redesign ): Promise< Redesign > {
	return wpcom.req.post(
		{
			apiNamespace: 'wpcom/v2',
			path: `/sites/${ run.site_id }/site-redesign/${ encodeURIComponent( run.id ) }/restart`,
		},
		{},
		{}
	);
}
export function fetchRedesignPreview(
	run: { id: string; site_id: number; generation: { id: string } | null },
	path: string
): Promise< RedesignPreview > {
	return wpcom.req.get(
		{
			apiNamespace: 'wpcom/v2',
			path: `/sites/${ run.site_id }/site-redesign/${ encodeURIComponent( run.id ) }/preview`,
		},
		{ path, generation_id: run.generation?.id }
	);
}
export function applyRedesign( run: Redesign, allowSourceChanges = false ): Promise< Redesign > {
	return wpcom.req.post(
		{
			apiNamespace: 'wpcom/v2',
			path: `/sites/${ run.site_id }/site-redesign/${ encodeURIComponent( run.id ) }/apply`,
		},
		{},
		{
			generation_id: run.generation?.id,
			...( allowSourceChanges && { allow_source_changes: true } ),
		}
	);
}
export function rollbackRedesign( run: Redesign ): Promise< Redesign > {
	return wpcom.req.post(
		{
			apiNamespace: 'wpcom/v2',
			path: `/sites/${ run.site_id }/site-redesign/${ encodeURIComponent( run.id ) }/rollback`,
		},
		{},
		{}
	);
}
export function getCheckoutUrl( error: unknown ): string | null {
	if ( ! error || typeof error !== 'object' ) {
		return null;
	}
	const response = error as { error?: string; code?: string; data?: { checkout_url?: unknown } };
	if (
		( response.error ?? response.code ) !== 'site_redesign_upgrade_required' ||
		typeof response.data?.checkout_url !== 'string'
	) {
		return null;
	}
	try {
		const url = new URL( response.data.checkout_url, window.location.origin );
		return url.origin === window.location.origin && url.pathname.startsWith( '/checkout/' )
			? url.href
			: null;
	} catch {
		return null;
	}
}
