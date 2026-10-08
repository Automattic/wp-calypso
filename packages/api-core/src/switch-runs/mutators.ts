import { wpcom } from '../wpcom-fetcher';
import type { AttachSwitchRunRequest, CreateSwitchRunRequest, SwitchRun } from './types';

export async function createSwitchRun( request: CreateSwitchRunRequest ) {
	return wpcom.req.post(
		{
			path: '/switch-runs',
			apiNamespace: 'wpcom/v2',
		},
		request
	) as Promise< SwitchRun >;
}

export async function attachSwitchRun( runId: string, request: AttachSwitchRunRequest ) {
	return wpcom.req.post(
		{
			path: `/switch-runs/${ runId }/attach`,
			apiNamespace: 'wpcom/v2',
		},
		request
	) as Promise< SwitchRun >;
}
