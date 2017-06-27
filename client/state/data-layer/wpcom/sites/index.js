/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import activity from './activity';
import automatedTransfer from './automated-transfer';
import comments from './comments';
import media from './media';
import posts from './posts';

export default mergeHandlers(
	activity,
	automatedTransfer,
	comments,
	media,
	posts,
);
