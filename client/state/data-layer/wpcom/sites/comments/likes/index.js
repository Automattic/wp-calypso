/**
 * Internal dependencies
 */

import mine from './mine';
import newLike from './new';
import { mergeHandlers } from 'state/action-watchers/utils';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers(
	'state/data-layer/wpcom/sites/comments/likes/index.js',
	mergeHandlers( mine, newLike )
);

export default {};
