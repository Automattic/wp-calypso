import { wpcom } from '../wpcom-fetcher';
import { SiteFeaturesResponse } from './types';

export async function fetchSiteFeatures( siteId: number ): Promise< SiteFeaturesResponse > {
	return wpcom.req.get( `/sites/${ siteId }/features` );
}
