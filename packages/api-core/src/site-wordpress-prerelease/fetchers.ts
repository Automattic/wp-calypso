import { wpcom } from '../wpcom-fetcher';
import type { WordPressPrerelease } from './types';

export async function fetchWordPressPrerelease( siteId: number ): Promise< WordPressPrerelease > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/hosting/wp-version/prerelease`,
		apiNamespace: 'wpcom/v2',
	} );
}
