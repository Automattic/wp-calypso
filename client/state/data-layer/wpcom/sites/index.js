/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import automatedTransfer from './automated-transfer';
import stats from './stats';

export default mergeHandlers(
	automatedTransfer,
	stats,
);
