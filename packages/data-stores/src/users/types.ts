export type Member = {
	ID: number | string;
	URL?: string;
	avatar_URL: string;
	email: boolean | string;
	first_name: string;
	invite_key?: string;
	ip_address: boolean | string;
	is_super_admin?: boolean;
	last_name: string;
	login: string;
	name: string;
	nice_name: string;
	profile_URL: string;
	roles?: string[];
	site_ID: number;
	site_visible: boolean;
	linked_user_ID?: boolean | number;
	linked_user_info?: {
		avatar_URL: string;
		name: string;
	};
	date_subscribed?: string;
};

export type UseQuery = {
	hasNextPage: boolean;
	refetch: () => void;
	fetchNextPage: () => void;
	isLoading: boolean;
	isFetchingNextPage: boolean;
};

type UsersQueryData = {
	users: Member[];
	total: number;
	pages: { page: number; users: Member[] }[];
};

export type UsersQuery = {
	data?: UsersQueryData;
} & UseQuery;
