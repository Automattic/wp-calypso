/** @format */

/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import likes from './likes';
import replies from './replies';

export default mergeHandlers( likes, replies );
