/**
 * Internal dependencies
 */
import revisions from './revisions';
import { mergeHandlers } from 'state/action-watchers/utils';

export default mergeHandlers(
	revisions,
);
