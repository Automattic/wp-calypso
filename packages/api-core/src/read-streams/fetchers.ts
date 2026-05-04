import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { ReadStreamQueryParams, ReadStreamResponse } from './types';

// READ-485: only `following` is migrated in this PR. The remaining 18+ Reader
// stream shapes (`recent`, `feed`, `site`, `featured`, `tag`, `tag_popular`,
// `p2`, `a8c`, `likes`, `notifications`, `user`, `on_this_day`, `discover:*`,
// `search`, `list`, `conversations`, `conversations-a8c`,
// `recommendations_posts`, `custom_recs_*`) are added here incrementally by
// the follow-up PRs of this same task. See the legacy `streamApis` map in
// `client/state/data-layer/wpcom/read/streams/index.js` for the canonical
// per-shape `path`, `apiVersion`, `apiNamespace`, and `query` definitions to
// mirror when porting each one.
export const fetchReadFollowing = (
	params: ReadStreamQueryParams = {}
): Promise< ReadStreamResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( '/read/following', params ),
		apiVersion: '1.2',
		method: 'GET',
	} );
