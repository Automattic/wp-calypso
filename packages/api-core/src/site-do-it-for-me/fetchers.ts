import { wpcom } from '../wpcom-fetcher';
import type { DifmWebsiteContentResponse } from './types';

export function fetchDifmWebsiteContent( siteId: number ): Promise< DifmWebsiteContentResponse > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/do-it-for-me/website-content`,
		apiNamespace: 'wpcom/v2',
	} );
}
