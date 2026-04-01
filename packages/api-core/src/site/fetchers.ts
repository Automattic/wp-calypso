import { wpcom } from '../wpcom-fetcher';
import { JOINED_SITE_FIELDS, JOINED_SITE_OPTIONS } from './constants';
import type { Site } from './types';

export interface FetchSiteOptions {
	force?: 'wpcom';
}

export async function fetchSite(
	siteIdOrSlug: number | string,
	options: FetchSiteOptions = {}
): Promise< Site > {
	return await wpcom.req.get(
		{ path: `/sites/${ siteIdOrSlug }` },
		{ ...options, fields: JOINED_SITE_FIELDS, options: JOINED_SITE_OPTIONS }
	);
}
