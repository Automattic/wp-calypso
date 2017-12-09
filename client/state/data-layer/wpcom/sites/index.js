/** @format */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'state/action-watchers/utils';
import config from 'config';
import activity from './activity';
import automatedTransfer from './automated-transfer';
import blogStickers from './blog-stickers';
import commentCounts from './comment-counts';
import comments from './comments';
import commentsTree from './comments-tree';
import jitm from './jitm';
import media from './media';
import plugins from './plugins';
import posts from './posts';
import rewind from './rewind';
import simplePayments from './simple-payments';

export default mergeHandlers(
	activity,
	automatedTransfer,
	blogStickers,
	commentCounts,
	comments,
	commentsTree,
	config.isEnabled( 'jitms' ) ? jitm : null,
	media,
	plugins,
	posts,
	rewind,
	simplePayments
);
