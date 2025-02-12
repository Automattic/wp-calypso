export type List = {
	ID: number;
	description: string;
	is_public: boolean;
	is_owner: boolean;
	owner: string;
	slug: string;
	title: string;
};

export type Item = {
	id: string;
	feed_ID: number | null;
	tag_ID: number | null;
	site_ID: number | null;
	meta: {
		data?: {
			site?: Site;
			feed?: Feed;
			tag?: { tag: Tag };
		};
		links?: {
			site?: string;
			feed?: string;
			tag?: string;
		};
	};
	[ propName: string ]: string | number | Record< string, unknown > | null;
};

export type Feed = {
	feed_ID: number;
	blog_ID: number;
	name: string;
	URL: string;
	feed_URL: string;
	is_following: boolean;
	subscribers_count: number;
	description: string | null;
	last_update: string | null;
	image: string | null | undefined;
	organization_id: number;
	unseen_count: number;
};

export type FeedError = {
	error_data: {
		no_such_feed: 404;
	};
	errors: {
		no_such_feed: string[];
	};
};

export type Site = {
	ID: number;
	URL: string;
	description: string;
	feed_ID: number;
	feed_URL: string;
	icon: {
		img: string;
		ico: string;
	};
	is_private: boolean;
	name: string;
	slug: string;
	title: string;
};

export type SiteError = {
	error_data: {
		site_gone: 410;
	};
	errors: {
		site_gone: string[];
	};
};

export type Tag = {
	ID: number;
	URL: string;
	display_name: string;
	slug: string;
	title: string;
};
