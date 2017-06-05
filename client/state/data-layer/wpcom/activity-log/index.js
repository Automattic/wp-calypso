/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import activate from './activate';
import rewind from './rewind';

export default mergeHandlers(
	activate,
	rewind
);
