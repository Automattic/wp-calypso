import { wpcom } from '../wpcom-fetcher';
import type { JetpackModule } from './types';

export async function fetchJetpackModules(
	siteId: number
): Promise< Record< string, JetpackModule > > {
	const { data } = await wpcom.req.get( `/jetpack-blogs/${ siteId }/rest-api/`, {
		path: '/jetpack/v4/module/all/',
	} );

	return data;
}
