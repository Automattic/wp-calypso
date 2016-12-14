/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import automatedTransfer from './automated-transfer';

export default mergeHandlers(
	automatedTransfer,
);
