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
};

export type UseQuery = {
	hasNextPage: boolean;
	refetch: () => void;
	fetchNextPage: () => void;
	isLoading: boolean;
	isFetchingNextPage: boolean;
};
