/*
 * @format
 */

/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import sites from './sites';

registerHandlers( 'state/data-layer/wpcom/me/blocks/index.js', mergeHandlers( sites ) );

export default {};
