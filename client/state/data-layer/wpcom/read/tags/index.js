/** @format */

/**
 * Internal dependencies
 */
import requestFollowHandler from 'state/data-layer/wpcom/read/tags/mine/new';
import requestUnfollowHandler from 'state/data-layer/wpcom/read/tags/mine/delete';
import { mergeHandlers } from 'state/action-watchers/utils';

export default mergeHandlers( requestFollowHandler, requestUnfollowHandler );
