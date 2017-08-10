/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import directly from './directly';

export const handlers = mergeHandlers( directly );

export default handlers;
