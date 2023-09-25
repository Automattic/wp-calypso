import { Reader } from '@automattic/data-stores';
import { SiteSubscription } from './site-subscription-provider';

export const toSiteSubscription = ( site: Reader.SiteSubscription ): SiteSubscription => ( {
	id: site.ID,
	blogId: site.blog_ID,
	feedId: site.feed_ID,
	url: site.URL,
	dateSubscribed: site.date_subscribed,
	deliveryMethods: site.delivery_methods,
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
