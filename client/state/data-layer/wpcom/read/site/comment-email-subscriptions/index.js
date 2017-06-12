/**
 * External Dependencies
 */

/**
 * Internal Dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import subscribe from './new';
import unsubscribe from './delete';

export default mergeHandlers( subscribe, unsubscribe );
