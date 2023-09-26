import { Reader } from '@automattic/data-stores';
import { SiteSubscription } from 'calypso/reader/contexts/SiteSubscriptionContext';
import { SiteSubscriptionDeliveryMethods } from 'calypso/reader/contexts/SiteSubscriptionContext/types';

export const toDeliveryMethods = (
	deliveryMethods: Reader.SiteSubscriptionDeliveryMethods
): SiteSubscriptionDeliveryMethods => ( {
	email: {
		sendPosts: Boolean( deliveryMethods.email?.send_posts ),
		sendComments: deliveryMethods.email?.send_comments,
		postDeliverFrequency:
			deliveryMethods.email?.post_delivery_frequency || Reader.EmailDeliveryFrequency.Instantly,
		dateSubscribed: deliveryMethods.email?.date_subscribed,
	},
	notification: {
		sendPosts: Boolean( deliveryMethods.notification?.send_posts ),
	},
} );

export const toSiteSubscription = ( site: Reader.SiteSubscription ): SiteSubscription => ( {
	id: Number( site.ID ),
	blogId: Reader.isValidId( site.blog_ID ) ? Number( site.blog_ID ) : undefined,
	feedId: Number( site.feed_ID ),
	url: site.URL,
	dateSubscribed: site.date_subscribed.toISOString(), // TODO
	deliveryMethods: toDeliveryMethods( site.delivery_methods ),
	name: site.name,
	organizationId: site.organization_id,
	unseenCount: site.unseen_count,
	lastUpdated: site.last_updated,
	siteIcon: site.site_icon,
	isOwner: site.is_owner,
	meta: site.meta,
	isWpForTeamsSite: site.is_wpforteams_site,
	isPaidSubscription: site.is_paid_subscription,
	isDeleted: site.isDeleted,
} );
