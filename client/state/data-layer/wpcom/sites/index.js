/** @format */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'state/action-watchers/utils';
import commentCounts from './comment-counts';
import comments from './comments';
import posts from './posts';

export default mergeHandlers(
	commentCounts,
	comments,
	posts,
);
