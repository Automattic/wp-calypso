/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import activate from './activate';
import activity from './activity';
import deactivate from './deactivate';
import rewind from './rewind';

export default mergeHandlers(
	activate,
	activity,
	deactivate,
	rewind,
);
