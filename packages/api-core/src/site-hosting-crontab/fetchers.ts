import { wpcom } from '../wpcom-fetcher';
import type { Crontab } from './types';

export async function fetchCrontabs( siteId: number ): Promise< Crontab[] > {
	const { crontabs } = await wpcom.req.get( {
		path: `/sites/${ siteId }/hosting/crontab`,
		apiNamespace: 'wpcom/v2',
	} );

	return crontabs;
}
