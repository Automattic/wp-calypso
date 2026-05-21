export interface Post {
	site_name: string;
	postId: number;
	feedId: number;
}

export interface PostItem {
	title?: string;
	excerpt?: string;
	content?: string;
	featured_image?: string;
	site_icon: {
		img: string;
	};
	author: {
		avatar_URL: string;
	};
	site_name?: string;
	site_ID?: number;
}
