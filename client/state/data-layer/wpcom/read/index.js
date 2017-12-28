/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'client/state/action-watchers/utils';

import feed from './feed';
import followingMine from './following/mine';
import recommendations from './recommendations';
import site from './site';
import sites from './sites';
import tags from './tags';
import teams from './teams';

export default mergeHandlers( feed, followingMine, recommendations, site, sites, tags, teams );
