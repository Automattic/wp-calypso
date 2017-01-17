/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import blog from './blog';
import feed from './feed';
import likes from './likes';
import tag from './tag';
import recommendations from './recommendations';

export default mergeHandlers(
	blog,
	feed,
	tag,
	recommendations,
	likes,
);
