import { wpcom } from '../wpcom-fetcher';
import { SitePerformancePage } from './types';

export const fetchSitePerformancePages = async (
	siteId: number
): Promise< SitePerformancePage[] > => {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/site-profiler/pages`,
		apiNamespace: 'wpcom/v2',
	} );
};
