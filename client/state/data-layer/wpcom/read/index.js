/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import site from './site';
import teams from './teams';
import tags from './tags';
import followingMine from './following/mine';
import feed from './feed';

export default mergeHandlers(
	site,
	teams,
	tags,
	followingMine,
	feed,
);
