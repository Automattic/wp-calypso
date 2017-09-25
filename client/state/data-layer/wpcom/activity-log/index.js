/**
 * Internal dependencies
 */
import activate from './activate';
import deactivate from './deactivate';
import rewind from './rewind';
import { mergeHandlers } from 'state/action-watchers/utils';

export default mergeHandlers(
	activate,
	deactivate,
	rewind,
);
