import { wpcom } from '../wpcom-fetcher';
import type { Crontab, CreateCrontabParams } from './types';

export async function createCrontab(
	siteId: number,
	params: CreateCrontabParams
): Promise< Crontab > {
	const response = await wpcom.req.post( {
		path: `/sites/${ siteId }/hosting/crontab`,
		apiNamespace: 'wpcom/v2',
		body: params,
	} );

	return {
		cron_id: response.cron_id,
		schedule: params.schedule,
		command: params.command,
	};
}

export async function deleteCrontab( siteId: number, cronId: number ): Promise< void > {
	await wpcom.req.post( {
		method: 'DELETE',
		path: `/sites/${ siteId }/hosting/crontab/${ cronId }`,
		apiNamespace: 'wpcom/v2',
	} );
}
