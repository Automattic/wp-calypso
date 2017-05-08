/**
 * Internal Dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import subscribe from './new';
import update from './update';
import unsubscribe from './delete';

export default mergeHandlers(
	subscribe,
	update,
	unsubscribe,
);
