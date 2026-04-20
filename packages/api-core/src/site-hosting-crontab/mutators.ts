import { wpcom } from '../wpcom-fetcher';
import type { CrontabFormData } from './types';

export async function createCrontab( siteId: number, params: CrontabFormData ): Promise< void > {
	await wpcom.req.post( {
		path: `/sites/${ siteId }/hosting/crontab`,
		apiNamespace: 'wpcom/v2',
		body: params,
	} );
}

export async function updateCrontab(
	siteId: number,
	cronId: number,
	params: CrontabFormData
): Promise< void > {
	await wpcom.req.put( {
		path: `/sites/${ siteId }/hosting/crontab/${ cronId }`,
		apiNamespace: 'wpcom/v2',
		body: params,
	} );
}

export async function deleteCrontab( siteId: number, cronId: number ): Promise< void > {
	await wpcom.req.post( {
		method: 'DELETE',
		path: `/sites/${ siteId }/hosting/crontab/${ cronId }`,
		apiNamespace: 'wpcom/v2',
	} );
}
