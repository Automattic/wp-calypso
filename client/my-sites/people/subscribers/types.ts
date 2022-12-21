export type Follower = {
	ID: number | string;
	url?: string;
	label: string;
	login: string;
	avatar: string;
	avatar_URL: string;
	date_subscribed: string;
	follow_data?: any;
};

export type FollowersQueryData = {
	followers: Follower[];
	total: number;
};

export type FollowersQuery = {
	data?: FollowersQueryData;
	hasNextPage: boolean;
	refetch: () => void;
	fetchNextPage: () => void;
	isLoading: boolean;
	isFetchingNextPage: boolean;
};
