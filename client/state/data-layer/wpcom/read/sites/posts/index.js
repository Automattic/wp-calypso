/** @format */
/**
 * Internal Dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';

import follow from './follow';
import mute from './mute';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers(
	'state/data-layer/wpcom/read/sites/posts/index.js',
	mergeHandlers( follow, mute )
);

export default {};
