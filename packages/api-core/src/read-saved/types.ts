export type ReadSavedSource = 'reader-web';

/**
 * Identifies a saved post: a WordPress.com post by `blog_id` + `post_id`, or an
 * RSS post by its feed item ID. The API stores a feed item that belongs to a
 * WordPress.com post under its `blog_id` + `post_id`, so one post never has two keys.
 */
export type ReadSavedKey = { blog_id: number; post_id: number } | { feed_item_id: number };

export type ReadSavedKeyEntry = ReadSavedKey & {
	/** ISO 8601 GMT date the post was saved. */
	date_saved: string;
};

/**
 * Response shape for `GET /wpcom/v2/read/saved/keys`: every saved key, newest
 * first, capped at 1,000.
 */
export interface ReadSavedKeysResponse {
	keys: ReadSavedKeyEntry[];
	total: number;
}

/**
 * Params for `POST /wpcom/v2/read/saved/new` and `POST /wpcom/v2/read/saved/delete`.
 */
export interface ReadSavedPostParams {
	key: ReadSavedKey;
	source: ReadSavedSource;
}

/**
 * Response shape for `POST /wpcom/v2/read/saved/new` and `POST /wpcom/v2/read/saved/delete`.
 * `key` is the key the API stored, which can differ from the one sent.
 */
export interface ReadSavedPostResponse {
	saved: boolean;
	key: ReadSavedKey;
	total: number;
}
