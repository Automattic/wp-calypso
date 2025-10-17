import { wpcom } from '../wpcom-fetcher';
import type { SiteContextualPlan } from './types';

export function fetchSitePlans( siteId: number ): Promise< Record< string, SiteContextualPlan > > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/plans`,
		apiVersion: '1.3',
	} );
}
