// Feel free to adjust the type, if you find out a discrepancy between what the `/read/feed/${ encodeURIComponent( action.payload.ID ) }` endpoint returns and the type definition below
export type Feed = {
	URL: string;
	blog_ID: number;
	description: string;
	feed_ID: number;
	feed_URL: string;
	image: string;
	is_following: boolean;
	last_update: string;
	name: string;
	organization_id: number;
	subscribers_count: number;
	unseen_count: number;
};
