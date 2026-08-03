import {
	getAliasedSiteSubscriptionFeedUrl,
	getIsSubscribedFromData,
	getSiteSubscriptionByBlogIdFromData,
	getSiteSubscriptionByFeedIdFromData,
	getSubscribedSitesFromData,
	getOrganizationSiteSubscriptionsFromData,
} from '@automattic/api-queries';
import { NO_ORG_ID } from 'calypso/state/reader/organizations/constants';
import { useSiteSubscriptions } from './use-site-subscriptions';
import type { SiteSubscriptionItem } from '@automattic/api-core';

type FollowId = number | string;

type IsFollowingArgs = {
	feedUrl?: string | null;
	feedId?: FollowId | null;
	blogId?: FollowId | null;
};

const hasId = ( id: FollowId | null | undefined ): id is FollowId =>
	typeof id !== 'undefined' && id !== null;

export const useSiteSubscriptionForFeed = ( feedId?: FollowId ) => {
	const { data } = useSiteSubscriptions();

	return hasId( feedId ) ? getSiteSubscriptionByFeedIdFromData( data, feedId ) : undefined;
};

export const useIsSubscribed = ( args: IsFollowingArgs ) => {
	const { data } = useSiteSubscriptions();

	return getIsSubscribedFromData( data, args );
};

export const useIsSubscribedStatus = ( args: IsFollowingArgs ) => {
	const { data, isError, isLoading } = useSiteSubscriptions();

	return {
		isSubscribed: getIsSubscribedFromData( data, args ),
		isError,
		isLoading,
	};
};

export const useAliasedSiteSubscriptionFeedUrl = ( feedUrl: string ) => {
	const { data } = useSiteSubscriptions();

	return getAliasedSiteSubscriptionFeedUrl( data, feedUrl ) ?? feedUrl;
};

export const useSubscribedSites = (): SiteSubscriptionItem[] => {
	const { data } = useSiteSubscriptions();

	return getSubscribedSitesFromData( data, NO_ORG_ID );
};

export const useOrganizationSiteSubscriptions = ( organizationId: number ) => {
	const { data } = useSiteSubscriptions();

	return getOrganizationSiteSubscriptionsFromData( data, organizationId );
};

interface FeedsInfo {
	unseenCount: number;
	feedIds: number[];
	feedUrls: string[];
}

const getFeedsInfo = ( sites: SiteSubscriptionItem[] ): FeedsInfo => ( {
	unseenCount: sites.reduce( ( sum, item ) => sum + ( item.unseen_count ?? 0 ), 0 ),
	feedIds: sites
		.map( ( item ) => ( item.feed_ID ? Number( item.feed_ID ) : null ) )
		.filter( ( id ) => typeof id === 'number' ),
	feedUrls: sites.map( ( item ) => item.feed_URL ).filter( Boolean ),
} );

export const useOrganizationFeedsInfo = ( organizationId: number ) => {
	const sites = useOrganizationSiteSubscriptions( organizationId );

	return getFeedsInfo( sites );
};

export const useSubscribedFeedsInfo = () => {
	const sites = useSubscribedSites();

	return getFeedsInfo( sites );
};

export const useHasSiteSubscriptionOrganization = ( feedId?: FollowId, blogId?: FollowId ) => {
	const { data } = useSiteSubscriptions();
	const feedFollow = hasId( feedId )
		? getSiteSubscriptionByFeedIdFromData( data, feedId )
		: undefined;
	const follow =
		feedFollow ??
		( hasId( blogId ) ? getSiteSubscriptionByBlogIdFromData( data, blogId ) : undefined );

	return !! follow?.organization_id;
};
