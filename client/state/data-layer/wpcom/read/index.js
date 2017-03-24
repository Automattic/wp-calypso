/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import teams from './teams';
import tags from './tags';
import followingMine from './following/mine';

export default mergeHandlers(
	teams,
	tags,
	followingMine,
);
