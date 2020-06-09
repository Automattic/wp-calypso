export type Item = {
	id: string;
	feed_ID: number | null;
	tag_ID: number | null;
	site_ID: number | null;
	[ propName: string ]: string | number | null;
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
