import { wpcom } from '../wpcom-fetcher';

export interface ListItemTarget {
	owner: string;
	slug: string;
}

export interface AddReadListFeedParams extends ListItemTarget {
	feedId?: number;
	feedUrl?: string;
}

export interface AddReadListFeedResponse {
	feed_id: number;
	[ key: string ]: unknown;
}

export interface AddReadListTagResponse {
	tagId?: number;
	[ key: string ]: unknown;
}

export const addReadListFeed = ( {
	owner,
	slug,
	feedId,
	feedUrl,
}: AddReadListFeedParams ): Promise< AddReadListFeedResponse > => {
	return wpcom.req.post(
		{
			path: `/read/lists/${ encodeURIComponent( owner ) }/${ encodeURIComponent(
				slug
			) }/feeds/new`,
			apiVersion: '1.2',
		},
		{
			feed_id: feedId,
			feed_url: feedUrl,
		}
	);
};

export const deleteReadListFeed = ( {
	owner,
	slug,
	feedId,
}: ListItemTarget & { feedId: number } ): Promise< void > => {
	return wpcom.req.post(
		{
			path: `/read/lists/${ encodeURIComponent( owner ) }/${ encodeURIComponent(
				slug
			) }/feeds/${ feedId }/delete`,
			apiVersion: '1.2',
		},
		{}
	);
};

export const deleteReadListSite = ( {
	owner,
	slug,
	siteId,
}: ListItemTarget & { siteId: number } ): Promise< void > => {
	return wpcom.req.post(
		{
			path: `/read/lists/${ encodeURIComponent( owner ) }/${ encodeURIComponent(
				slug
			) }/sites/${ siteId }/delete`,
			apiVersion: '1.2',
		},
		{}
	);
};

export const addReadListTag = ( {
	owner,
	slug,
	tagSlug,
}: ListItemTarget & { tagSlug: string } ): Promise< AddReadListTagResponse > => {
	return wpcom.req.post(
		{
			path: `/read/lists/${ encodeURIComponent( owner ) }/${ encodeURIComponent( slug ) }/tags/new`,
			apiVersion: '1.2',
		},
		{ tag: tagSlug }
	);
};

export const deleteReadListTag = ( {
	owner,
	slug,
	tagSlug,
}: ListItemTarget & { tagSlug: string } ): Promise< void > => {
	return wpcom.req.post(
		{
			path: `/read/lists/${ encodeURIComponent( owner ) }/${ encodeURIComponent(
				slug
			) }/tags/${ encodeURIComponent( tagSlug ) }/delete`,
			apiVersion: '1.2',
		},
		{}
	);
};
