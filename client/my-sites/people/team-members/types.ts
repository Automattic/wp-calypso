import User from 'calypso/components/user';

export type UsersQueryData = {
	users: User[];
	total: number;
};

export type UsersQuery = {
	data?: UsersQueryData;
	fetchNextPage: () => void;
	isFetchingNextPage: boolean;
	hasNextPage: boolean;
};
