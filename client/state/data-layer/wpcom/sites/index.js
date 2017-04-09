/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import automatedTransfer from './automated-transfer';
import media from './media';

export default mergeHandlers(
	automatedTransfer,
	media
);
