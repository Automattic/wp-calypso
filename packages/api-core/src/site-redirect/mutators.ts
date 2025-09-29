import { wpcom } from '../wpcom-fetcher';

export function updateSiteRedirect( siteId: number, location: string ): Promise< void > {
	return wpcom.req.post( `/sites/${ siteId }/domains/redirect`, { location } );
}
