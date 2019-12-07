/** @format */
/**
 * External Dependencies
 */
import { get, merge } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { READER_UPDATE_NEW_POST_EMAIL_SUBSCRIPTION } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { updateNewPostEmailSubscription } from 'state/reader/follows/actions';
import { errorNotice } from 'state/notices/actions';
import { buildBody } from '../utils';
import { bypassDataLayer } from 'state/data-layer/utils';
import getReaderFollowForBlog from 'state/selectors/get-reader-follow-for-blog';

import { registerHandlers } from 'state/data-layer/handler-registry';

export function requestUpdatePostEmailSubscription( action ) {
	return ( dispatch, getState ) => {
		const actionWithRevert = merge( {}, action, {
			meta: {
				previousState: get( getReaderFollowForBlog( getState(), action.payload.blogId ), [
					'delivery_methods',
					'email',
					'post_delivery_frequency',
				] ),
			},
		} );
		dispatch(
			http(
				{
					method: 'POST',
					path: `/read/site/${ action.payload.blogId }/post_email_subscriptions/update`,
					apiVersion: '1.2',
					body: buildBody( get( action, [ 'payload', 'deliveryFrequency' ] ) ),
				},
				actionWithRevert
			)
		);
	};
}

export function receiveUpdatePostEmailSubscription( action, response ) {
	if ( ! ( response && response.success ) ) {
		// revert
		return receiveUpdatePostEmailSubscriptionError( action );
	}
}

export function receiveUpdatePostEmailSubscriptionError( {
	payload: { blogId },
	meta: { previousState },
} ) {
	return [
		errorNotice(
			translate( 'Sorry, we had a problem updating that subscription. Please try again.' )
		),
		bypassDataLayer( updateNewPostEmailSubscription( blogId, previousState ) ),
	];
}

registerHandlers( 'state/data-layer/wpcom/read/site/post-email-subscriptions/update/index.js', {
	[ READER_UPDATE_NEW_POST_EMAIL_SUBSCRIPTION ]: [
		dispatchRequest( {
			fetch: requestUpdatePostEmailSubscription,
			onSuccess: receiveUpdatePostEmailSubscription,
			onError: receiveUpdatePostEmailSubscriptionError,
		} ),
	],
} );
