import {
	getAliasedFollowFeedUrl,
	getFollowByBlogIdFromData,
	getFollowByFeedIdFromData,
	getFollowedSitesFromData,
	getIsFollowingFromData,
	getOrganizationFollowsFromData,
} from '@automattic/api-queries';
import { NO_ORG_ID } from 'calypso/state/reader/organizations/constants';
import { useFollows } from './use-follows';

type FollowId = number | string;

type IsFollowingArgs = {
	feedUrl?: string | null;
	feedId?: FollowId | null;
	blogId?: FollowId | null;
};

const hasId = ( id: FollowId | null | undefined ): id is FollowId =>
	typeof id !== 'undefined' && id !== null;

export const useFollowForBlog = ( blogId?: FollowId ) => {
	const { data } = useFollows();

	return hasId( blogId ) ? getFollowByBlogIdFromData( data, blogId ) : undefined;
};

export const useFollowForFeed = ( feedId?: FollowId ) => {
	const { data } = useFollows();

	return hasId( feedId ) ? getFollowByFeedIdFromData( data, feedId ) : undefined;
};

export const useIsFollowing = ( args: IsFollowingArgs ) => {
	const { data } = useFollows();

	return getIsFollowingFromData( data, args );
};

export const useAliasedFollowFeedUrl = ( feedUrl: string ) => {
	const { data } = useFollows();

	return getAliasedFollowFeedUrl( data, feedUrl ) ?? feedUrl;
};

export const useFollowedSites = () => {
	const { data } = useFollows();

	return getFollowedSitesFromData( data, NO_ORG_ID );
};

export const useOrganizationFollows = ( organizationId: number ) => {
	const { data } = useFollows();

	return getOrganizationFollowsFromData( data, organizationId );
};

export const useHasFollowOrganization = ( feedId?: FollowId, blogId?: FollowId ) => {
	const { data } = useFollows();
	const feedFollow = hasId( feedId ) ? getFollowByFeedIdFromData( data, feedId ) : undefined;
	const follow =
		feedFollow ?? ( hasId( blogId ) ? getFollowByBlogIdFromData( data, blogId ) : undefined );

	return !! follow?.organization_id;
};
