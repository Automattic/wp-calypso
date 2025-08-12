import wpcom from 'calypso/lib/wp';

export interface Theme {
	is_block_theme: boolean;
}

export async function fetchSiteActiveThemes( siteId: number ): Promise< Theme[] > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/themes?status=active`,
		apiNamespace: 'wp/v2',
	} );
}
