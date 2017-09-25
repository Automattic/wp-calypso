/**
 * Internal dependencies
 */
import activity from './activity';
import automatedTransfer from './automated-transfer';
import blogStickers from './blog-stickers';
import comments from './comments';
import commentsTree from './comments-tree';
import media from './media';
import plugins from './plugins';
import posts from './posts';
import simplePayments from './simple-payments';
import { mergeHandlers } from 'state/action-watchers/utils';

export default mergeHandlers(
	activity,
	automatedTransfer,
	blogStickers,
	comments,
	commentsTree,
	media,
	plugins,
	posts,
	simplePayments,
);
