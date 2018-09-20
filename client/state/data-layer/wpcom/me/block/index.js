/*
 * @format
 */

/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import sites from './sites';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers( 'state/data-layer/wpcom/me/block/index.js', mergeHandlers( sites ) );
export default {};
