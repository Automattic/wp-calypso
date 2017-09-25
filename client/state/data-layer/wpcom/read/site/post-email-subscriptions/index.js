/** @format */
/**
 * Internal dependencies
 */
import unsubscribe from './delete';
import subscribe from './new';
import update from './update';
import { mergeHandlers } from 'state/action-watchers/utils';

export default mergeHandlers( subscribe, update, unsubscribe );
