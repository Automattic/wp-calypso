import { wpcom } from '../wpcom-fetcher';
import type { JetpackSettings } from './types';

export async function fetchJetpackSettings(
	siteId: number
): Promise< Partial< JetpackSettings > > {
	const { data } = await wpcom.req.get( `/jetpack-blogs/${ siteId }/rest-api/`, {
		path: '/jetpack/v4/settings/',
	} );
	return data;
}
