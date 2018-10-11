/** @format */

/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import media from './media';

registerHandlers( 'state/data-layer/wpcom/sites/exports/index.js', mergeHandlers( media ) );

export default {};
