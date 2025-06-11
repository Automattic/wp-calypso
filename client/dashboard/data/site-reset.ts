import wpcom from 'calypso/lib/wp';

export type SiteResetContentSummary = {
	post_count: number;
	page_count: number;
	media_count: number;
	plugin_count: number;
};

export type SiteResetStatus = {
	status: 'in-progress' | 'ready' | 'completed';
	progress: number;
};

export async function fetchSiteResetContentSummary(
	siteId: string
): Promise< SiteResetContentSummary > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/reset-site/content-summary`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function resetSite( siteId: string ) {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/reset-site`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchSiteResetStatus( siteId: string ): Promise< SiteResetStatus > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/reset-site/status`,
		apiNamespace: 'wpcom/v2',
	} );
}
