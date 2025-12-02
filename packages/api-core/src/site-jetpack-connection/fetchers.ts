import { wpcom } from '../wpcom-fetcher';
import type { JetpackConnection, JetpackConnectionHealth } from './types';

export async function fetchJetpackConnection( siteId: number ): Promise< JetpackConnection > {
	const { data } = await wpcom.req.get( `/jetpack-blogs/${ siteId }/rest-api/`, {
		path: '/jetpack/v4/connection/',
	} );

	return data;
}

export async function fetchJetpackConnectionHealth(
	siteId: number
): Promise< JetpackConnectionHealth > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/jetpack-connection-health`,
		apiNamespace: 'wpcom/v2',
	} );
}
