import { UserData as User } from 'calypso/lib/user/user';

export type UsersQueryData = {
	users: User[];
	total: number;
};

export type UsersQuery = {
	data?: UsersQueryData;
	hasNextPage: boolean;
	refetch: () => void;
	fetchNextPage: () => void;
	isFetchingNextPage: boolean;
};
