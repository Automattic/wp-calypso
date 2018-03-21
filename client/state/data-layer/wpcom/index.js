/** @format */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'state/action-watchers/utils';
import comments from './comments';
import posts from './posts';
import read from './read';
import sites from './sites';
export const handlers = mergeHandlers(
	comments,
	posts,
	read,
	sites,
);

export default handlers;
