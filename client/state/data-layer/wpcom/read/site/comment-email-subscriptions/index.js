/** @format */
/**
 * Internal dependencies
 */
import unsubscribe from './delete';
import subscribe from './new';
import { mergeHandlers } from 'state/action-watchers/utils';

export default mergeHandlers( subscribe, unsubscribe );
