import type { FollowApiSubscription, FollowItem, FollowsApiResponse, FollowsPage } from './types';

export const commonFeedExtensions = [ 'rss', 'rss.xml', 'feed', 'feed/atom', 'atom.xml', 'atom' ];

const untrailingslashit = ( url: string ): string => url.replace( /\/$/, '' );

const toValidId = ( id: string | number | null | undefined ): number | null | undefined => {
	if ( id === null || typeof id === 'undefined' ) {
		return id;
	}
	const numeric = Number( id );
	return Number.isFinite( numeric ) && numeric > 0 ? numeric : null;
};

export const prepareComparableUrl = ( url?: string | null ): string | undefined => {
	const preparedUrl = url ? untrailingslashit( url ) : url;
	return preparedUrl?.replace( /^https?:\/\//, '' ).toLowerCase();
};

export const adaptFollow = ( subscription: FollowApiSubscription ): FollowItem => ( {
	ID: toValidId( subscription.ID ) ?? undefined,
	URL: subscription.URL,
	feed_URL: subscription.URL,
	blog_ID: toValidId( subscription.blog_ID ),
	feed_ID: toValidId( subscription.feed_ID ),
	date_subscribed: subscription.date_subscribed
		? Date.parse( subscription.date_subscribed )
		: undefined,
	last_updated: subscription.last_updated ? Date.parse( subscription.last_updated ) : undefined,
	delivery_methods: subscription.delivery_methods,
	is_owner: subscription.is_owner,
	organization_id: subscription.organization_id,
	name: subscription.name,
	unseen_count: subscription.unseen_count,
	site_icon: subscription.site_icon,
	is_following: true,
	is_paid_subscription: subscription.is_paid_subscription,
	is_wpforteams_site: subscription.is_wpforteams_site,
	is_rss: subscription.is_rss,
	meta: subscription.meta,
	is_comp: subscription.is_comp,
	comp_id: subscription.comp_id,
} );

export const adaptFollowsResponse = ( response: FollowsApiResponse ): FollowsPage => ( {
	follows: Array.isArray( response.subscriptions ) ? response.subscriptions.map( adaptFollow ) : [],
	totalCount:
		response.page === 1 || response.number > 0 ? response.total_subscriptions ?? null : null,
	page: response.page,
	number: response.number,
} );

export const sortFollowsByLastUpdated = (
	a: Pick< FollowItem, 'last_updated' | 'name' >,
	b: Pick< FollowItem, 'last_updated' | 'name' >
): number => {
	const updatedA =
		typeof a.last_updated === 'number' && ! isNaN( a.last_updated ) ? a.last_updated : 0;
	const updatedB =
		typeof b.last_updated === 'number' && ! isNaN( b.last_updated ) ? b.last_updated : 0;
	if ( updatedA < updatedB ) {
		return 1;
	}
	if ( updatedA > updatedB ) {
		return -1;
	}
	return ( a.name ?? '' ).toLowerCase().localeCompare( ( b.name ?? '' ).toLowerCase() );
};
