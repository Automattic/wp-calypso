/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import lookup from './lookup';

export default mergeHandlers(
	lookup,
);
