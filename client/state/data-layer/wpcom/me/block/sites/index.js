/*
 * @format
 */

/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import deleteBlock from './delete';
import newBlock from './new';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers(
	'state/data-layer/wpcom/me/block/sites/index.js',
	mergeHandlers( deleteBlock, newBlock )
);

export default {};
