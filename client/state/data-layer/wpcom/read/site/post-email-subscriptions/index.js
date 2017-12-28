/** @format */
/**
 * Internal Dependencies
 */
import { mergeHandlers } from 'client/state/action-watchers/utils';
import subscribe from './new';
import update from './update';
import unsubscribe from './delete';

export default mergeHandlers( subscribe, update, unsubscribe );
