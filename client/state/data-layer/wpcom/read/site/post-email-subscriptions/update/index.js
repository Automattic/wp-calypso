/**
 * External Dependencies
 */
import { get, merge } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { READER_UPDATE_NEW_POST_EMAIL_SUBSCRIPTION } from 'calypso/state/reader/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { updateNewPostEmailSubscription } from 'calypso/state/reader/follows/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { buildBody } from '../utils';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { getReaderFollowForBlog } from 'calypso/state/reader/follows/selectors';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

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
