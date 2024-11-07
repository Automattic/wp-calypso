import { Author } from 'calypso/state/comments/actions';

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
	author: Author;
}
