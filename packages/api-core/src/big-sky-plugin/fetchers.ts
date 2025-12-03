import { wpcom } from '../wpcom-fetcher';
import type { BigSkyPluginResponse } from './types';

export async function fetchBigSkyPlugin( siteId: number ): Promise< BigSkyPluginResponse > {
	return await wpcom.req.get( {
		path: `/sites/${ siteId }/big-sky-plugin`,
		apiVersion: '1.1',
	} );
}
