/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import teams from './teams';
import tags from './tags';
import follows from './follows';

export default mergeHandlers(
	teams,
	tags,
	follows,
);
