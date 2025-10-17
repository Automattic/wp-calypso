import { wpcom } from '../wpcom-fetcher';
import { SiteSettings } from './types';

export async function fetchSiteSettings( siteId: number ): Promise< SiteSettings > {
	const { settings } = await wpcom.req.get( {
		path: `/sites/${ siteId }/settings`,
		apiVersion: '1.4',
	} );
	return settings;
}
