import { wpcom } from '../wpcom-fetcher';
import type { WordPressPrerelease } from './types';

export async function updateWordPressPrerelease(
	siteId: number,
	optedOut: boolean
): Promise< WordPressPrerelease > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/hosting/wp-version/prerelease`,
			apiNamespace: 'wpcom/v2',
		},
		{ opted_out: optedOut }
	);
}
