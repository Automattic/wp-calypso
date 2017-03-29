/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { READER_UNFOLLOW_TAG_REQUEST } from 'state/action-types';
import {
	receiveUnfollowTag as receiveUnfollowTagAction,
} from 'state/reader/tags/items/actions';

import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice } from 'state/notices/actions';
import { translate } from 'i18n-calypso';
import { createWpcomHttpMiddleware } from 'state/data-layer/wpcom-http/utils';


export const mapActionToHttp = action => http( {
	path: `/read/tags/${ action.payload.slug }/mine/delete`,
	method: 'POST',
	apiVersion: '1.1',
	onSuccess: action,
	onFailure: action,
} );

export const isValidResponse = apiResponse =>
	apiResponse && apiResponse.removed_tag && ! apiResponse.subscribed;

export const mapSuccessfulResponseToActions = ( { apiResponse } ) => [
	receiveUnfollowTagAction( apiResponse.removed_tag ),
];

export const mapFailureResponseToActions = ( { action } ) => {
	const errorNoticeText = translate( 'Could not unfollow tag: %(tag)s', {
		args: { tag: action.payload.slug }
	} );

	return [
		errorNotice( errorNoticeText ),
	];
};

export default createWpcomHttpMiddleware( {
	type: READER_UNFOLLOW_TAG_REQUEST,
	mapActionToHttp,
	isValidResponse,
	mapSuccessfulResponseToActions,
	mapFailureResponseToActions,
} );
