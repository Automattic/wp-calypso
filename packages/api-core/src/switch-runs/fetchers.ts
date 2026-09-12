import { wpcom } from '../wpcom-fetcher';
import type { SwitchRun } from './types';

export async function fetchSwitchRun( runId: string ) {
	return wpcom.req.get( {
		path: `/switch-runs/${ runId }`,
		apiNamespace: 'wpcom/v2',
	} ) as Promise< SwitchRun >;
}
