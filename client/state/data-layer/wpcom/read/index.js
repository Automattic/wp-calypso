/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import streams from './streams';
import teams from './teams';

export default mergeHandlers(
	teams,
	streams,
);
