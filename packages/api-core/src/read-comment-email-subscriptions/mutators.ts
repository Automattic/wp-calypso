import { wpcom } from '../wpcom-fetcher';
import type {
	UpdateSiteCommentEmailSubscriptionParams,
	UpdateSiteCommentEmailSubscriptionResponse,
	DeletePostCommentEmailSubscriptionParams,
	DeletePostCommentEmailSubscriptionResponse,
} from './types';

export async function updateSiteCommentEmailSubscription(
	params: UpdateSiteCommentEmailSubscriptionParams
): Promise< UpdateSiteCommentEmailSubscriptionResponse > {
	if ( ! params.blog_id || typeof params.send_comments !== 'boolean' ) {
		throw new Error( 'Something went wrong while changing the "Email me new comments" setting.' );
	}

	const action = params.send_comments ? 'new' : 'delete';

	const response = await wpcom.req.post( {
		path: `/read/site/${ params.blog_id }/comment_email_subscriptions/${ action }`,
		apiVersion: '1.2',
	} );

	if ( ! response.success ) {
		throw new Error( 'Something went wrong while changing the "Email me comments posts" setting.' );
	}

	return response;
}

export async function deletePostCommentEmailSubscription(
	params: DeletePostCommentEmailSubscriptionParams
): Promise< DeletePostCommentEmailSubscriptionResponse > {
	if ( ! params.blog_id ) {
		throw new Error( 'Something went wrong while unsubscribing.' );
	}

	const response = await wpcom.req.post( {
		path: `/read/site/${ params.blog_id }/comment_email_subscriptions/delete?post_id=${ params.post_id }`,
		apiVersion: '1.2',
	} );

	if ( ! response.success ) {
		throw new Error( 'Something went wrong while unsubscribing.' );
	}

	return response;
}
