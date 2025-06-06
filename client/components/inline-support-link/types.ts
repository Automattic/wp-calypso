export type ContextLink = {
	link: string;
	post_id: number;
	blog_id?: number;
};

export type ContextLinks = Record< string, ContextLink >;

export type SupportDocData = {
	link: string;
	postId: number;
	blogId?: number;
};
