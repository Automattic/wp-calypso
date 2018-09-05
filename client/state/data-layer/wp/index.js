/** @format */

/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import sites from './sites';

export const handlers = mergeHandlers( sites );

export default handlers;
