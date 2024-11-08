export interface ReaderPost {
	site_name: string;
	postId: number;
	blogId: number;
}

export interface PostItem {
	title: string;
	featured_image: string;
	site_icon: {
		img: string;
	};
	author: {
		avatar_URL: string;
	};
}
