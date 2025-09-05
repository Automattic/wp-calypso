import { wpcom } from '../wpcom-fetcher';
import type { JetpackConnection } from './types';

export async function fetchJetpackConnection( siteId: number ): Promise< JetpackConnection > {
	const { data } = await wpcom.req.get( `/jetpack-blogs/${ siteId }/rest-api/`, {
		path: '/jetpack/v4/connection/',
	} );

	return data;
}
