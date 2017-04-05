/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import teams from './teams';
import tags from './tags';
import followingMine from './following/mine';
import feed from './feed';

export default mergeHandlers(
	teams,
	tags,
	followingMine,
	feed,
);
