/** @format */
/**
 * External Dependencies
 */
import { get, merge } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { READER_UPDATE_NEW_POST_EMAIL_SUBSCRIPTION } from 'client/state/action-types';
import { http } from 'client/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'client/state/data-layer/wpcom-http/utils';
import { updateNewPostEmailSubscription } from 'client/state/reader/follows/actions';
import { errorNotice } from 'client/state/notices/actions';
import { getReaderFollowForBlog } from 'client/state/selectors';
import { buildBody } from '../utils';
import { bypassDataLayer } from 'client/state/data-layer/utils';

export function requestUpdatePostEmailSubscription( { dispatch, getState }, action ) {
	const actionWithRevert = merge( {}, action, {
		meta: {
			previousState: get( getReaderFollowForBlog( getState(), action.payload.blogId ), [
				'delivery_frequency',
				'email',
				'post_delivery_frequency',
			] ),
		},
	} );
	dispatch(
		http( {
			method: 'POST',
			path: `/read/site/${ action.payload.blogId }/post_email_subscriptions/update`,
			apiVersion: '1.2',
			body: buildBody( get( action, [ 'payload', 'deliveryFrequency' ] ) ),
			onSuccess: actionWithRevert,
			onFailure: actionWithRevert,
		} )
	);
}

export function receiveUpdatePostEmailSubscription( store, action, response ) {
	if ( ! ( response && response.success ) ) {
		// revert
		receiveUpdatePostEmailSubscriptionError( store, action );
	}
}

export function receiveUpdatePostEmailSubscriptionError(
	{ dispatch },
	{ payload: { blogId }, meta: { previousState } }
) {
	dispatch(
		errorNotice(
			translate( 'Sorry, we had a problem updating that subscription. Please try again.' )
		)
	);
	dispatch( bypassDataLayer( updateNewPostEmailSubscription( blogId, previousState ) ) );
}

export default {
	[ READER_UPDATE_NEW_POST_EMAIL_SUBSCRIPTION ]: [
		dispatchRequest(
			requestUpdatePostEmailSubscription,
			receiveUpdatePostEmailSubscription,
			receiveUpdatePostEmailSubscriptionError
		),
	],
};
