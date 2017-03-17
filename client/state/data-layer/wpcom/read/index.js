/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import teams from './teams';
import tags from './tags';

export default mergeHandlers(
	teams,
	tags,
);
