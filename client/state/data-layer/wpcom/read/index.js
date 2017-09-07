/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import site from './site';
import teams from './teams';
import tags from './tags';
import followingMine from './following/mine';
import feed from './feed';
import recommendations from './recommendations';

export default mergeHandlers( site, teams, tags, followingMine, feed, recommendations );
