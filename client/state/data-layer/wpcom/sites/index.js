/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import automatedTransfer from './automated-transfer';
import comments from './comments';
import media from './media';

export default mergeHandlers(
	automatedTransfer,
	comments,
	media
);
