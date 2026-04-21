export interface PostKey {
	blogId?: number;
	feedId?: number;
	postId: number;
}

export interface SavedPostItem {
	postKey: PostKey;
	savedAt: string;
	position: number;
	isRead: boolean;
}

export interface SavedPostsState {
	items: SavedPostItem[];
	isLoading: boolean;
	error: string | null;
}
