/** @format */
/**
 * Internal dependencies
 */
import feed from './feed';
import followingMine from './following/mine';
import recommendations from './recommendations';
import site from './site';
import tags from './tags';
import teams from './teams';
import { mergeHandlers } from 'state/action-watchers/utils';

export default mergeHandlers( site, teams, tags, followingMine, feed, recommendations );
