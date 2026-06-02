import type {
	FollowApiDeliveryMethods,
	FollowApiSubscription,
	FollowDeliveryMethods,
	SiteSubscriptionItem,
	SiteSubscriptionsApiResponse,
	SiteSubscriptionsPage,
} from './types';

export const commonFeedExtensions = [ 'rss', 'rss.xml', 'feed', 'feed/atom', 'atom.xml', 'atom' ];

const untrailingslashit = ( url: string ): string => url.replace( /\/$/, '' );

const toValidId = ( id: string | number | null | undefined ): number | null | undefined => {
	if ( id === null || typeof id === 'undefined' ) {
		return id;
	}
	const numeric = Number( id );
	return Number.isFinite( numeric ) && numeric > 0 ? numeric : null;
};

const toDate = ( date?: string ): Date => {
	const timestamp = date ? Date.parse( date ) : NaN;
	return Number.isNaN( timestamp ) ? new Date( 0 ) : new Date( timestamp );
};

const normalizeDeliveryMethods = (
	deliveryMethods?: FollowApiDeliveryMethods
): FollowDeliveryMethods => ( {
	...( deliveryMethods?.email
		? {
				email: {
					...deliveryMethods.email,
					date_subscribed: deliveryMethods.email.date_subscribed
						? toDate( deliveryMethods.email.date_subscribed )
						: undefined,
					send_posts: deliveryMethods.email.send_posts ?? false,
				},
		  }
		: {} ),
	...( deliveryMethods?.notification
		? {
				notification: deliveryMethods.notification,
		  }
		: {} ),
} );

export const prepareComparableUrl = ( url?: string | null ): string | undefined => {
	const preparedUrl = url ? untrailingslashit( url ) : url;
	return preparedUrl?.replace( /^https?:\/\//i, '' ).toLowerCase();
};

export const adaptSiteSubscription = (
	subscription: FollowApiSubscription
): SiteSubscriptionItem => ( {
	ID: toValidId( subscription.ID ) ?? undefined,
	URL: subscription.URL,
	feed_URL: subscription.URL,
	blog_ID: toValidId( subscription.blog_ID ) ?? null,
	feed_ID: toValidId( subscription.feed_ID ) ?? null,
	date_subscribed: toDate( subscription.date_subscribed ),
	last_updated: toDate( subscription.last_updated ),
	delivery_methods: normalizeDeliveryMethods( subscription.delivery_methods ),
	is_owner: subscription.is_owner ?? false,
	organization_id: subscription.organization_id ?? null,
	name: subscription.name ?? '',
	unseen_count: subscription.unseen_count ?? 0,
	site_icon: subscription.site_icon ?? '',
	is_following: true,
	is_paid_subscription: subscription.is_paid_subscription ?? false,
	is_wpforteams_site: subscription.is_wpforteams_site ?? false,
	is_rss: subscription.is_rss ?? false,
	meta: subscription.meta ?? {
		links: {
			site: '',
			feed: '',
		},
	},
	is_comp: subscription.is_comp ?? false,
	comp_id: subscription.comp_id,
	isDeleted: false,
	resubscribed: false,
} );

export const adaptSiteSubscriptionsResponse = (
	response: SiteSubscriptionsApiResponse
): SiteSubscriptionsPage => ( {
	subscriptions: Array.isArray( response.subscriptions )
		? response.subscriptions.map( adaptSiteSubscription )
		: [],
	totalCount:
		response.page === 1 || response.number > 0 ? response.total_subscriptions ?? null : null,
	page: response.page,
	number: response.number,
} );

export const sortSiteSubscriptionsByLastUpdated = (
	a: Pick< SiteSubscriptionItem, 'last_updated' | 'name' >,
	b: Pick< SiteSubscriptionItem, 'last_updated' | 'name' >
): number => {
	const updatedA =
		a.last_updated instanceof Date && ! isNaN( a.last_updated.valueOf() )
			? a.last_updated.valueOf()
			: 0;
	const updatedB =
		b.last_updated instanceof Date && ! isNaN( b.last_updated.valueOf() )
			? b.last_updated.valueOf()
			: 0;
	if ( updatedA < updatedB ) {
		return 1;
	}
	if ( updatedA > updatedB ) {
		return -1;
	}
	return ( a.name ?? '' ).toLowerCase().localeCompare( ( b.name ?? '' ).toLowerCase() );
};
