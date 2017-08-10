/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import activity from './activity';
import automatedTransfer from './automated-transfer';
import blogStickers from './blog-stickers';
import comments from './comments';
import media from './media';
import plugins from './plugins';
import posts from './posts';
import simplePayments from './simple-payments';

export default mergeHandlers(
	activity,
	automatedTransfer,
	blogStickers,
	comments,
	media,
	plugins,
	posts,
	simplePayments
);
