export type ReadSeenPostsSource = 'reader-web';

/**
 * Response shape for every `/seen-posts/seen/*` endpoint.
 */
export interface ReadSeenPostsResponse {
	status: boolean;
}

/**
 * Params for marking individual feed posts as seen or unseen.
 * Endpoints: `/seen-posts/seen/new`, `/seen-posts/seen/delete`.
 */
export interface ReadSeenPostsFeedParams {
	feedId: number;
	feedItemIds: number[];
	source: ReadSeenPostsSource;
}

/**
 * Params for marking individual blog posts as seen or unseen.
 * Endpoints: `/seen-posts/seen/blog/new`, `/seen-posts/seen/blog/delete`.
 */
export interface ReadSeenPostsBlogParams {
	blogId: number;
	postIds: number[];
	source: ReadSeenPostsSource;
}

/**
 * Params for marking all posts across given feeds as seen.
 * Endpoint: `/seen-posts/seen/all/new`.
 */
export interface ReadSeenPostsAllParams {
	feedIds: number[];
	source: ReadSeenPostsSource;
}
