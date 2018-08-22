/** @format */

/**
 * Internal dependencies
 */
import automatedTransfer from './automated-transfer';
import blogStickers from './blog-stickers';
import commentCounts from './comment-counts';
import comments from './comments';
import commentsTree from './comments-tree';
import jitm from './jitm';
import media from './media';
import memberships from './memberships';
import option from './option';
import planTransfer from './plan-transfer';
import plugins from './plugins';
import posts from './posts';
import postTypes from './post-types';
import simplePayments from './simple-payments';
import statsGoogleMyBusiness from './stats/google-my-business';
import users from './users';
import { isEnabled } from 'config';
import { mergeHandlers } from 'state/action-watchers/utils';

export default mergeHandlers(
	automatedTransfer,
	blogStickers,
	commentCounts,
	comments,
	commentsTree,
	isEnabled( 'jitms' ) ? jitm : null,
	isEnabled( 'memberships' ) ? memberships : null,
	media,
	option,
	planTransfer,
	plugins,
	posts,
	postTypes,
	simplePayments,
	statsGoogleMyBusiness,
	users
);
