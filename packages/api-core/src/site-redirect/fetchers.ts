import { wpcom } from '../wpcom-fetcher';
import { SiteRedirect } from './types';

export async function fetchSiteRedirect( siteSlug: string ): Promise< SiteRedirect > {
	const { settings } = await wpcom.req.get( {
		path: `/sites/${ siteSlug }/redirect`,
		apiVersion: '1.1',
	} );
	return settings;
}
