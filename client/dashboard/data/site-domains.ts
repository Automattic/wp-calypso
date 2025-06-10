import wpcom from 'calypso/lib/wp';

export async function fetchSiteDomains( siteId: string ): Promise<{ domains: Domain[] }> {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/domains`,
		apiVersion: '1.2',
	} );
};
