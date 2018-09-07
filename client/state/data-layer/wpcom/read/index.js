/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';

import feed from './feed';
import followingMine from './following/mine';
import recommendations from './recommendations';
import site from './site';
import sites from './sites';
import streams from './streams';
import tags from './tags';
import teams from './teams';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers(
	'state/data-layer/wpcom/read/index.js',
	mergeHandlers( feed, followingMine, recommendations, site, sites, streams, tags, teams )
);

export default {};
