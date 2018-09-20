/** @format */

/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import likes from './likes';
import replies from './replies';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers( 'state/data-layer/wpcom/sites/posts/index.js', mergeHandlers( likes, replies ) );

export default {};
