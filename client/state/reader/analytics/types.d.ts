export interface TrackPostData {
	blog_id: number;
	post_id: number;
	feed_id: number;
	feed_item_id: number;
	railcar: Record< string, unknown >;
	is_external: boolean;
	site_ID: number;
	ID: number;
	feed_ID: number;
	feed_item_ID: number;
	is_jetpack: boolean;
	railcar?: Record< string, unknown >;
}
