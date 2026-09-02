import { wpcom } from '../wpcom-fetcher';
import type { AiLaunchpad } from './types';

export async function fetchSiteAiLaunchpad( siteId: number ): Promise< AiLaunchpad > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/ai-launchpad`,
		apiNamespace: 'wpcom/v2',
	} );
}
