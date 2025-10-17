import { wpcom } from '../wpcom-fetcher';
import type { SiteSettings } from './types';

export async function updateSiteSettings(
	siteId: number,
	data: Partial< SiteSettings >
): Promise< Partial< SiteSettings > > {
	const { updated } = await wpcom.req.post(
		{
			path: `/sites/${ siteId }/settings`,
			apiVersion: '1.4',
		},
		data
	);
	return updated;
}
