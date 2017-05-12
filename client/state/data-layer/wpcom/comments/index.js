/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';

import content from './content';
import likes from './likes';
import postComments from './post-comments';
import status from './status';

export default mergeHandlers(
	content,
	postComments,
	likes,
	status,
);
