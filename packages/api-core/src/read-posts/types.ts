export interface ReaderPost {
	ID: number;
	site_ID: number;
	feed_ID: number;
	global_ID: string;
	URL: string;
	title: string;
	content: string;
	excerpt: string;
	date: string;
	author: { ID: number; name: string; URL: string };
	is_following: boolean;
	is_external: boolean;
	is_liked: boolean;
	like_count: number;
	comment_count: number;
	railcar?: unknown;
	_should_reload?: boolean;
	is_error?: boolean;
}
