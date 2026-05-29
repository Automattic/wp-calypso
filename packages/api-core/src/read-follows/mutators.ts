import { wpcom } from '../wpcom-fetcher';
import { adaptFollow } from './adapters';
import type {
	FollowDeliveryParams,
	FollowItem,
	FollowSiteParams,
	FollowSiteResponse,
	UnfollowSiteParams,
	UnfollowSiteResponse,
} from './types';

const buildDeliveryFrequencyBody = ( frequency?: string ) =>
	[ 'instantly', 'daily', 'weekly' ].includes( frequency ?? '' )
		? { delivery_frequency: frequency }
		: {};

function assertBoolean( value: unknown, name: string ): asserts value is boolean {
	if ( typeof value !== 'boolean' ) {
		throw new Error( `${ name } must be a boolean` );
	}
}

function assertDeliveryFrequency(
	frequency: unknown
): asserts frequency is NonNullable< FollowDeliveryParams[ 'deliveryFrequency' ] > {
	if ( ! [ 'instantly', 'daily', 'weekly' ].includes( String( frequency ) ) ) {
		throw new Error( 'deliveryFrequency must be one of instantly, daily, or weekly' );
	}
}

const isValidId = ( id?: number | string ): id is number | string => {
	if ( typeof id === 'number' ) {
		return Number.isInteger( id ) && id >= 0;
	}
	if ( typeof id === 'string' ) {
		return /^[0-9]+$/.test( id ) && Number.isInteger( Number( id ) );
	}
	return false;
};

const buildFollowMutationBody = (
	{ feedUrl, source, subscriptionId, emailId, blogId }: FollowSiteParams | UnfollowSiteParams,
	action: 'follow' | 'unfollow'
) => {
	const isSubscriptionIdValid = isValidId( subscriptionId );
	if ( ! isSubscriptionIdValid && ! feedUrl ) {
		throw new Error( `Subscription ID or URL is required to ${ action }` );
	}

	return {
		source,
		...( isSubscriptionIdValid ? { sub_id: subscriptionId } : { url: feedUrl } ),
		...( typeof emailId === 'undefined' ? {} : { email_id: emailId } ),
		...( typeof blogId === 'undefined' ? {} : { blog_id: blogId } ),
	};
};

export const followSite = async ( {
	feedUrl,
	source,
	subscriptionId,
	emailId,
	blogId,
}: FollowSiteParams ): Promise< FollowItem > => {
	const response: FollowSiteResponse = await wpcom.req.post( {
		path: '/read/following/mine/new',
		apiVersion: '1.1',
		body: buildFollowMutationBody( { feedUrl, source, subscriptionId, emailId, blogId }, 'follow' ),
	} );

	if ( ! response?.subscribed || ! response.subscription ) {
		const error = new Error( 'Follow request failed' ) as Error & {
			info?: unknown;
			response?: FollowSiteResponse;
		};
		error.info = response?.info;
		error.response = response;
		throw error;
	}

	return adaptFollow( response.subscription );
};

export const unfollowSite = async ( {
	feedUrl,
	source,
	subscriptionId,
	emailId,
	blogId,
}: UnfollowSiteParams ): Promise< UnfollowSiteResponse > => {
	const response: UnfollowSiteResponse = await wpcom.req.post( {
		path: '/read/following/mine/delete',
		apiVersion: '1.1',
		body: buildFollowMutationBody(
			{ feedUrl, source, subscriptionId, emailId, blogId },
			'unfollow'
		),
	} );
	if ( response?.subscribed !== false ) {
		throw new Error( 'Unfollow request did not unsubscribe' );
	}
	return response;
};

export const updateSitePostEmailSubscription = async ( {
	blogId,
	sendPosts,
	deliveryFrequency,
}: FollowDeliveryParams ) => {
	assertBoolean( sendPosts, 'sendPosts' );

	return wpcom.req.post( {
		path: `/read/site/${ blogId }/post_email_subscriptions/${ sendPosts ? 'new' : 'delete' }`,
		apiVersion: '1.2',
		body: sendPosts ? buildDeliveryFrequencyBody( deliveryFrequency ) : {},
	} );
};

export const updateSiteCommentEmailSubscription = async ( {
	blogId,
	sendComments,
}: FollowDeliveryParams ) => {
	assertBoolean( sendComments, 'sendComments' );

	return wpcom.req.post( {
		path: `/read/site/${ blogId }/comment_email_subscriptions/${ sendComments ? 'new' : 'delete' }`,
		apiVersion: '1.2',
		body: {},
	} );
};

export const updateSitePostEmailDeliveryFrequency = async ( {
	blogId,
	deliveryFrequency,
}: FollowDeliveryParams ) => {
	assertDeliveryFrequency( deliveryFrequency );

	return wpcom.req.post( {
		path: `/read/site/${ blogId }/post_email_subscriptions/update`,
		apiVersion: '1.2',
		body: buildDeliveryFrequencyBody( deliveryFrequency ),
	} );
};

export const updateSitePostNotificationSubscription = async ( {
	blogId,
	sendPosts,
}: FollowDeliveryParams ) => {
	assertBoolean( sendPosts, 'sendPosts' );

	return wpcom.req.post( {
		path: `/read/sites/${ blogId }/notification-subscriptions/${ sendPosts ? 'new' : 'delete' }`,
		apiNamespace: 'wpcom/v2',
		body: {},
	} );
};
